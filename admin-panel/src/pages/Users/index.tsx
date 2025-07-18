import React, { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Avatar,
  Statistic,
  Badge,
  Tabs,
  Alert,
} from 'antd'
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  CrownOutlined,
  ShopOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import usersService, { User, CreateUserDto, UpdateUserDto, Role } from '../../services/users.service'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

const UsersPage: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  
  // Modal and form state
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  
  // Filter state
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState('all')

  // Fetch users from API
  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await usersService.getUsers({
        page,
        limit,
        search: searchText || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
      
      if (response.success) {
        setUsers(response.data.users)
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total,
        })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users')
      message.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  // Fetch roles for form dropdown
  const fetchRoles = async () => {
    try {
      const response = await usersService.getRoles()
      if (response.success) {
        setRoles(response.data)
      }
    } catch (err: any) {
      console.error('Failed to fetch roles:', err.message)
    }
  }

  // Initial data load
  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, pagination.pageSize)
    }, 500) // Debounce search
    
    return () => clearTimeout(timeoutId)
  }, [searchText, roleFilter, statusFilter])

  const handleCreateUser = () => {
    setEditingUser(null)
    setIsModalVisible(true)
    form.resetFields()
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsModalVisible(true)
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      roleId: user.role.id,
      phone: user.phone,
      status: user.status,
    })
  }

  const handleDeleteUser = async (id: string) => {
    try {
      setLoading(true)
      await usersService.deleteUser(id)
      message.success('User deleted successfully')
      await fetchUsers(pagination.current, pagination.pageSize)
    } catch (err: any) {
      message.error(err.message || 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      if (editingUser) {
        // Update existing user
        const updateData: UpdateUserDto = {
          name: values.name,
          email: values.email,
          roleId: values.roleId,
          phone: values.phone,
          status: values.status,
        }
        await usersService.updateUser(editingUser.id, updateData)
        message.success('User updated successfully')
      } else {
        // Create new user
        const createData: CreateUserDto = {
          name: values.name,
          email: values.email,
          password: values.password,
          roleId: values.roleId,
          phone: values.phone,
          status: values.status || 'active',
        }
        await usersService.createUser(createData)
        message.success('User created successfully')
      }
      
      setIsModalVisible(false)
      form.resetFields()
      await fetchUsers(pagination.current, pagination.pageSize)
    } catch (err: any) {
      message.error(err.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (paginationInfo: any) => {
    fetchUsers(paginationInfo.current, paginationInfo.pageSize)
  }

  const handleRefresh = () => {
    fetchUsers(pagination.current, pagination.pageSize)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red'
      case 'vendor': return 'blue'
      case 'customer': return 'green'
      default: return 'default'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <CrownOutlined />
      case 'vendor': return <ShopOutlined />
      case 'customer': return <UserOutlined />
      default: return <UserOutlined />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'default'
      case 'pending': return 'processing'
      default: return 'default'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase())
    const matchesRole = !roleFilter || user.role.name === roleFilter
    const matchesStatus = !statusFilter || user.status === statusFilter
    const matchesTab = activeTab === 'all' || user.role.name === activeTab
    return matchesSearch && matchesRole && matchesStatus && matchesTab
  })

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            src={record.avatar}
            style={{ backgroundColor: '#1890ff' }}
          >
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{record.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: Role) => (
        <Tag color={getRoleColor(role.name)} icon={getRoleIcon(role.name)}>
          {role.name.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Text>
          <PhoneOutlined style={{ marginRight: 4 }} />
          {phone}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={getStatusColor(status)} 
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => message.info('View user details')}
          >
            View
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              size="small"
              danger
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // User statistics
  const stats = [
    {
      title: 'Total Users',
      value: pagination.total,
      icon: <TeamOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Admins',
      value: users.filter(u => u.role.name === 'admin').length,
      icon: <CrownOutlined />,
      color: '#f5222d',
    },
    {
      title: 'Vendors',
      value: users.filter(u => u.role.name === 'vendor').length,
      icon: <ShopOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Customers',
      value: users.filter(u => u.role.name === 'customer').length,
      icon: <UserOutlined />,
      color: '#52c41a',
    },
  ]

  // Show error state if there's an error
  if (error && !loading) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error Loading Users"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1e293b' }}>
            User Management
          </Title>
          <Text type="secondary">
            Manage users, roles, and permissions across your platform
          </Text>
        </div>
        <Button 
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateUser}
          style={{
            borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            height: 44,
            paddingInline: 24,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}
        >
          Add New User
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={
                  <Avatar
                    style={{ backgroundColor: stat.color }}
                    icon={stat.icon}
                    size="small"
                  />
                }
                valueStyle={{ color: stat.color, fontSize: 20, fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters and Search */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={5}>
            <Select
              placeholder="Filter by role"
              style={{ width: '100%' }}
              value={roleFilter}
              onChange={setRoleFilter}
              allowClear
            >
              {roles.map(role => (
                <Option key={role.id} value={role.name}>{role.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={5}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Button icon={<FilterOutlined />}>
              More Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Users Table with Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="All Users" key="all" />
          <TabPane tab="Admins" key="admin" />
          <TabPane tab="Vendors" key="vendor" />
          <TabPane tab="Customers" key="customer" />
        </Tabs>
        
        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          className="data-table"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          loading={loading}
          onChange={handleTableChange}
          footer={() => (
            <div style={{ textAlign: 'right' }}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh} 
                loading={loading}
              >
                Refresh
              </Button>
            </div>
          )}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        width={600}
        okText={editingUser ? 'Update' : 'Create'}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          className="form-container"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleId"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role">
                  {roles.map(role => (
                    <Option key={role.id} value={role.id}>{role.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UsersPage 