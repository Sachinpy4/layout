import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exhibition } from '../../schemas/exhibition.schema';
import { StallType } from '../../schemas/stall-type.schema';
import { CreateExhibitionDto, UpdateExhibitionDto } from '../../dto/exhibition.dto';
import { ImageHelperService } from './image-helper.service';

@Injectable()
export class ExhibitionsService {
  constructor(
    @InjectModel(Exhibition.name) private exhibitionModel: Model<Exhibition>,
    @InjectModel(StallType.name) private stallTypeModel: Model<StallType>,
    private readonly imageHelperService: ImageHelperService,
  ) {}

  async create(createExhibitionDto: CreateExhibitionDto, userId: string): Promise<Exhibition> {
    // Check if exhibition with same name already exists
    const existingExhibition = await this.exhibitionModel.findOne({
      name: createExhibitionDto.name,
      isDeleted: { $ne: true }
    });

    if (existingExhibition) {
      throw new ConflictException('Exhibition with this name already exists');
    }

    // Generate slug from name if not provided
    const slug = createExhibitionDto.slug || 
                 createExhibitionDto.name.toLowerCase()
                   .replace(/[^a-z0-9\s-]/g, '')
                   .replace(/\s+/g, '-');

    // Migrate any base64 images to files before saving
    const migratedImages = await this.imageHelperService.migrateExhibitionImages(
      'temp-' + Date.now(), // Temporary ID for creation
      {
        headerLogo: createExhibitionDto.headerLogo,
        sponsorLogos: createExhibitionDto.sponsorLogos,
        footerLogo: createExhibitionDto.footerLogo,
      }
    );

    const exhibition = new this.exhibitionModel({
      ...createExhibitionDto,
      ...migratedImages, // Use migrated file paths
      slug,
      createdBy: userId,
      status: createExhibitionDto.status || 'draft',
      isActive: createExhibitionDto.isActive !== undefined ? createExhibitionDto.isActive : true,
    });

    const savedExhibition = await exhibition.save();

    // Update file names with actual exhibition ID
    if (migratedImages.headerLogo || migratedImages.sponsorLogos || migratedImages.footerLogo) {
      const finalMigratedImages = await this.imageHelperService.migrateExhibitionImages(
        savedExhibition._id.toString(),
        migratedImages
      );

      await this.exhibitionModel.findByIdAndUpdate(savedExhibition._id, finalMigratedImages);
      return { ...savedExhibition.toObject(), ...finalMigratedImages };
    }

    return savedExhibition;
  }

