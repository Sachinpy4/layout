import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Typography, 
  Breadcrumb, 
  Spin,
  App, 
  Descriptions, 
  Tag, 
  Button, 
  Space, 
  Row, 
  Col, 
  Table,
  Avatar,
  Statistic
} from 'antd'
import { 
  HomeOutlined, 
  CalendarOutlined, 
  EditOutlined, 
  ArrowLeftOutlined,
  DollarOutlined,
  ShopOutlined,
  UserOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  BankOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import type { Exhibition } from '@/types'
import dayjs from 'dayjs'

const { Title } = Typography

const ViewExhibitionPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [exhibition, setExhibition] = useState<Exhibition | null>(null)
  const { message } = App.useApp()
  
  useEffect(() => {
    if (id) {
      loadExhibition(id)
    }
  }, [id])

  const loadExhibition = async (exhibitionId: string) => {
    try {
      setLoading(true)
      const exhibitionService = await import('../../../services/exhibition.service')
      const response = await exhibitionService.default.getExhibition(exhibitionId)
      setExhibition(response.data)
    } catch (error) {
      console.error('Error loading exhibition:', error)
      message.error('Failed to load exhibition details')
      navigate('/exhibitions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'orange'
      case 'published': return 'green'
      case 'completed': return 'default'
      default: return 'default'
    }
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '₹0'
    return `₹${amount.toLocaleString('en-IN')}`
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!exhibition) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Title level={3}>Exhibition not found</Title>
      </div>
    )
  }

  const stallRateColumns = [
    {
      title: 'Stall Type',
      dataIndex: 'stallTypeId',
      key: 'stallTypeId',
    },
    {
      title: 'Rate per Sq.m',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => formatCurrency(rate),
    },
  ]

  const amenitiesColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => formatCurrency(rate),
    },
  ]

  const taxColumns = [
    {
      title: 'Tax Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Rate (%)',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => `${rate}%`,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        style={{ marginBottom: '24px' }}
        items={[
          {
            href: '/dashboard',
            title: (
              <>
                <HomeOutlined />
                <span>Dashboard</span>
              </>
            ),
          },
          {
            href: '/exhibitions',
            title: (
              <>
                <CalendarOutlined />
                <span>Exhibitions</span>
              </>
            ),
          },
          {
            title: exhibition.name,
          },
        ]}
      />

      {/* Page Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px' 
      }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
            {exhibition.name}
          </Title>
          <Space style={{ marginTop: '8px' }}>
            <Tag color={getStatusColor(exhibition.status)}>
              {exhibition.status.toUpperCase()}
            </Tag>
            <Tag color={exhibition.isActive ? 'green' : 'red'}>
              {exhibition.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Space>
        </div>
        
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/exhibitions')}
          >
            Back to List
          </Button>
                     <Button 
             type="primary"
             icon={<EditOutlined />}
             onClick={() => navigate(`/exhibitions/${exhibition.id}/edit`)}
           >
            Edit Exhibition
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Stalls"
              value={exhibition.totalStalls || 0}
              prefix={<Avatar style={{ backgroundColor: '#1890ff' }} icon={<ShopOutlined />} size="small" />}
              valueStyle={{ color: '#1890ff', fontSize: 20, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Booked Stalls"
              value={exhibition.bookedStalls || 0}
              prefix={<Avatar style={{ backgroundColor: '#52c41a' }} icon={<UserOutlined />} size="small" />}
              valueStyle={{ color: '#52c41a', fontSize: 20, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Occupancy Rate"
              value={
                exhibition.totalStalls 
                  ? ((exhibition.bookedStalls || 0) / exhibition.totalStalls * 100).toFixed(1)
                  : 0
              }
              suffix="%"
              prefix={<Avatar style={{ backgroundColor: '#faad14' }} icon={<DollarOutlined />} size="small" />}
              valueStyle={{ color: '#faad14', fontSize: 20, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Duration (Days)"
              value={
                exhibition.startDate && exhibition.endDate
                  ? dayjs(exhibition.endDate).diff(dayjs(exhibition.startDate), 'day') + 1
                  : 0
              }
              prefix={<Avatar style={{ backgroundColor: '#722ed1' }} icon={<CalendarOutlined />} size="small" />}
              valueStyle={{ color: '#722ed1', fontSize: 20, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Basic Information */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined />
            <span>Basic Information</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Exhibition Name">{exhibition.name}</Descriptions.Item>
          <Descriptions.Item label="Venue">
            <Space>
              <EnvironmentOutlined />
              {exhibition.venue}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Start Date">{exhibition.startDate}</Descriptions.Item>
          <Descriptions.Item label="End Date">{exhibition.endDate}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(exhibition.status)}>
              {exhibition.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Active Status">
            <Tag color={exhibition.isActive ? 'green' : 'red'}>
              {exhibition.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Invoice Prefix">{exhibition.invoicePrefix || 'Not set'}</Descriptions.Item>
          <Descriptions.Item label="Slug">{exhibition.slug || 'Auto-generated'}</Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {exhibition.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Company Details */}
      {(exhibition.companyName || exhibition.companyEmail) && (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserOutlined />
              <span>Company Details</span>
            </div>
          }
          style={{ marginBottom: '24px' }}
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Company Name">{exhibition.companyName || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="Contact Number">{exhibition.companyContactNo || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="Email">{exhibition.companyEmail || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="Website">{exhibition.companyWebsite || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="PAN">{exhibition.companyPAN || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="GST">{exhibition.companyGST || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="SAC">{exhibition.companySAC || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="CIN">{exhibition.companyCIN || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {exhibition.companyAddress || 'Not set'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Banking Information */}
      {(exhibition.bankName || exhibition.bankAccount) && (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BankOutlined />
              <span>Banking Information</span>
            </div>
          }
          style={{ marginBottom: '24px' }}
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Bank Name">{exhibition.bankName || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="Branch">{exhibition.bankBranch || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="IFSC Code">{exhibition.bankIFSC || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="Account Name">{exhibition.bankAccountName || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="Account Number" span={2}>
              {exhibition.bankAccount || 'Not set'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Stall Rates Configuration */}
      {exhibition.stallRates && exhibition.stallRates.length > 0 && (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarOutlined />
              <span>Stall Rates Configuration</span>
            </div>
          }
          style={{ marginBottom: '24px' }}
        >
          <Table
            dataSource={exhibition.stallRates}
            columns={stallRateColumns}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Amenities */}
      {exhibition.amenities && exhibition.amenities.length > 0 && (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingOutlined />
              <span>Amenities</span>
            </div>
          }
          style={{ marginBottom: '24px' }}
        >
          <Table
            dataSource={exhibition.amenities}
            columns={amenitiesColumns}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Tax Configuration */}
      {exhibition.taxConfig && exhibition.taxConfig.length > 0 && (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarOutlined />
              <span>Tax Configuration</span>
            </div>
          }
          style={{ marginBottom: '24px' }}
        >
          <Table
            dataSource={exhibition.taxConfig}
            columns={taxColumns}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Layout Dimensions */}
      {exhibition.dimensions && (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingOutlined />
              <span>Layout Configuration</span>
            </div>
          }
          style={{ marginBottom: '24px' }}
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Width">{exhibition.dimensions.width}m</Descriptions.Item>
            <Descriptions.Item label="Height">{exhibition.dimensions.height}m</Descriptions.Item>
            <Descriptions.Item label="Total Area" span={2}>
              {(exhibition.dimensions.width * exhibition.dimensions.height).toLocaleString('en-IN')} sq.m
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Additional Information */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined />
            <span>Additional Information</span>
          </div>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Created By">{exhibition.createdBy || 'System'}</Descriptions.Item>
          <Descriptions.Item label="Created At">
            {dayjs(exhibition.createdAt).format('DD MMM YYYY, hh:mm A')}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {dayjs(exhibition.updatedAt).format('DD MMM YYYY, hh:mm A')}
          </Descriptions.Item>
          {exhibition.specialRequirements && (
            <Descriptions.Item label="Special Requirements">
              {exhibition.specialRequirements}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  )
}

export default ViewExhibitionPage 