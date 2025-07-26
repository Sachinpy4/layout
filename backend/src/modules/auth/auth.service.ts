import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Role, RoleDocument } from '../../schemas/role.schema';
import { Exhibitor, ExhibitorDocument } from '../../schemas/exhibitor.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Exhibitor.name) private exhibitorModel: Model<ExhibitorDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel
      .findOne({ email })
      .populate('role')
      .select('+password');
    
    if (user && await user.comparePassword(password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async validateExhibitor(email: string, password: string): Promise<any> {
    const exhibitor = await this.exhibitorModel
      .findOne({ email })
      .select('+password');
    
    if (exhibitor && await exhibitor.comparePassword(password)) {
      const { password, ...result } = exhibitor.toObject();
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: {
        name: user.role.name,
        permissions: user.role.permissions || []
      },
      permissions: user.permissions || [],
      type: 'user',
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: {
          id: (user.role as any)._id,
          name: (user.role as any).name,
          permissions: (user.role as any).permissions,
        },
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  async exhibitorLogin(email: string, password: string) {
    const exhibitor = await this.validateExhibitor(email, password);
    if (!exhibitor) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (exhibitor.status !== 'approved') {
      throw new UnauthorizedException('Account is not approved yet');
    }

    if (!exhibitor.isActive) {
      throw new UnauthorizedException('Account is suspended');
    }

    const payload = {
      sub: exhibitor._id,
      email: exhibitor.email,
      role: 'exhibitor',
      type: 'exhibitor',
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    // Update last login
    await this.exhibitorModel.findByIdAndUpdate(exhibitor._id, {
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      exhibitor: {
        id: exhibitor._id,
        companyName: exhibitor.companyName,
        contactPerson: exhibitor.contactPerson,
        email: exhibitor.email,
        status: exhibitor.status,
      },
    };
  }

  async register(userData: any) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get default role (create if doesn't exist)
    let defaultRole = await this.roleModel.findOne({ name: 'User' });
    if (!defaultRole) {
      defaultRole = await this.roleModel.create({
        name: 'User',
        description: 'Default user role',
        permissions: ['read:profile'],
        isActive: true,
        priority: 1,
      });
    }

    // Create user
    const user = await this.userModel.create({
      ...userData,
      role: defaultRole._id,
    });

    const populatedUser = await this.userModel
      .findById(user._id)
      .populate('role');

    const role = populatedUser.role as any;

    return {
      id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: {
        id: role._id,
        name: role.name,
        permissions: role.permissions,
      },
      status: populatedUser.status,
      createdAt: (populatedUser as any).createdAt,
    };
  }

  async exhibitorRegister(exhibitorData: any) {
    // Check if exhibitor already exists
    const existingExhibitor = await this.exhibitorModel.findOne({ 
      email: exhibitorData.email 
    });
    if (existingExhibitor) {
      throw new ConflictException('Exhibitor with this email already exists');
    }

    // Create exhibitor
    const exhibitor = await this.exhibitorModel.create(exhibitorData);

    return {
      id: exhibitor._id,
      companyName: exhibitor.companyName,
      contactPerson: exhibitor.contactPerson,
      email: exhibitor.email,
      status: exhibitor.status,
      createdAt: (exhibitor as any).createdAt,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role, // This will now include permissions
        permissions: payload.permissions || [],
        type: payload.type,
      };

      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '30d' });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string, userType: 'user' | 'exhibitor') {
    if (userType === 'user') {
      return await this.userModel
        .findById(userId)
        .populate('role')
        .select('-password');
    } else {
      return await this.exhibitorModel
        .findById(userId)
        .select('-password');
    }
  }
} 