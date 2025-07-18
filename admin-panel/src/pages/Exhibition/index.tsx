import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Card,
  Modal,
  App,
  Typography,
  Tooltip,
  Badge,
  DatePicker,
  Select,
  Popconfirm,
  Statistic,
  Avatar,
  Input,
  Dropdown,
  Menu,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  ShopOutlined,
  DollarOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { Exhibition } from '../../types'
import { exhibitionService } from '../../services/exhibition.service'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const ExhibitionPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // State for exhibitions data
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [exhibitionToDelete, setExhibitionToDelete] = useState<Exhibition | null>(null)
  const { message } = App.useApp()

  const loadExhibitions = async () => {
    setLoading(true)
    try {
      const response = await exhibitionService.getExhibitions()
      setExhibitions(response.data)
    } catch (error: any) {
      console.error('Error loading exhibitions:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load exhibitions'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Load exhibitions from API
  useEffect(() => {
    loadExhibitions()
  }, [])

  const handleCreateExhibition = () => {
    navigate('/exhibitions/create')
  }

  const handleEditExhibition = (exhibition: Exhibition) => {
    navigate(`/exhibitions/${exhibition.id}/edit`)
  }

  const handleViewExhibition = (exhibition: Exhibition) => {
    navigate(`/exhibitions/${exhibition.id}`)
  }

  const handleManageLayout = (exhibition: Exhibition) => {
    navigate(`/exhibitions/${exhibition.id}/layout`)
  }

  const handleDeleteExhibition = (exhibition: Exhibition) => {
    setExhibitionToDelete(exhibition)
    setDeleteModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    if (!exhibitionToDelete) return
    
    try {
      await exhibitionService.deleteExhibition(exhibitionToDelete.id)
      message.success('Exhibition deleted successfully')
      setDeleteModalVisible(false)
      setExhibitionToDelete(null)
      // Reload exhibitions after deletion
      await loadExhibitions()
    } catch (error) {
      console.error('Error deleting exhibition:', error)
      message.error('Failed to delete exhibition')
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalVisible(false)
    setExhibitionToDelete(null)
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'orange'
      case 'published': return 'green'
      case 'completed': return 'default'
      default: return 'default'
    }
  }

  const filteredExhibitions = exhibitions.filter(exhibition => {
    const matchesSearch = exhibition.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         exhibition.venue.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = !statusFilter || exhibition.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns = [
    {
      title: 'Exhibition',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Exhibition) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.venue}
          </Text>
        </div>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record: Exhibition) => {
        const startDate = dayjs(record.startDate).format('MMM DD, YYYY')
        const endDate = dayjs(record.endDate).format('MMM DD, YYYY')
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{startDate}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              to {endDate}
            </Text>
          </div>
        )
      },
    },
    {
      title: 'Stalls',
      key: 'stalls',
      render: (record: Exhibition) => {
        const bookedStalls = record.bookedStalls || 0
        const totalStalls = record.totalStalls || 0
        const occupancyRate = totalStalls > 0 ? (bookedStalls / totalStalls) * 100 : 0
        return (
          <div>
            <div style={{ fontWeight: 600 }}>
              {bookedStalls} / {totalStalls}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {occupancyRate.toFixed(1)}% occupied
            </Text>
          </div>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {dayjs(createdAt).format('MMM DD, YYYY')}
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(createdAt).format('HH:mm')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (updatedAt: string) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {dayjs(updatedAt).format('MMM DD, YYYY')}
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(updatedAt).format('HH:mm')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (record: Exhibition) => (
        <Dropdown 
          overlay={
            <Menu>
              <Menu.Item 
                key="view" 
                icon={<EyeOutlined />} 
                onClick={() => handleViewExhibition(record)}
              >
                View Details
              </Menu.Item>
              <Menu.Item 
                key="edit" 
                icon={<EditOutlined />} 
                onClick={() => handleEditExhibition(record)}
              >
                Edit Exhibition
              </Menu.Item>
              <Menu.Item 
                key="layout" 
                icon={<SettingOutlined />} 
                onClick={() => handleManageLayout(record)}
              >
                Manage Layout
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                key="delete" 
                icon={<DeleteOutlined />} 
                danger
                onClick={() => handleDeleteExhibition(record)}
              >
                Delete Exhibition
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            style={{ 
              border: 'none',
              boxShadow: 'none'
            }}
          />
        </Dropdown>
      ),
    },
  ]

  // Statistics for exhibitions
  const stats = [
    {
      title: 'Total Exhibitions',
      value: exhibitions.length,
      icon: <CalendarOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Active Exhibitions',
      value: exhibitions.filter(e => e.status === 'published' && e.isActive).length,
      icon: <UsergroupAddOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Total Stalls',
      value: exhibitions.reduce((acc, e) => acc + (e.totalStalls || 0), 0),
      icon: <ShopOutlined />,
      color: '#faad14',
    },
    {
      title: 'Booked Stalls',
      value: exhibitions.reduce((acc, e) => acc + (e.bookedStalls || 0), 0),
      icon: <DollarOutlined />,
      color: '#722ed1',
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">
            Exhibitions
          </Title>
          <Text type="secondary">Manage all exhibitions and their stall allocations</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreateExhibition}
        >
          Create Exhibition
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
              placeholder="Search exhibitions..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="draft">Draft</Option>
              <Option value="published">Published</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker style={{ width: '100%' }} />
          </Col>
          <Col xs={24} sm={4}>
            <Button icon={<FilterOutlined />}>
              More Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Exhibitions Table */}
      <Card>
        <Table
          dataSource={filteredExhibitions}
          columns={columns}
          rowKey="id"
          loading={loading}
          className="data-table"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} exhibitions`,
          }}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Exhibition"
        open={deleteModalVisible}
        onCancel={handleCancelDelete}
        onOk={handleConfirmDelete}
        okText="Yes, Delete"
        cancelText="Cancel"
        okType="danger"
      >
        <p>
          Are you sure you want to delete exhibition <strong>{exhibitionToDelete?.name}</strong>?
        </p>
        <p>This action cannot be undone and will permanently remove:</p>
        <ul>
          <li>Exhibition details and configuration</li>
          <li>All associated layouts and stalls</li>
          <li>All booking records</li>
          <li>All related data</li>
        </ul>
        <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          This is a permanent action and cannot be reversed.
        </p>
      </Modal>

    </div>
  )
}

export default ExhibitionPage 