import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Badge,
  Modal,
} from 'antd'
import {
  DashboardOutlined,
  CalendarOutlined,
  UserOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  ProfileOutlined,
  ShopOutlined,
  UnorderedListOutlined,
  TagsOutlined,
  BookOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/exhibitions',
      icon: <CalendarOutlined />,
      label: 'Exhibitions',
    },
    {
      key: '/bookings',
      icon: <BookOutlined />,
      label: 'Bookings',
    },
    {
      key: '/exhibitors',
      icon: <TeamOutlined />,
      label: 'Exhibitors',
    },
    {
      key: 'stalls',
      icon: <ShopOutlined />,
      label: 'Stalls',
      children: [
        {
          key: '/stalls/list',
          icon: <UnorderedListOutlined />,
          label: 'Stall List',
        },
        {
          key: '/stalls/types',
          icon: <TagsOutlined />,
          label: 'Stall Types',
        },
      ],
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      Modal.confirm({
        title: 'Sign Out',
        content: 'Are you sure you want to sign out of the admin panel?',
        okText: 'Sign Out',
        cancelText: 'Cancel',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            await logout()
            navigate('/login')
          } catch (error) {
            console.error('Logout failed:', error)
          }
        },
      })
    } else if (key === 'profile') {
      // Handle profile navigation
      console.log('Profile clicked')
    } else if (key === 'settings') {
      navigate('/settings')
    }
  }

  return (
    <Layout className="main-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        collapsedWidth={80}
        style={{
          overflow: 'hidden',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Modern Logo/Brand Section */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(99, 102, 241, 0.1)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
          }}
        >
          {collapsed ? (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Text
                strong
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                S
              </Text>
            </div>
          ) : (
            <Space align="center" size={12}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              >
                <Text
                  strong
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  S
                </Text>
              </div>
              <div>
                <Text
                  strong
                  style={{
                    color: '#f8fafc',
                    fontSize: 20,
                    fontWeight: 600,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.2,
                  }}
                >
                  Stall Booking
                </Text>
                <div>
                  <Text
                    style={{
                      color: '#94a3b8',
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Admin Panel
                  </Text>
                </div>
              </div>
            </Space>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ padding: '24px 16px' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ 
              borderRight: 0,
              background: 'transparent',
              fontSize: 15,
              fontWeight: 500,
            }}
            className="modern-menu"
          />
        </div>

        {/* User Profile Section at Bottom */}
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 16,
              right: 16,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              padding: 16,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Space align="center" size={12}>
              <Avatar
                size={36}
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: '#6366f1',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              />
              <div>
                <Text
                  strong
                  style={{
                    color: '#f8fafc',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {user?.name || 'Admin User'}
                </Text>
                <div>
                  <Text
                    style={{
                      color: '#94a3b8',
                      fontSize: 12,
                    }}
                  >
                    {user?.role?.name || 'Administrator'}
                  </Text>
                </div>
              </div>
            </Space>
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.3s ease' }}>
        <Header
          style={{
            padding: '0 32px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
                borderRadius: 8,
                color: '#64748b',
                marginRight: 16,
              }}
            />
            
            <Text
              style={{
                fontSize: 13,
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge 
              count={5} 
              size="small"
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                fontWeight: 600,
                fontSize: 10,
              }}
            >
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: '16px' }} />}
                style={{ 
                  height: 40, 
                  width: 40,
                  borderRadius: 8,
                  color: '#64748b',
                }}
              />
            </Badge>
            
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <div 
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 8,
                  transition: 'all 0.2s ease',
                }}
                className="user-dropdown"
              >
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{ 
                    backgroundColor: '#6366f1',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text strong style={{ fontSize: 14, lineHeight: 1.2, color: '#1e293b' }}>
                    {user?.name || 'Admin User'}
                  </Text>
                  <Text style={{ fontSize: 12, lineHeight: 1.2, color: '#64748b' }}>
                    {user?.role?.name || 'Administrator'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="main-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout 