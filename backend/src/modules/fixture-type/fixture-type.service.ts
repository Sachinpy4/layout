import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FixtureType, FixtureTypeDocument } from '../../schemas/fixture-type.schema';
import { CreateFixtureTypeDto, UpdateFixtureTypeDto } from '../../dto/fixture-type.dto';

@Injectable()
export class FixtureTypeService {
  constructor(
    @InjectModel(FixtureType.name) private fixtureTypeModel: Model<FixtureTypeDocument>,
  ) {}

  async create(createFixtureTypeDto: CreateFixtureTypeDto, userId: string): Promise<FixtureType> {
    // Check if fixture type with same name already exists
    const existingFixtureType = await this.fixtureTypeModel.findOne({ 
      name: createFixtureTypeDto.name,
      isActive: true
    });
    
    if (existingFixtureType) {
      throw new ConflictException(`Fixture type with name '${createFixtureTypeDto.name}' already exists`);
    }

    const fixtureTypeData = {
      ...createFixtureTypeDto,
      createdBy: new Types.ObjectId(userId),
      isActive: true,
      sortOrder: createFixtureTypeDto.sortOrder || 0,
      isMovable: createFixtureTypeDto.isMovable !== false,
      isResizable: createFixtureTypeDto.isResizable !== false,
      isRotatable: createFixtureTypeDto.isRotatable || false,
      requiredProperties: createFixtureTypeDto.requiredProperties || [],
      optionalProperties: createFixtureTypeDto.optionalProperties || [],
      defaultProperties: createFixtureTypeDto.defaultProperties || {},
      cost: createFixtureTypeDto.cost || 0
    };

    const fixtureType = new this.fixtureTypeModel(fixtureTypeData);
    return await fixtureType.save();
  }

  async findAll(query: any = {}): Promise<FixtureType[]> {
    const filter: any = { isActive: true };
    
    if (query.category) {
      filter.category = query.category;
    }

    return await this.fixtureTypeModel
      .find(filter)
      .populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ])
      .sort({ sortOrder: 1, createdAt: -1 });
  }

  async findOne(id: string): Promise<FixtureType> {
    const fixtureType = await this.fixtureTypeModel
      .findOne({ _id: new Types.ObjectId(id), isActive: true })
      .populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ]);

    if (!fixtureType) {
      throw new NotFoundException(`Fixture type with ID ${id} not found`);
    }

    return fixtureType;
  }

  async update(id: string, updateFixtureTypeDto: UpdateFixtureTypeDto, userId: string): Promise<FixtureType> {
    const fixtureType = await this.fixtureTypeModel.findOne({ 
      _id: new Types.ObjectId(id),
      isActive: true
    });

    if (!fixtureType) {
      throw new NotFoundException(`Fixture type with ID ${id} not found`);
    }

    // Check if name is being updated and if it conflicts
    if (updateFixtureTypeDto.name && updateFixtureTypeDto.name !== fixtureType.name) {
      const existingFixtureType = await this.fixtureTypeModel.findOne({ 
        name: updateFixtureTypeDto.name,
        isActive: true,
        _id: { $ne: new Types.ObjectId(id) }
      });
      
      if (existingFixtureType) {
        throw new ConflictException(`Fixture type with name '${updateFixtureTypeDto.name}' already exists`);
      }
    }

    Object.assign(fixtureType, updateFixtureTypeDto);
    fixtureType.updatedBy = new Types.ObjectId(userId);

    return await fixtureType.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.fixtureTypeModel.updateOne(
      { _id: new Types.ObjectId(id), isActive: true },
      { isActive: false }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException(`Fixture type with ID ${id} not found`);
    }
  }

  async findByCategory(category: string): Promise<FixtureType[]> {
    return await this.fixtureTypeModel
      .find({ category, isActive: true })
      .populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ])
      .sort({ sortOrder: 1, createdAt: -1 });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.fixtureTypeModel.distinct('category', { isActive: true });
    return categories;
  }

  async updateSortOrder(updates: { id: string; sortOrder: number }[], userId: string): Promise<void> {
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(update.id), isActive: true },
        update: { 
          sortOrder: update.sortOrder,
          updatedBy: new Types.ObjectId(userId)
        }
      }
    }));

    await this.fixtureTypeModel.bulkWrite(bulkOps);
  }

  async getStats(): Promise<any> {
    const stats = await this.fixtureTypeModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageCost: { $avg: '$cost' },
          minCost: { $min: '$cost' },
          maxCost: { $max: '$cost' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalCount = await this.fixtureTypeModel.countDocuments({ isActive: true });

    return {
      total: totalCount,
      categories: stats
    };
  }

  async getTemplates(): Promise<FixtureType[]> {
    // Get commonly used fixture types as templates
    return await this.fixtureTypeModel
      .find({ isActive: true })
      .populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ])
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(20);
  }

  async duplicateFixtureType(id: string, newName: string, userId: string): Promise<FixtureType> {
    const originalFixtureType = await this.fixtureTypeModel.findOne({ 
      _id: new Types.ObjectId(id),
      isActive: true
    });

    if (!originalFixtureType) {
      throw new NotFoundException(`Fixture type with ID ${id} not found`);
    }

    // Check if new name already exists
    const existingFixtureType = await this.fixtureTypeModel.findOne({ 
      name: newName,
      isActive: true
    });
    
    if (existingFixtureType) {
      throw new ConflictException(`Fixture type with name '${newName}' already exists`);
    }

    const duplicateData = {
      ...originalFixtureType.toObject(),
      _id: undefined,
      name: newName,
      createdBy: new Types.ObjectId(userId),
      updatedBy: undefined,
      createdAt: undefined,
      updatedAt: undefined
    };

    const duplicate = new this.fixtureTypeModel(duplicateData);
    return await duplicate.save();
  }
} 