  async findAll(query?: any): Promise<{
    exhibitions: Exhibition[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...filterQuery
    } = query || {};

    const filter = { isDeleted: { $ne: true }, ...filterQuery };
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    try {
      // Execute queries in parallel with safe populate
      const [exhibitions, total] = await Promise.all([
        this.exhibitionModel
          .find(filter)
          .populate({
            path: 'stallRates.stallTypeId',
            model: 'StallType',
            select: 'name description category defaultRate color',
            options: { 
              strictPopulate: false,  // Don't fail if reference doesn't exist
              lean: false 
            }
          })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.exhibitionModel.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);

      // Clean up any invalid stallRates during retrieval
      const cleanedExhibitions = exhibitions.map(exhibition => {
        if (exhibition.stallRates) {
          exhibition.stallRates = exhibition.stallRates.filter(
            stallRate => {
              if (!stallRate.stallTypeId) return false;
              const stallTypeIdStr = stallRate.stallTypeId.toString();
              return stallTypeIdStr !== '[object Object]' && 
                     stallTypeIdStr !== 'undefined' &&
                     stallTypeIdStr.length > 0;
            }
          );
        }
        return exhibition;
      });

      return {
        exhibitions: cleanedExhibitions,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      console.error('Error in findAll with populate, falling back to simple query:', error);
      
      // Fallback: fetch without populate if there are issues
      const [exhibitions, total] = await Promise.all([
        this.exhibitionModel
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.exhibitionModel.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        exhibitions,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }
  }

  async findActive(): Promise<Exhibition[]> {
    return this.exhibitionModel
      .find({ 
        isActive: true, 
        isDeleted: { $ne: true },
        status: 'published'
      })
      // .populate('createdBy', 'name email') // Commented out until auth is properly implemented
      .sort({ startDate: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Exhibition> {
    const exhibition = await this.exhibitionModel
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .populate({
        path: 'stallRates.stallTypeId',
        model: 'StallType',
        select: 'name description category defaultRate color',
        options: { 
          strictPopulate: false,  // Don't fail if reference doesn't exist
          lean: false 
        }
      })
      // .populate('createdBy', 'name email') // Commented out until auth is properly implemented
      .exec();

    if (!exhibition) {
      throw new NotFoundException('Exhibition not found');
    }

    // CRITICAL FIX: Transform exhibition to prevent stallTypeId object serialization issues
    const exhibitionObj = exhibition.toObject();
    
    // Normalize stallRates to have both populated data AND string IDs for updates
    if (exhibitionObj.stallRates && Array.isArray(exhibitionObj.stallRates)) {
      exhibitionObj.stallRates = exhibitionObj.stallRates.map((rate: any) => ({
        ...rate,
        stallTypeId: typeof rate.stallTypeId === 'object' ? rate.stallTypeId._id : rate.stallTypeId,
        // Keep populated data for frontend display as a separate field
        stallType: typeof rate.stallTypeId === 'object' ? rate.stallTypeId : null
      }));
    }

    return exhibitionObj;
  }

  async findBySlug(slug: string): Promise<Exhibition> {
    const exhibition = await this.exhibitionModel
      .findOne({ slug, isDeleted: { $ne: true } })
      .populate({
        path: 'stallRates.stallTypeId',
        model: 'StallType',
        select: 'name description category defaultRate color',
        options: { 
          strictPopulate: false,  // Don't fail if reference doesn't exist
          lean: false 
        }
      })
      // .populate('createdBy', 'name email') // Commented out until auth is properly implemented
      .exec();

    if (!exhibition) {
      throw new NotFoundException('Exhibition not found');
    }

    // CRITICAL FIX: Transform exhibition to prevent stallTypeId object serialization issues
    const exhibitionObj = exhibition.toObject();
    
    // Normalize stallRates to have both populated data AND string IDs for updates
    if (exhibitionObj.stallRates && Array.isArray(exhibitionObj.stallRates)) {
      exhibitionObj.stallRates = exhibitionObj.stallRates.map((rate: any) => ({
        ...rate,
        stallTypeId: typeof rate.stallTypeId === 'object' ? rate.stallTypeId._id : rate.stallTypeId,
        // Keep populated data for frontend display as a separate field
        stallType: typeof rate.stallTypeId === 'object' ? rate.stallTypeId : null
      }));
    }

    return exhibitionObj;
  }

  async update(id: string, updateExhibitionDto: UpdateExhibitionDto): Promise<Exhibition> {
    console.log('=== BACKEND UPDATE DEBUG ===');
    console.log('Exhibition ID:', id);
    console.log('Received updateExhibitionDto:', JSON.stringify(updateExhibitionDto, null, 2));
    console.log('stallRates in request:', updateExhibitionDto.stallRates);
    console.log('taxConfig in request:', updateExhibitionDto.taxConfig);
    console.log('discountConfig in request:', updateExhibitionDto.discountConfig);
    console.log('publicDiscountConfig in request:', updateExhibitionDto.publicDiscountConfig);
    
    // Get existing exhibition for cleanup
    const existingExhibition = await this.exhibitionModel.findById(id);
    if (!existingExhibition) {
      throw new NotFoundException('Exhibition not found');
    }
    
    // Create update object by filtering out undefined values to prevent clearing existing data
    const updateData: any = {};
    
    // Only include defined fields in the update to avoid clearing existing data
    Object.keys(updateExhibitionDto).forEach(key => {
      const value = (updateExhibitionDto as any)[key];
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // Generate new slug if name is being updated
    if (updateData.name && updateData.name !== existingExhibition.name) {
      let baseSlug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Handle potential slug conflicts by appending number
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const conflictingExhibition = await this.exhibitionModel.findOne({ 
          slug,
          _id: { $ne: id }, // Exclude current exhibition
          isDeleted: { $ne: true }
        });
        
        if (!conflictingExhibition) {
          break; // Slug is unique
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      updateData.slug = slug;
      console.log('Generated new slug:', updateData.slug, 'from name:', updateData.name);
    }

    console.log('Processed updateData:', JSON.stringify(updateData, null, 2));
    console.log('stallRates in updateData:', updateData.stallRates);

    // Validate and clean stallRates if present
    if (updateData.stallRates) {
      updateData.stallRates = updateData.stallRates.filter(stallRate => {
        // Remove entries with invalid stallTypeId
        if (!stallRate.stallTypeId || 
            stallRate.stallTypeId === '[object Object]' ||
            typeof stallRate.stallTypeId === 'string' && stallRate.stallTypeId.includes('[object Object]')) {
          console.warn('Removing invalid stallRate:', stallRate);
          return false;
        }
        return true;
      });
    }

    // MIGRATE IMAGES: Convert any base64 images to files
    const migratedImages = await this.imageHelperService.migrateExhibitionImages(id, {
      headerLogo: updateData.headerLogo,
      sponsorLogos: updateData.sponsorLogos,
      footerLogo: updateData.footerLogo,
    });

    // Clean up old files if new ones were created
    if (migratedImages.headerLogo !== updateData.headerLogo ||
        JSON.stringify(migratedImages.sponsorLogos) !== JSON.stringify(updateData.sponsorLogos) ||
        migratedImages.footerLogo !== updateData.footerLogo) {
      
      await this.imageHelperService.cleanupOldImages({
        headerLogo: existingExhibition.headerLogo,
        sponsorLogos: existingExhibition.sponsorLogos,
        footerLogo: existingExhibition.footerLogo,
      });
    }

    // Use migrated image paths
    Object.assign(updateData, migratedImages);

    // Always update the timestamp
    updateData.updatedAt = new Date();

    const exhibition = await this.exhibitionModel
      .findOneAndUpdate(
        { _id: id, isDeleted: { $ne: true } },
        { $set: updateData },
        { new: true, runValidators: true }
      )
      .populate({
        path: 'stallRates.stallTypeId',
        model: 'StallType',
        select: 'name description category defaultRate color',
        options: { 
          strictPopulate: false
        }
      })
      .exec();

    if (!exhibition) {
      throw new NotFoundException('Exhibition not found');
    }

    return exhibition;
  }

  async remove(id: string): Promise<void> {
    const result = await this.exhibitionModel
      .findOneAndUpdate(
        { _id: id, isDeleted: { $ne: true } },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!result) {
      throw new NotFoundException('Exhibition not found');
    }
  }

  async updateStatus(id: string, status: 'draft' | 'published' | 'completed'): Promise<Exhibition> {
    const exhibition = await this.exhibitionModel
      .findOneAndUpdate(
        { _id: id, isDeleted: { $ne: true } },
        { status, updatedAt: new Date() },
        { new: true }
      )
      // .populate('createdBy', 'name email') // Commented out until auth is properly implemented
      .exec();

    if (!exhibition) {
      throw new NotFoundException('Exhibition not found');
    }

    return exhibition;
  }

  async toggleActive(id: string): Promise<Exhibition> {
    const exhibition = await this.findOne(id);
    
    const updated = await this.exhibitionModel
      .findOneAndUpdate(
        { _id: id },
        { isActive: !exhibition.isActive, updatedAt: new Date() },
        { new: true }
      )
      // .populate('createdBy', 'name email') // Commented out until auth is properly implemented
      .exec();

    return updated;
  }

  async getStats(): Promise<any> {
    const filter = { isDeleted: { $ne: true } };
    
    const [total, active, published, completed, draft] = await Promise.all([
      this.exhibitionModel.countDocuments(filter),
      this.exhibitionModel.countDocuments({ ...filter, isActive: true }),
      this.exhibitionModel.countDocuments({ ...filter, status: 'published' }),
      this.exhibitionModel.countDocuments({ ...filter, status: 'completed' }),
      this.exhibitionModel.countDocuments({ ...filter, status: 'draft' }),
    ]);

    return {
      total,
      active,
      published,
      completed,
      draft,
    };
  }

  /**
   * Utility method to identify and fix corrupted stallRates data
   * This addresses the ObjectId cast error in stallRates.stallTypeId fields
   */
  async fixCorruptedStallRates(): Promise<{ fixed: number; errors: any[] }> {
    const errors = [];
    let fixed = 0;

    try {
      // Find all exhibitions with stallRates
      const exhibitions = await this.exhibitionModel.find({ 
        stallRates: { $exists: true, $ne: [] },
        isDeleted: { $ne: true }
      }).exec();

      console.log(`Found ${exhibitions.length} exhibitions with stallRates to check`);

      for (const exhibition of exhibitions) {
        let needsUpdate = false;
        const cleanedStallRates = [];

        for (const stallRate of exhibition.stallRates || []) {
          try {
            // Check if stallTypeId is a valid ObjectId
            if (stallRate.stallTypeId && typeof stallRate.stallTypeId === 'string') {
              // Try to create ObjectId - this will throw if invalid
              const objectId = new this.exhibitionModel.base.Types.ObjectId(stallRate.stallTypeId);
              cleanedStallRates.push({
                stallTypeId: objectId,
                rate: stallRate.rate
              });
            } else if (stallRate.stallTypeId && this.exhibitionModel.base.Types.ObjectId.isValid(stallRate.stallTypeId)) {
              // Already valid ObjectId
              cleanedStallRates.push(stallRate);
            } else {
              // Invalid or missing stallTypeId - skip this stallRate
              console.log(`Removing invalid stallRate from exhibition ${exhibition._id}: ${JSON.stringify(stallRate)}`);
              needsUpdate = true;
            }
          } catch (error) {
            console.log(`Removing corrupted stallRate from exhibition ${exhibition._id}: ${error.message}`);
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          await this.exhibitionModel.updateOne(
            { _id: exhibition._id },
            { $set: { stallRates: cleanedStallRates } }
          );
          fixed++;
          console.log(`Fixed stallRates for exhibition ${exhibition._id}`);
        }
      }

      return { fixed, errors };
    } catch (error) {
      errors.push(`Error during stallRates cleanup: ${error.message}`);
      return { fixed, errors };
    }
  }

  /**
   * Utility method to check for corrupted data without fixing
   */
  async checkDataIntegrity(): Promise<any> {
    const issues = [];

    try {
      // Check for exhibitions with problematic stallRates
      const exhibitionsWithStallRates = await this.exhibitionModel.find({ 
        stallRates: { $exists: true, $ne: [] },
        isDeleted: { $ne: true }
      }).select('_id name stallRates').exec();

      let corruptedCount = 0;
      const corruptedIds = [];

      for (const exhibition of exhibitionsWithStallRates) {
        for (const stallRate of exhibition.stallRates || []) {
          if (!this.exhibitionModel.base.Types.ObjectId.isValid(stallRate.stallTypeId)) {
            corruptedCount++;
            corruptedIds.push(exhibition._id);
            break; // One corrupt stallRate per exhibition is enough to mark it
          }
        }
      }

      return {
        totalExhibitions: exhibitionsWithStallRates.length,
        corruptedExhibitions: corruptedCount,
        corruptedIds,
        issues
      };
    } catch (error) {
      issues.push(`Error during integrity check: ${error.message}`);
      return { issues };
    }
  }
} 