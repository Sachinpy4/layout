import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StallType, StallTypeDocument } from '../../schemas/stall-type.schema';
import { CreateStallTypeDto, UpdateStallTypeDto } from '../../dto/stall-type.dto';

@Injectable()
export class StallTypeService {
  constructor(
    @InjectModel(StallType.name) private stallTypeModel: Model<StallTypeDocument>,
  ) {}

  async create(createStallTypeDto: CreateStallTypeDto, userId: string): Promise<StallType> {
    // Check if stall type with same name already exists
    const existingStallType = await this.stallTypeModel.findOne({ 
      name: createStallTypeDto.name,
      isActive: true
    });
    
    if (existingStallType) {
      throw new ConflictException(`Stall type with name '${createStallTypeDto.name}' already exists`);
    }

    const stallTypeData = {
      ...createStallTypeDto,
      createdBy: new Types.ObjectId(userId),
      isActive: true,
      sortOrder: createStallTypeDto.sortOrder || 0
    };

    const stallType = new this.stallTypeModel(stallTypeData);
    return await stallType.save();
  }

  async findAll(query: any = {}): Promise<StallType[]> {
    const filter: any = { isActive: true };
    
    if (query.category) {
      filter.category = query.category;
    }

    return await this.stallTypeModel
      .find(filter)
      .populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ])
      .sort({ sortOrder: 1, createdAt: -1 });
  }

  async findOne(id: string): Promise<StallType> {
    const stallType = await this.stallTypeModel
      .findOne({ _id: new Types.ObjectId(id), isActive: true })
      .populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ]);

    if (!stallType) {
      throw new NotFoundException(`Stall type with ID ${id} not found`);
    }

    return stallType;
  }

  async update(id: string, updateStallTypeDto: UpdateStallTypeDto, userId: string): Promise<StallType> {
    const stallType = await this.stallTypeModel.findOne({ 
      _id: new Types.ObjectId(id),
      isActive: true
    });

    if (!stallType) {
      throw new NotFoundException(`Stall type with ID ${id} not found`);
    }

    // Check if name is being updated and if it conflicts
    if (updateStallTypeDto.name && updateStallTypeDto.name !== stallType.name) {
      const existingStallType = await this.stallTypeModel.findOne({ 
        name: updateStallTypeDto.name,
        isActive: true,
        _id: { $ne: new Types.ObjectId(id) }
      });
      
      if (existingStallType) {
        throw new ConflictException(`Stall type with name '${updateStallTypeDto.name}' already exists`);
      }
    }

    Object.assign(stallType, updateStallTypeDto);
    stallType.updatedBy = new Types.ObjectId(userId);

    return await stallType.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.stallTypeModel.updateOne(
      { _id: new Types.ObjectId(id), isActive: true },
      { isActive: false }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException(`Stall type with ID ${id} not found`);
    }
  }

  async findByCategory(category: string): Promise<StallType[]> {
    return await this.stallTypeModel
      .find({ category, isActive: true })
      .populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ])
      .sort({ sortOrder: 1, createdAt: -1 });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.stallTypeModel.distinct('category', { isActive: true });
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

    await this.stallTypeModel.bulkWrite(bulkOps);
  }

  async getStats(): Promise<any> {
    const stats = await this.stallTypeModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRate: { $avg: '$defaultRate' },
          minRate: { $min: '$defaultRate' },
          maxRate: { $max: '$defaultRate' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalCount = await this.stallTypeModel.countDocuments({ isActive: true });

    return {
      total: totalCount,
      categories: stats
    };
  }
} 