import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Layout, LayoutDocument } from '../../schemas/layout.schema';
import { StallType, StallTypeDocument } from '../../schemas/stall-type.schema';
import { FixtureType, FixtureTypeDocument } from '../../schemas/fixture-type.schema';
import { Exhibition, ExhibitionDocument } from '../../schemas/exhibition.schema';
import { 
  CreateLayoutDto, 
  UpdateLayoutDto, 
  CreateSpaceDto, 
  UpdateSpaceDto,
  CreateHallDto,
  UpdateHallDto,
  CreateStallDto,
  UpdateStallDto,
  CreateFixtureDto,
  UpdateFixtureDto,
  BulkCreateStallsDto,
  BulkUpdateStallsDto
} from '../../dto/layout.dto';

@Injectable()
export class LayoutService {
  constructor(
    @InjectModel(Layout.name) private layoutModel: Model<LayoutDocument>,
    @InjectModel(StallType.name) private stallTypeModel: Model<StallTypeDocument>,
    @InjectModel(FixtureType.name) private fixtureTypeModel: Model<FixtureTypeDocument>,
    @InjectModel(Exhibition.name) private exhibitionModel: Model<ExhibitionDocument>,
  ) {}

  // Helper method to resolve exhibition identifier (slug or ID) to exhibition object
  private async resolveExhibition(exhibitionIdentifier: string) {
    // Check if it's a MongoDB ObjectId format
    if (/^[0-9a-fA-F]{24}$/.test(exhibitionIdentifier)) {
      // It's an ObjectId, fetch by ID
      const exhibition = await this.exhibitionModel.findById(exhibitionIdentifier);
      if (!exhibition) {
        throw new NotFoundException(`Exhibition not found: ${exhibitionIdentifier}`);
      }
      return exhibition;
    } else {
      // It's likely a slug, fetch by slug
      const exhibition = await this.exhibitionModel.findOne({ 
        slug: exhibitionIdentifier, 
        isDeleted: { $ne: true } 
      });
      if (!exhibition) {
        throw new NotFoundException(`Exhibition not found: ${exhibitionIdentifier}`);
      }
      return exhibition;
    }
  }

  // Layout CRUD Operations
  async createLayout(createLayoutDto: CreateLayoutDto, userId: string): Promise<Layout> {
    // Check if exhibition exists
    const exhibition = await this.exhibitionModel.findById(createLayoutDto.exhibitionId);
    if (!exhibition) {
      throw new NotFoundException(`Exhibition with ID ${createLayoutDto.exhibitionId} not found`);
    }

    // Check if layout already exists for this exhibition
    const existingLayout = await this.layoutModel.findOne({ exhibitionId: createLayoutDto.exhibitionId });
    if (existingLayout) {
      throw new ConflictException('Layout already exists for this exhibition');
    }

    // Create default canvas settings if not provided
    const defaultCanvasSettings = {
      size: { width: 1200, height: 800 },
      backgroundColor: '#f5f5f5',
      grid: {
        enabled: true,
        size: 20,
        color: '#e0e0e0',
        opacity: 0.5
      },
      zoom: {
        min: 0.1,
        max: 5,
        default: 1,
        current: 1
      }
    };

    const defaultLayoutSettings = {
      snapToGrid: true,
      showGuides: true,
      autoSave: true
    };

    // Process spaces and their nested halls/stalls
    const processedSpaces = await this.processSpaces(createLayoutDto.spaces || []);
    
    // Process fixtures
    const processedFixtures = await this.processFixtures(createLayoutDto.fixtures || []);

    const layoutData = {
      ...createLayoutDto,
      exhibitionId: new Types.ObjectId(createLayoutDto.exhibitionId),
      canvas: createLayoutDto.canvas || defaultCanvasSettings,
      settings: createLayoutDto.settings || defaultLayoutSettings,
      spaces: processedSpaces,
      fixtures: processedFixtures,
      createdBy: new Types.ObjectId(userId),
      version: 1
    };

    const layout = new this.layoutModel(layoutData);
    return await layout.save();
  }

