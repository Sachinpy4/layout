# Stall Booking Admin Panel

A modern React admin panel built with TypeScript, Vite, and Ant Design for managing the stall booking system.

## 🚀 Features

- **Modern Tech Stack**: React 18 + TypeScript + Vite
- **UI Framework**: Ant Design v5 with custom theming
- **Professional Design**: Clean, responsive, and user-friendly interface
- **Modular Architecture**: Well-organized folder structure for maintainability
- **Type Safety**: Full TypeScript support with strict typing
- **Routing**: React Router v6 for navigation
- **State Management**: React hooks for local state
- **Build Tool**: Vite for fast development and optimized builds

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
├── pages/                # Page components (organized by feature)
│   ├── Dashboard/        # Dashboard overview
│   │   └── index.tsx
│   ├── Exhibition/       # Exhibition management
│   │   └── index.tsx
│   ├── Users/           # User management
│   │   └── index.tsx
│   └── Settings/        # System settings
│       └── index.tsx
├── layouts/             # Layout components
│   └── MainLayout.tsx   # Main application layout
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared interfaces and types
├── styles/              # Global styles and themes
│   └── index.css        # Main CSS file
├── services/            # API services and utilities
├── hooks/               # Custom React hooks
├── utils/               # Helper functions
├── App.tsx              # Main app component
└── main.tsx            # Application entry point
```

## 🎯 Pages Overview

### 📊 Dashboard
- **Overview Statistics**: Total users, stalls, exhibitions, revenue
- **Recent Bookings**: Latest booking transactions with status
- **Exhibition Occupancy**: Real-time stall occupancy rates
- **Trend Analysis**: Growth indicators with visual feedback

### 🏛️ Exhibitions
- **Exhibition Management**: Create, edit, delete exhibitions
- **Stall Allocation**: Track booked vs available stalls
- **Status Tracking**: Monitor exhibition phases (upcoming, ongoing, completed)
- **Search & Filter**: Find exhibitions by name, venue, or status
- **Statistics Cards**: Quick overview of exhibition metrics

### 👥 Users
- **User Management**: Add, edit, delete users
- **Role-based Access**: Admin, Vendor, Customer roles
- **Status Management**: Active, inactive, pending states
- **Advanced Filtering**: Filter by role, status, or search terms
- **Tabbed Interface**: Organize users by role categories

### ⚙️ Settings
- **Profile Management**: Update personal information and avatar
- **Security Settings**: Password change and 2FA options
- **System Configuration**: Site-wide settings and preferences
- **Notification Controls**: Email and alert preferences
- **Multi-tab Interface**: Organized settings categories

## 🛠️ Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands
```bash
# Start dev server (default port: 5173)
npm run dev

# Type checking
npm run build

# Lint code
npm run lint
```

## 🎨 Design System

### Color Palette
- **Primary**: #1890ff (Ant Design blue)
- **Success**: #52c41a (Green)
- **Warning**: #faad14 (Orange)
- **Error**: #f5222d (Red)
- **Background**: #f0f2f5 (Light gray)

### Typography
- **Headings**: 24px, 20px, 16px (Semi-bold)
- **Body Text**: 14px (Regular)
- **Secondary Text**: 12px (Gray)
- **Font Family**: -apple-system, BlinkMacSystemFont, Segoe UI

### Layout
- **Sidebar Width**: 200px (collapsed: 80px)
- **Header Height**: 64px
- **Content Padding**: 24px
- **Card Border Radius**: 8px
- **Component Spacing**: 16px, 24px grid

## 🔧 Configuration

### Path Aliases
```typescript
'@/*': ['src/*']
'@components/*': ['src/components/*']
'@pages/*': ['src/pages/*']
'@layouts/*': ['src/layouts/*']
'@types/*': ['src/types/*']
'@styles/*': ['src/styles/*']
'@services/*': ['src/services/*']
'@hooks/*': ['src/hooks/*']
'@utils/*': ['src/utils/*']
```

### Environment Configuration
The application runs on port 5173 by default and is configured to work with the backend API.

## 🏗️ Architecture Decisions

### Page Organization
- **Folder per Page**: Each page has its own folder for better organization
- **Index Files**: Each page folder contains an `index.tsx` file
- **Co-location**: Related components can be placed near their pages
- **Type Safety**: All pages use TypeScript interfaces

### State Management
- **Local State**: React hooks for component-level state
- **Form State**: Ant Design Form components for form management
- **Future**: Ready for global state management (Redux/Zustand) if needed

### Styling Approach
- **Ant Design Components**: Primary UI components
- **Custom CSS**: Global styles and overrides
- **CSS-in-JS**: Inline styles for dynamic styling
- **Responsive Design**: Mobile-first approach with breakpoints

## 🔌 API Integration

The admin panel is designed to integrate with the NestJS backend:
- **Base URL**: Backend API endpoints
- **Authentication**: JWT token-based auth
- **Error Handling**: Consistent error messaging
- **Loading States**: UI feedback for async operations

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablet screens
- **Desktop Enhanced**: Full feature set on desktop
- **Collapsible Sidebar**: Space optimization on smaller screens

## 🔒 Security Features

- **Type Safety**: TypeScript for compile-time error catching
- **Input Validation**: Form validation with Ant Design
- **XSS Protection**: Secure rendering practices
- **Authentication Ready**: Prepared for JWT integration

## 🚀 Performance

- **Vite Build**: Fast development and optimized production builds
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Optimized images and bundle sizes

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced chart components
- [ ] Export functionality
- [ ] Dark mode support
- [ ] Advanced search filters
- [ ] Bulk operations
- [ ] Audit logging
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License. 