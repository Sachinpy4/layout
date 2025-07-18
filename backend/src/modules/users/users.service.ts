import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Role, RoleDocument } from '../../schemas/role.schema';
import * as bcrypt from 'bcrypt';

interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId: string;
  status?: 'active' | 'inactive' | 'suspended';
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  status?: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

interface UsersQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async findAll(query: UsersQueryDto = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter conditions
    const filter: any = {};

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by role (need to populate and filter)
    let roleFilter = {};
    if (role) {
      const roleDoc = await this.roleModel.findOne({ name: role });
      if (roleDoc) {
        filter.role = roleDoc._id;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .populate('role', 'name permissions')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    // Transform users data
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
      role: {
        id: (user.role as any)._id,
        name: (user.role as any).name,
        permissions: (user.role as any).permissions,
      },
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    }));

    return {
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel
      .findById(id)
      .populate('role', 'name permissions description')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      avatar: user.avatar,
      address: user.address,
      lastLoginAt: user.lastLoginAt,
      role: {
        id: (user.role as any)._id,
        name: (user.role as any).name,
        permissions: (user.role as any).permissions,
        description: (user.role as any).description,
      },
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };
  }

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ 
      email: createUserDto.email 
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role exists
    const role = await this.roleModel.findById(createUserDto.roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Create user
    const user = await this.userModel.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      phone: createUserDto.phone,
      role: createUserDto.roleId,
      status: createUserDto.status || 'active',
    });

    // Populate role and return
    const populatedUser = await this.userModel
      .findById(user._id)
      .populate('role', 'name permissions description')
      .exec();

    return {
      id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      phone: populatedUser.phone,
      status: populatedUser.status,
      role: {
        id: (populatedUser.role as any)._id,
        name: (populatedUser.role as any).name,
        permissions: (populatedUser.role as any).permissions,
      },
      createdAt: (populatedUser as any).createdAt,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check if user exists
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userModel.findOne({ 
        email: updateUserDto.email,
        _id: { $ne: id }
      });
      
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Validate role if being updated
    if (updateUserDto.roleId) {
      const role = await this.roleModel.findById(updateUserDto.roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    // Update user
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        { 
          ...updateUserDto,
          role: updateUserDto.roleId || existingUser.role,
        },
        { new: true }
      )
      .populate('role', 'name permissions description')
      .exec();

    return {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      status: updatedUser.status,
      avatar: updatedUser.avatar,
      role: {
        id: (updatedUser.role as any)._id,
        name: (updatedUser.role as any).name,
        permissions: (updatedUser.role as any).permissions,
      },
      updatedAt: (updatedUser as any).updatedAt,
    };
  }

  async updateStatus(id: string, status: 'active' | 'inactive' | 'suspended') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('role', 'name permissions')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      role: {
        id: (user.role as any)._id,
        name: (user.role as any).name,
      },
    };
  }

  async updateRole(id: string, roleId: string) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(roleId)) {
      throw new BadRequestException('Invalid user or role ID');
    }

    // Validate role exists
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, { role: roleId }, { new: true })
      .populate('role', 'name permissions')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: {
        id: (user.role as any)._id,
        name: (user.role as any).name,
        permissions: (user.role as any).permissions,
      },
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const result = await this.userModel.findByIdAndDelete(id);
    
    if (!result) {
      throw new NotFoundException('User not found');
    }

    return { deleted: true };
  }

  async resetPassword(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    await this.userModel.findByIdAndUpdate(id, { password: hashedPassword });

    return {
      temporaryPassword: tempPassword,
      message: 'Password reset successfully. Please share the temporary password securely.',
    };
  }

  async getUserStatistics() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      recentUsers,
      roleStats,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ status: 'active' }),
      this.userModel.countDocuments({ status: 'inactive' }),
      this.userModel.countDocuments({ status: 'suspended' }),
      this.userModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      this.userModel.aggregate([
        {
          $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            as: 'roleInfo'
          }
        },
        {
          $unwind: '$roleInfo'
        },
        {
          $group: {
            _id: '$roleInfo.name',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      suspended: suspendedUsers,
      recentlyCreated: recentUsers,
      byRole: roleStats.map(stat => ({
        role: stat._id,
        count: stat.count,
      })),
    };
  }

  async getUserActivities(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // For now, return empty array since activity logging is not implemented
    // In a real application, you would have an activities/logs collection
    return [];
  }

  async getRoles() {
    const roles = await this.roleModel
      .find({ isActive: true })
      .sort({ priority: 1, name: 1 })
      .select('name description permissions isActive priority')
      .exec();

    return roles.map(role => ({
      id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
      priority: role.priority,
    }));
  }
} 