import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Role } from '../schemas/role.schema';
import { StallType } from '../schemas/stall-type.schema';
import { FixtureType } from '../schemas/fixture-type.schema';
import { SystemSettings } from '../schemas/system-settings.schema';

async function initializeSystem() {
  console.log('🚀 Initializing Stall Booking System...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const roleModel = app.get<Model<Role>>(getModelToken(Role.name));
  const stallTypeModel = app.get<Model<StallType>>(getModelToken(StallType.name));
  const fixtureTypeModel = app.get<Model<FixtureType>>(getModelToken(FixtureType.name));
  const systemSettingsModel = app.get<Model<SystemSettings>>(getModelToken(SystemSettings.name));

  try {
    // Create default roles
    console.log('📋 Creating default roles...');
    
    const roles = [
      {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: [
          'admin:all',
          'users:read', 'users:write', 'users:delete',
          'roles:read', 'roles:write', 'roles:delete',
          'exhibitions:read', 'exhibitions:write', 'exhibitions:delete',
          'stalls:read', 'stalls:write', 'stalls:delete',
          'bookings:read', 'bookings:write', 'bookings:delete',
          'exhibitors:read', 'exhibitors:write', 'exhibitors:delete',
          'payments:read', 'payments:write',
          'reports:read', 'reports:export',
          'settings:read', 'settings:write',
        ],
        isActive: true,
        priority: 100,
      },
      {
        name: 'Admin',
        description: 'Administrative access with most permissions',
        permissions: [
          'users:read', 'users:write',
          'exhibitions:read', 'exhibitions:write', 'exhibitions:delete',
          'stalls:read', 'stalls:write', 'stalls:delete',
          'bookings:read', 'bookings:write',
          'exhibitors:read', 'exhibitors:write',
          'payments:read',
          'reports:read',
          'settings:read',
        ],
        isActive: true,
        priority: 80,
      },
      {
        name: 'Manager',
        description: 'Management access for exhibitions and bookings',
        permissions: [
          'exhibitions:read', 'exhibitions:write',
          'stalls:read', 'stalls:write',
          'bookings:read', 'bookings:write',
          'exhibitors:read',
          'reports:read',
        ],
        isActive: true,
        priority: 60,
      },
      {
        name: 'Operator',
        description: 'Operational access for day-to-day tasks',
        permissions: [
          'exhibitions:read',
          'stalls:read',
          'bookings:read', 'bookings:write',
          'exhibitors:read',
        ],
        isActive: true,
        priority: 40,
      },
      {
        name: 'Viewer',
        description: 'Read-only access for viewing data',
        permissions: [
          'exhibitions:read',
          'stalls:read',
          'bookings:read',
          'exhibitors:read',
        ],
        isActive: true,
        priority: 20,
      },
      {
        name: 'User',
        description: 'Basic user access',
        permissions: [
          'profile:read', 'profile:write',
        ],
        isActive: true,
        priority: 10,
      },
    ];

    for (const roleData of roles) {
      const existingRole = await roleModel.findOne({ name: roleData.name });
      if (!existingRole) {
        await roleModel.create(roleData);
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`⚠️  Role already exists: ${roleData.name}`);
      }
    }

    // Create default super admin user FIRST (needed for stall types)
    console.log('👤 Creating default super admin user...');
    
    const superAdminRole = await roleModel.findOne({ name: 'Super Admin' });
    if (!superAdminRole) {
      throw new Error('Super Admin role not found');
    }

    let adminUser = await userModel.findOne({ email: 'admin@stallbooking.com' });
    if (!adminUser) {
      adminUser = await userModel.create({
        name: 'System Administrator',
        email: 'admin@stallbooking.com',
        password: 'admin123', // Will be hashed automatically
        role: superAdminRole._id,
        status: 'active',
        permissions: ['admin:all'],
      });
      console.log('✅ Created super admin user');
      console.log('📧 Email: admin@stallbooking.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  IMPORTANT: Change this password after first login!');
    } else {
      console.log('⚠️  Super admin user already exists');
    }

    // Now create default stall types with the admin user as creator
    console.log('🏪 Creating default stall types...');
    
    const stallTypes = [
      {
        _id: '686d7a67901ba33006c0a951', // Specific ObjectId used in data transformers
        name: 'Standard Stall',
        description: 'Standard exhibition stall',
        category: 'standard',
        defaultSize: {
          width: 100,
          height: 100,
        },
        color: '#E6F7FF',
        defaultRate: 100,
        isActive: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Premium Stall',
        description: 'Premium exhibition stall with enhanced features',
        category: 'premium',
        defaultSize: {
          width: 150,
          height: 120,
        },
        color: '#FFF7E6',
        defaultRate: 200,
        isActive: true,
        createdBy: adminUser._id,
      },
    ];

    for (const stallTypeData of stallTypes) {
      const existingStallType = await stallTypeModel.findOne({ name: stallTypeData.name });
      if (!existingStallType) {
        await stallTypeModel.create(stallTypeData);
        console.log(`✅ Created stall type: ${stallTypeData.name}`);
      } else {
        console.log(`⚠️  Stall type already exists: ${stallTypeData.name}`);
      }
    }

    // Create default fixture types with the admin user as creator
    console.log('🔧 Creating default fixture types...');
    
    const fixtureTypes = [
      {
        _id: '686d7a67901ba33006c0a952', // Specific ObjectId used in data transformers
        name: 'Generic Fixture',
        description: 'Generic layout fixture',
        category: 'infrastructure',
        defaultSize: {
          width: 50,
          height: 50,
        },
        color: '#FFF1F0',
        isActive: true,
        createdBy: adminUser._id,
      },
      {
        name: 'Entrance',
        description: 'Exhibition entrance/exit point',
        category: 'infrastructure',
        defaultSize: {
          width: 80,
          height: 30,
        },
        color: '#F0F9FF',
        isActive: true,
        createdBy: adminUser._id,
      },
    ];

    for (const fixtureTypeData of fixtureTypes) {
      const existingFixtureType = await fixtureTypeModel.findOne({ name: fixtureTypeData.name });
      if (!existingFixtureType) {
        await fixtureTypeModel.create(fixtureTypeData);
        console.log(`✅ Created fixture type: ${fixtureTypeData.name}`);
      } else {
        console.log(`⚠️  Fixture type already exists: ${fixtureTypeData.name}`);
      }
    }

    // Create sample admin user
    const adminRole = await roleModel.findOne({ name: 'Admin' });
    if (adminRole) {
      const existingSampleAdmin = await userModel.findOne({ email: 'demo@stallbooking.com' });
      if (!existingSampleAdmin) {
        await userModel.create({
          name: 'Demo Administrator',
          email: 'demo@stallbooking.com',
          password: 'demo123',
          role: adminRole._id,
          status: 'active',
          permissions: [],
        });
        console.log('✅ Created demo admin user');
        console.log('📧 Email: demo@stallbooking.com');
        console.log('🔑 Password: demo123');
      }
    }

    // Create default system settings
    console.log('⚙️  Creating default system settings...');
    
    const existingSettings = await systemSettingsModel.findOne();
    if (!existingSettings) {
      await systemSettingsModel.create({
        siteName: 'ExpoTrack - Exhibition Management',
        defaultCurrency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        newBookingAlerts: true,
        paymentNotifications: true,
        systemAlerts: true,
        updatedBy: adminUser._id,
      });
      console.log('✅ Created default system settings');
    } else {
      console.log('⚠️  System settings already exist');
    }

    console.log('\n🎉 System initialization completed successfully!');
    console.log('\n📚 Default Login Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ Super Admin:                            │');
    console.log('│ Email: admin@stallbooking.com           │');
    console.log('│ Password: admin123                      │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ Demo Admin:                             │');
    console.log('│ Email: demo@stallbooking.com            │');
    console.log('│ Password: demo123                       │');
    console.log('└─────────────────────────────────────────┘');
    console.log('\n⚠️  Remember to:');
    console.log('1. Change default passwords');
    console.log('2. Set up your environment variables');
    console.log('3. Configure MongoDB connection');
    console.log('4. Set JWT secret in production');
    console.log('5. Customize system settings in admin panel');

  } catch (error) {
    console.error('❌ Error initializing system:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the initialization
if (require.main === module) {
  initializeSystem()
    .then(() => {
      console.log('✨ Initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

export { initializeSystem }; 