  async getLayoutByExhibitionId(exhibitionIdentifier: string): Promise<Layout> {
    // First, resolve the exhibition identifier (could be slug or ID) to get the actual exhibition
    let exhibition;
    
    // Check if it's a MongoDB ObjectId format
    if (/^[0-9a-fA-F]{24}$/.test(exhibitionIdentifier)) {
      // It's an ObjectId, fetch by ID
      exhibition = await this.exhibitionModel.findById(exhibitionIdentifier);
    } else {
      // It's likely a slug, fetch by slug
      exhibition = await this.exhibitionModel.findOne({ 
        slug: exhibitionIdentifier, 
        isDeleted: { $ne: true } 
      });
    }

    if (!exhibition) {
      throw new NotFoundException(`Exhibition not found: ${exhibitionIdentifier}`);
    }

    // Now fetch the layout using the resolved exhibition ID
    const layout = await this.layoutModel
      .findOne({ exhibitionId: exhibition._id, isActive: true })
      .populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ]);

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionIdentifier}`);
    }

    // CRITICAL FIX: Transform layout to include stallType information for frontend
    const layoutObj = layout.toObject();
    
    // Get all unique stallType IDs from the layout
    const stallTypeIds = new Set();
    for (const space of layoutObj.spaces || []) {
      for (const hall of space.halls || []) {
        for (const stall of hall.stalls || []) {
          if (stall.stallType) {
            stallTypeIds.add(stall.stallType.toString());
          }
        }
      }
    }

    // Fetch stallType details
    const stallTypes = await this.stallTypeModel.find({
      _id: { $in: Array.from(stallTypeIds) }
    });

    // Create a map for quick lookup
    const stallTypeMap = new Map();
    stallTypes.forEach(st => {
      stallTypeMap.set(st._id.toString(), {
        _id: st._id,
        name: st.name,
        category: st.category,
        defaultRate: st.defaultRate,
        rateType: st.rateType,
        color: st.color
      });
    });

    // Add stallType info and ensure proper data structure
    for (const space of layoutObj.spaces || []) {
      for (const hall of space.halls || []) {
        for (const stall of hall.stalls || []) {
          const stallAny = stall as any; // Type cast for adding properties
          
          if (stallAny.stallType) {
            const stallTypeInfo = stallTypeMap.get(stallAny.stallType.toString());
            if (stallTypeInfo) {
              // Add stallType info for frontend
              stallAny.stallTypeName = stallTypeInfo.name;
              stallAny.stallTypeCategory = stallTypeInfo.category;
              stallAny.stallTypeColor = stallTypeInfo.color;
            }
          }
          
          // Ensure dimensions are in meters (they should already be converted in backend)
          if (!stallAny.dimensions && stallAny.size) {
            stallAny.dimensions = {
              width: stallAny.size.width / 50, // Convert from pixels to meters
              height: stallAny.size.height / 50,
              shapeType: 'rectangle'
            };
          }
        }
      }
    }

    return layoutObj as Layout;
  }

  async updateLayout(exhibitionIdentifier: string, updateLayoutDto: UpdateLayoutDto, userId: string): Promise<Layout> {
    try {
      // Resolve the exhibition identifier (could be slug or ID) to get the actual exhibition
      const exhibition = await this.resolveExhibition(exhibitionIdentifier);

      // Now find the layout using the resolved exhibition ID
      const layout = await this.layoutModel.findOne({ 
        exhibitionId: exhibition._id,
        isActive: true 
      });

      if (!layout) {
        throw new NotFoundException(`Layout not found for exhibition ${exhibitionIdentifier}`);
      }

      // Process spaces and fixtures if provided
      if (updateLayoutDto.spaces) {
        layout.spaces = await this.processSpaces(updateLayoutDto.spaces);
      }

      if (updateLayoutDto.fixtures) {
        layout.fixtures = await this.processFixtures(updateLayoutDto.fixtures);
      }

      // Update only the fields that don't overwrite processed data
      if (updateLayoutDto.name !== undefined) {
        layout.name = updateLayoutDto.name;
      }
      if (updateLayoutDto.canvas !== undefined) {
        layout.canvas = updateLayoutDto.canvas;
      }
      if (updateLayoutDto.settings !== undefined) {
        layout.settings = updateLayoutDto.settings;
      }
      
      layout.updatedBy = new Types.ObjectId(userId);
      layout.version += 1;

      return await layout.save();
    } catch (error) {
      console.error('Layout update failed:', error.message);
      throw error;
    }
  }

  async deleteLayout(exhibitionId: string): Promise<void> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const result = await this.layoutModel.updateOne(
      { exhibitionId: exhibition._id },
      { isActive: false }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }
  }

  // Space Operations
  async createSpace(exhibitionId: string, createSpaceDto: CreateSpaceDto, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const newSpace = {
      id: new Types.ObjectId().toString(),
      ...createSpaceDto,
      transform: {
        ...createSpaceDto.transform,
        rotation: createSpaceDto.transform.rotation ?? 0,
        scaleX: createSpaceDto.transform.scaleX ?? 1,
        scaleY: createSpaceDto.transform.scaleY ?? 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: createSpaceDto.color || '#e6f7ff',
      borderColor: createSpaceDto.borderColor || '#1890ff',
      borderWidth: createSpaceDto.borderWidth || 2,
      isLocked: createSpaceDto.isLocked || false,
      isVisible: createSpaceDto.isVisible !== false,
      halls: createSpaceDto.halls ? await this.processHalls(createSpaceDto.halls) : []
    };

    layout.spaces.push(newSpace);
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  async updateSpace(exhibitionId: string, spaceId: string, updateSpaceDto: UpdateSpaceDto, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const space = layout.spaces.find(s => s.id === spaceId);
    if (!space) {
      throw new NotFoundException(`Space with ID ${spaceId} not found`);
    }

    Object.assign(space, updateSpaceDto);
    space.updatedAt = new Date().toISOString();
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  async deleteSpace(exhibitionId: string, spaceId: string, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const spaceIndex = layout.spaces.findIndex(s => s.id === spaceId);
    if (spaceIndex === -1) {
      throw new NotFoundException(`Space with ID ${spaceId} not found`);
    }

    layout.spaces.splice(spaceIndex, 1);
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  // Hall Operations
  async createHall(exhibitionId: string, spaceId: string, createHallDto: CreateHallDto, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const space = layout.spaces.find(s => s.id === spaceId);
    if (!space) {
      throw new NotFoundException(`Space with ID ${spaceId} not found`);
    }

    const newHall = {
      id: new Types.ObjectId().toString(),
      ...createHallDto,
      transform: {
        ...createHallDto.transform,
        rotation: createHallDto.transform.rotation ?? 0,
        scaleX: createHallDto.transform.scaleX ?? 1,
        scaleY: createHallDto.transform.scaleY ?? 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: createHallDto.color || '#f6ffed',
      borderColor: createHallDto.borderColor || '#52c41a',
      borderWidth: createHallDto.borderWidth || 2,
      isLocked: createHallDto.isLocked || false,
      isVisible: createHallDto.isVisible !== false,
      stalls: createHallDto.stalls ? await this.processStalls(createHallDto.stalls) : []
    };

    space.halls.push(newHall);
    space.updatedAt = new Date().toISOString();
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  async updateHall(exhibitionId: string, spaceId: string, hallId: string, updateHallDto: UpdateHallDto, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const space = layout.spaces.find(s => s.id === spaceId);
    if (!space) {
      throw new NotFoundException(`Space with ID ${spaceId} not found`);
    }

    const hall = space.halls.find(h => h.id === hallId);
    if (!hall) {
      throw new NotFoundException(`Hall with ID ${hallId} not found`);
    }

    Object.assign(hall, updateHallDto);
    hall.updatedAt = new Date().toISOString();
    space.updatedAt = new Date().toISOString();
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  async deleteHall(exhibitionId: string, spaceId: string, hallId: string, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const space = layout.spaces.find(s => s.id === spaceId);
    if (!space) {
      throw new NotFoundException(`Space with ID ${spaceId} not found`);
    }

    const hallIndex = space.halls.findIndex(h => h.id === hallId);
    if (hallIndex === -1) {
      throw new NotFoundException(`Hall with ID ${hallId} not found`);
    }

    space.halls.splice(hallIndex, 1);
    space.updatedAt = new Date().toISOString();
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  // Stall Operations
  async createStall(exhibitionId: string, spaceId: string, hallId: string, createStallDto: CreateStallDto, userId: string): Promise<Layout> {
    const resolvedExhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: resolvedExhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const { space, hall } = this.findSpaceAndHall(layout, spaceId, hallId);

    // Validate stall type
    const stallType = await this.stallTypeModel.findById(createStallDto.stallTypeId);
    if (!stallType) {
      throw new NotFoundException(`Stall type with ID ${createStallDto.stallTypeId} not found`);
    }

    // Check for duplicate stall numbers within the hall
    const existingStall = hall.stalls.find(s => s.number === createStallDto.number);
    if (existingStall) {
      throw new ConflictException(`Stall number ${createStallDto.number} already exists in this hall`);
    }

    // CRITICAL FIX: Calculate proper ratePerSqm from exhibition stallRates or stall type
    // First check if exhibition has custom rates for this stall type
    const exhibition = await this.exhibitionModel.findById(exhibitionId);
    let ratePerSqm = stallType.defaultRate || 100;
    
    if (exhibition?.stallRates) {
      const customRate = exhibition.stallRates.find(sr => 
        sr.stallTypeId.toString() === createStallDto.stallTypeId
      );
      if (customRate) {
        ratePerSqm = customRate.rate;
      }
    }
    
    // If using default rate, convert based on rate type
    if (!exhibition?.stallRates || !exhibition.stallRates.find(sr => sr.stallTypeId.toString() === createStallDto.stallTypeId)) {
      if (stallType.rateType === 'per_stall') {
        const defaultArea = (stallType.defaultSize?.width || 1) * (stallType.defaultSize?.height || 1);
        ratePerSqm = defaultArea > 0 ? stallType.defaultRate / defaultArea : stallType.defaultRate;
      } else if (stallType.rateType === 'per_day') {
        ratePerSqm = stallType.defaultRate;
      }
    }

    const newStall = {
      id: new Types.ObjectId().toString(),
      ...createStallDto,
      transform: {
        ...createStallDto.transform,
        rotation: createStallDto.transform.rotation ?? 0,
        scaleX: createStallDto.transform.scaleX ?? 1,
        scaleY: createStallDto.transform.scaleY ?? 1
      },
      stallType: new Types.ObjectId(createStallDto.stallTypeId),
      // CRITICAL: Add proper ratePerSqm calculation
      ratePerSqm: Math.round(ratePerSqm * 100) / 100,
      // Add dimensions in meters for calculation consistency
      dimensions: {
        width: (createStallDto.size.width / 50) || 1, // Convert pixels to meters
        height: (createStallDto.size.height / 50) || 1,
        shapeType: 'rectangle'
      },
      status: createStallDto.status || 'available',
      color: createStallDto.color || stallType.color,
      borderColor: createStallDto.borderColor || '#389e0d',
      borderWidth: createStallDto.borderWidth || 1,
      isLocked: createStallDto.isLocked || false,
      isVisible: createStallDto.isVisible !== false,
      amenities: createStallDto.amenities || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    hall.stalls.push(newStall);
    hall.updatedAt = new Date().toISOString();
    space.updatedAt = new Date().toISOString();
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  async updateStall(exhibitionId: string, spaceId: string, hallId: string, stallId: string, updateStallDto: UpdateStallDto, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const { space, hall } = this.findSpaceAndHall(layout, spaceId, hallId);

    const stall = hall.stalls.find(s => s.id === stallId);
    if (!stall) {
      throw new NotFoundException(`Stall with ID ${stallId} not found`);
    }

    // Check for duplicate stall numbers if number is being updated
    if (updateStallDto.number && updateStallDto.number !== stall.number) {
      const existingStall = hall.stalls.find(s => s.number === updateStallDto.number && s.id !== stallId);
      if (existingStall) {
        throw new ConflictException(`Stall number ${updateStallDto.number} already exists in this hall`);
      }
    }

    // Validate stall type if being updated
    if (updateStallDto.stallTypeId) {
      const stallType = await this.stallTypeModel.findById(updateStallDto.stallTypeId);
      if (!stallType) {
        throw new NotFoundException(`Stall type with ID ${updateStallDto.stallTypeId} not found`);
      }
      stall.stallType = new Types.ObjectId(updateStallDto.stallTypeId);
    }

    Object.assign(stall, updateStallDto);
    hall.updatedAt = new Date().toISOString();
    space.updatedAt = new Date().toISOString();
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  async deleteStall(exhibitionId: string, spaceId: string, hallId: string, stallId: string, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const { space, hall } = this.findSpaceAndHall(layout, spaceId, hallId);

    const stallIndex = hall.stalls.findIndex(s => s.id === stallId);
    if (stallIndex === -1) {
      throw new NotFoundException(`Stall with ID ${stallId} not found`);
    }

    hall.stalls.splice(stallIndex, 1);
    hall.updatedAt = new Date().toISOString();
    space.updatedAt = new Date().toISOString();
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  // Bulk stall operations
  async bulkCreateStalls(exhibitionId: string, spaceId: string, hallId: string, bulkCreateStallsDto: BulkCreateStallsDto, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const { space, hall } = this.findSpaceAndHall(layout, spaceId, hallId);

    // Validate all stall types and check for duplicates
    const stallNumbers = bulkCreateStallsDto.stalls.map(s => s.number);
    const existingNumbers = hall.stalls.map(s => s.number);
    const duplicates = stallNumbers.filter(num => existingNumbers.includes(num));
    
    if (duplicates.length > 0) {
      throw new ConflictException(`Stall numbers already exist: ${duplicates.join(', ')}`);
    }

    const processedStalls = await this.processStalls(bulkCreateStallsDto.stalls);
    hall.stalls.push(...processedStalls);
    
    hall.updatedAt = new Date().toISOString();
    space.updatedAt = new Date().toISOString();
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  // Fixture Operations
  async createFixture(exhibitionId: string, createFixtureDto: CreateFixtureDto, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    // Validate fixture type
    const fixtureType = await this.fixtureTypeModel.findById(createFixtureDto.fixtureTypeId);
    if (!fixtureType) {
      throw new NotFoundException(`Fixture type with ID ${createFixtureDto.fixtureTypeId} not found`);
    }

    const newFixture = {
      id: new Types.ObjectId().toString(),
      ...createFixtureDto,
      transform: {
        ...createFixtureDto.transform,
        rotation: createFixtureDto.transform.rotation ?? 0,
        scaleX: createFixtureDto.transform.scaleX ?? 1,
        scaleY: createFixtureDto.transform.scaleY ?? 1
      },
      fixtureType: new Types.ObjectId(createFixtureDto.fixtureTypeId),
      color: createFixtureDto.color || fixtureType.color,
      borderColor: createFixtureDto.borderColor || '#d46b08',
      borderWidth: createFixtureDto.borderWidth || 1,
      isLocked: createFixtureDto.isLocked || false,
      isVisible: createFixtureDto.isVisible !== false,
      properties: createFixtureDto.properties || fixtureType.defaultProperties,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    layout.fixtures.push(newFixture);
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  async updateFixture(exhibitionId: string, fixtureId: string, updateFixtureDto: UpdateFixtureDto, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const fixture = layout.fixtures.find(f => f.id === fixtureId);
    if (!fixture) {
      throw new NotFoundException(`Fixture with ID ${fixtureId} not found`);
    }

    // Validate fixture type if being updated
    if (updateFixtureDto.fixtureTypeId) {
      const fixtureType = await this.fixtureTypeModel.findById(updateFixtureDto.fixtureTypeId);
      if (!fixtureType) {
        throw new NotFoundException(`Fixture type with ID ${updateFixtureDto.fixtureTypeId} not found`);
      }
      fixture.fixtureType = new Types.ObjectId(updateFixtureDto.fixtureTypeId);
    }

    Object.assign(fixture, updateFixtureDto);
    fixture.updatedAt = new Date().toISOString();
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  async deleteFixture(exhibitionId: string, fixtureId: string, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const fixtureIndex = layout.fixtures.findIndex(f => f.id === fixtureId);
    if (fixtureIndex === -1) {
      throw new NotFoundException(`Fixture with ID ${fixtureId} not found`);
    }

    layout.fixtures.splice(fixtureIndex, 1);
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  // Utility methods
  private findSpaceAndHall(layout: Layout, spaceId: string, hallId: string) {
    const space = layout.spaces.find(s => s.id === spaceId);
    if (!space) {
      throw new NotFoundException(`Space with ID ${spaceId} not found`);
    }

    const hall = space.halls.find(h => h.id === hallId);
    if (!hall) {
      throw new NotFoundException(`Hall with ID ${hallId} not found`);
    }

    return { space, hall };
  }

  private async processSpaces(spaces: CreateSpaceDto[]): Promise<any[]> {
    const processedSpaces = [];
    
    for (const space of spaces) {
      // Process halls first to preserve the processed data
      const processedHalls = space.halls ? await this.processHalls(space.halls) : [];
      
      const processedSpace = {
        id: new Types.ObjectId().toString(),
        name: space.name,
        description: space.description,
        transform: space.transform,
        size: space.size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: space.color || '#e6f7ff',
        borderColor: space.borderColor || '#1890ff',
        borderWidth: space.borderWidth || 2,
        isLocked: space.isLocked || false,
        isVisible: space.isVisible !== false,
        halls: processedHalls // Use processed halls, not original
      };
      
      processedSpaces.push(processedSpace);
    }
    
    return processedSpaces;
  }

  private async processHalls(halls: CreateHallDto[]): Promise<any[]> {
    const processedHalls = [];
    
    for (const hall of halls) {
      // Process stalls first to preserve the processed data
      const processedStalls = hall.stalls ? await this.processStalls(hall.stalls) : [];
      
      const processedHall = {
        id: new Types.ObjectId().toString(),
        name: hall.name,
        description: hall.description,
        transform: hall.transform,
        size: hall.size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: hall.color || '#f6ffed',
        borderColor: hall.borderColor || '#52c41a',
        borderWidth: hall.borderWidth || 2,
        isLocked: hall.isLocked || false,
        isVisible: hall.isVisible !== false,
        stalls: processedStalls // Use processed stalls, not original
      };
      
      processedHalls.push(processedHall);
    }
    
    return processedHalls;
  }

  private async processStalls(stalls: CreateStallDto[]): Promise<any[]> {
    const processedStalls = [];
    
    for (const stall of stalls) {
      let stallType;
      
      try {
        // If stallTypeId is provided, validate it
        if (stall.stallTypeId) {
          stallType = await this.stallTypeModel.findById(stall.stallTypeId);
          if (!stallType) {
            throw new NotFoundException(`Stall type with ID ${stall.stallTypeId} not found`);
          }
        } else {
          // If no stallTypeId provided, find the first available stall type
          stallType = await this.stallTypeModel.findOne({ isActive: true });
          
          if (!stallType) {
            // Create a default stall type if none exists
            try {
              stallType = await this.stallTypeModel.create({
                name: 'Standard Stall',
                description: 'Default stall type created automatically',
                category: 'standard',
                defaultSize: {
                  width: 100,
                  height: 100,
                },
                color: '#52C41A', // Using valid hex color that matches schema default
                defaultRate: 100,
                rateType: 'per_sqm',
                includedAmenities: [],
                availableAmenities: [],
                minimumBookingDuration: 1,
                maximumBookingDuration: 365,
                isActive: true,
                sortOrder: 0,
                createdBy: new Types.ObjectId('6759e0c4c4c4c4c4c4c4c4c6'), // Default admin user
              });
              console.log('Created default stall type:', stallType._id);
            } catch (createError) {
              console.error('Error creating default stall type:', createError);
              // Try to find any existing stall type as fallback
              stallType = await this.stallTypeModel.findOne();
              if (!stallType) {
                throw new Error('Failed to create or find any stall type');
              }
            }
          }
        }

        // Ensure we have a valid stallType before proceeding
        if (!stallType || !stallType._id) {
          throw new Error('Invalid stall type - missing _id field');
        }

        // Validate stall data before processing
        if (!stall.number || stall.number.trim() === '') {
          throw new Error('Stall number is required');
        }
        if (!stall.transform || typeof stall.transform.x !== 'number' || typeof stall.transform.y !== 'number') {
          throw new Error('Stall transform coordinates are required and must be numbers');
        }
        if (!stall.size || !stall.size.width || !stall.size.height) {
          throw new Error('Stall size dimensions are required');
        }

        // CRITICAL FIX: Calculate proper ratePerSqm from exhibition stallRates or stall type
        let ratePerSqm = stallType.defaultRate || 100;
        
        // Check if there are custom exhibition rates (this would be set after layout creation)
        // For now, use stall type default and let updateStallRatesFromExhibition handle custom rates
        if (stallType.rateType === 'per_stall') {
          // For per_stall pricing, calculate rate per sqm based on default size
          const defaultArea = (stallType.defaultSize?.width || 1) * (stallType.defaultSize?.height || 1);
          ratePerSqm = defaultArea > 0 ? stallType.defaultRate / defaultArea : stallType.defaultRate;
        } else if (stallType.rateType === 'per_day') {
          // For per_day pricing, use as is (could be enhanced with duration calculations)
          ratePerSqm = stallType.defaultRate;
        }
        // For 'per_sqm', use the rate directly

        const processedStall = {
          id: new Types.ObjectId().toString(),
          ...stall,
          stallType: new Types.ObjectId(stallType._id),
          // CRITICAL: Add proper ratePerSqm calculation
          ratePerSqm: Math.round(ratePerSqm * 100) / 100, // Round to 2 decimal places
          // Add dimensions in meters for calculation consistency
          dimensions: {
            width: (stall.size.width / 50) || 1, // Convert pixels to meters (assuming 50px = 1m)
            height: (stall.size.height / 50) || 1,
            shapeType: 'rectangle' // Default shape type
          },
          status: stall.status || 'available',
          color: stall.color || stallType.color || '#52C41A',
          borderColor: stall.borderColor || '#389e0d',
          borderWidth: stall.borderWidth || 1,
          isLocked: stall.isLocked || false,
          isVisible: stall.isVisible !== false,
          amenities: stall.amenities || []
        };
        
        console.log('Processed stall with stallType:', processedStall.stallType);
        processedStalls.push(processedStall);

      } catch (error) {
        console.error('Error processing stall:', {
          stallNumber: stall.number,
          stallTypeId: stall.stallTypeId,
          error: error.message,
          stallData: stall
        });
        throw new Error(`Failed to process stall ${stall.number || 'unknown'}: ${error.message}`);
      }
    }
    
    return processedStalls;
  }

  private async processFixtures(fixtures: CreateFixtureDto[]): Promise<any[]> {
    const processedFixtures = [];
    
    for (const fixture of fixtures) {
      let fixtureType;
      
      try {
        // If fixtureTypeId is provided, validate it
        if (fixture.fixtureTypeId) {
          fixtureType = await this.fixtureTypeModel.findById(fixture.fixtureTypeId);
          if (!fixtureType) {
            throw new NotFoundException(`Fixture type with ID ${fixture.fixtureTypeId} not found`);
          }
        } else {
          // If no fixtureTypeId provided, find the first available fixture type
          fixtureType = await this.fixtureTypeModel.findOne({ isActive: true });
          
          if (!fixtureType) {
            // Create a default fixture type if none exists
            try {
              fixtureType = await this.fixtureTypeModel.create({
                name: 'Generic Fixture',
                description: 'Default fixture type created automatically',
                category: 'infrastructure',
                defaultSize: {
                  width: 50,
                  height: 50,
                },
                color: '#722ED1', // Using valid hex color
                isActive: true,
                sortOrder: 0,
                createdBy: new Types.ObjectId('6759e0c4c4c4c4c4c4c4c4c6'), // Default admin user
              });
              console.log('Created default fixture type:', fixtureType._id);
            } catch (createError) {
              console.error('Error creating default fixture type:', createError);
              // Try to find any existing fixture type as fallback
              fixtureType = await this.fixtureTypeModel.findOne();
              if (!fixtureType) {
                throw new Error('Failed to create or find any fixture type');
              }
            }
          }
        }

        // Ensure we have a valid fixtureType before proceeding
        if (!fixtureType || !fixtureType._id) {
          throw new Error('Invalid fixture type - missing _id field');
        }

        const processedFixture = {
          id: new Types.ObjectId().toString(),
          ...fixture,
          fixtureType: new Types.ObjectId(fixtureType._id),
          color: fixture.color || fixtureType.color || '#722ED1',
          borderColor: fixture.borderColor || '#d46b08',
          borderWidth: fixture.borderWidth || 1,
          isLocked: fixture.isLocked || false,
          isVisible: fixture.isVisible !== false,
          properties: fixture.properties || fixtureType.defaultProperties || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('Processed fixture with fixtureType:', processedFixture.fixtureType);
        processedFixtures.push(processedFixture);

      } catch (error) {
        console.error('Error processing fixture:', error);
        throw new Error(`Failed to process fixture ${fixture.name || 'unknown'}: ${error.message}`);
      }
    }
    
    return processedFixtures;
  }

  // Clone hall functionality
  async cloneHall(exhibitionId: string, spaceId: string, hallId: string, newName: string, userId: string): Promise<Layout> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: exhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    const { space, hall } = this.findSpaceAndHall(layout, spaceId, hallId);

    const clonedHall = {
      ...hall,
      id: new Types.ObjectId().toString(),
      name: newName,
      stalls: hall.stalls.map(stall => ({
        ...stall,
        id: new Types.ObjectId().toString()
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    space.halls.push(clonedHall);
    space.updatedAt = new Date().toISOString();
    layout.updatedBy = new Types.ObjectId(userId);
    layout.version += 1;

    return await layout.save();
  }

  // Export layout functionality
  async exportLayout(exhibitionId: string): Promise<any> {
    const exhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel
      .findOne({ exhibitionId: exhibition._id, isActive: true })
      .populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ]);

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      layout: layout.toObject()
    };
  }

  /**
   * Update stall rates based on exhibition configuration
   * This method should be called after layout creation to apply exhibition-specific rates
   */
  async updateStallRatesFromExhibition(exhibitionId: string, userId: string): Promise<Layout> {
    const resolvedExhibition = await this.resolveExhibition(exhibitionId);
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: resolvedExhibition._id,
      isActive: true 
    });

    if (!layout) {
      throw new NotFoundException(`Layout not found for exhibition ${exhibitionId}`);
    }

    // Get exhibition with stallRates configuration  
    const exhibitionWithRates = await this.exhibitionModel.findById(resolvedExhibition._id).populate('stallRates.stallTypeId');
    if (!exhibitionWithRates || !exhibitionWithRates.stallRates) {
      // No custom rates defined, keep defaults
      return layout;
    }

    // Create a map of stallTypeId to rate for quick lookup
    const rateMap = new Map();
    exhibitionWithRates.stallRates.forEach(stallRate => {
      const stallTypeId = typeof stallRate.stallTypeId === 'object' 
        ? String(stallRate.stallTypeId._id) 
        : String(stallRate.stallTypeId);
      rateMap.set(stallTypeId, stallRate.rate);
    });

    // Update all stalls with exhibition-specific rates
    let hasUpdates = false;
    for (const space of layout.spaces) {
      for (const hall of space.halls) {
        for (const stall of hall.stalls) {
          const stallAny = stall as any; // Type cast to access all properties
          const stallTypeId = stallAny.stallType ? String(stallAny.stallType) : '';
          if (rateMap.has(stallTypeId)) {
            const newRate = rateMap.get(stallTypeId);
            if (stallAny.ratePerSqm !== newRate) {
              stallAny.ratePerSqm = Math.round(newRate * 100) / 100;
              stallAny.updatedAt = new Date().toISOString();
              hasUpdates = true;
            }
          }
        }
        if (hasUpdates) {
          (hall as any).updatedAt = new Date().toISOString();
        }
      }
      if (hasUpdates) {
        (space as any).updatedAt = new Date().toISOString();
      }
    }

    if (hasUpdates) {
      layout.updatedBy = new Types.ObjectId(userId);
      layout.version += 1;
      await layout.save();
    }

    return layout;
  }
} 