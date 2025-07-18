import React from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Progress,
  List,
  Avatar,
} from 'antd'
import {
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const Dashboard: React.FC = () => {
  // Mock data for statistics
  const stats = [
    {
      title: 'Total Users',
      value: 1248,
      prefix: <UserOutlined />,
      suffix: '',
      precision: 0,
      trend: { value: 12.5, isPositive: true },
      color: '#1890ff',
    },
    {
      title: 'Total Stalls',
      value: 156,
      prefix: <ShopOutlined />,
      suffix: '',
      precision: 0,
      trend: { value: 3.2, isPositive: true },
      color: '#52c41a',
    },
    {
      title: 'Active Exhibitions',
      value: 8,
      prefix: <CalendarOutlined />,
      suffix: '',
      precision: 0,
      trend: { value: 2.1, isPositive: false },
      color: '#faad14',
    },
    {
      title: 'Monthly Revenue',
      value: 45680,
      prefix: <DollarOutlined />,
      suffix: '',
      precision: 0,
      trend: { value: 18.9, isPositive: true },
      color: '#722ed1',
    },
  ]

  // Mock data for recent bookings
  const recentBookings = [
    {
      key: '1',
      id: 'BK001',
      stallName: 'Tech Hub Stall A',
      customerName: 'John Doe',
      exhibition: 'Tech Expo 2024',
      amount: 1200,
      status: 'confirmed',
      date: '2024-01-15',
    },
    {
      key: '2',
      id: 'BK002',
      stallName: 'Food Corner B',
      customerName: 'Jane Smith',
      exhibition: 'Food Festival',
      amount: 800,
      status: 'pending',
      date: '2024-01-14',
    },
    {
      key: '3',
      id: 'BK003',
      stallName: 'Art Gallery C',
      customerName: 'Mike Johnson',
      exhibition: 'Art Showcase',
      amount: 1500,
      status: 'confirmed',
      date: '2024-01-13',
    },
    {
      key: '4',
      id: 'BK004',
      stallName: 'Fashion Hub D',
      customerName: 'Sarah Wilson',
      exhibition: 'Fashion Week',
      amount: 2000,
      status: 'completed',
      date: '2024-01-12',
    },
  ]

  // Mock data for popular exhibitions
  const popularExhibitions = [
    {
      name: 'Tech Expo 2024',
      occupancy: 85,
      totalStalls: 50,
      bookedStalls: 42,
    },
    {
      name: 'Food Festival',
      occupancy: 92,
      totalStalls: 25,
      bookedStalls: 23,
    },
    {
      name: 'Art Showcase',
      occupancy: 78,
      totalStalls: 30,
      bookedStalls: 23,
    },
    {
      name: 'Fashion Week',
      occupancy: 95,
      totalStalls: 40,
      bookedStalls: 38,
    },
  ]

  const bookingColumns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: 'Stall',
      dataIndex: 'stallName',
      key: 'stallName',
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Exhibition',
      dataIndex: 'exhibition',
      key: 'exhibition',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'confirmed' ? 'green' : status === 'pending' ? 'orange' : 'blue'
        return <Tag color={color}>{status.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} size="small">
            View
          </Button>
          <Button type="text" icon={<EditOutlined />} size="small">
            Edit
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <Title level={2} className="page-title">
          Dashboard
        </Title>
        <Text type="secondary">Welcome back! Here's what's happening with your stall bookings.</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="stat-card">
              <Statistic
                title={stat.title}
                value={stat.value}
                precision={stat.precision}
                valueStyle={{ color: stat.color, fontSize: 28, fontWeight: 700 }}
                prefix={
                  <span style={{ color: stat.color, fontSize: 24 }}>
                    {stat.prefix}
                  </span>
                }
                suffix={
                  <div style={{ fontSize: 12, marginTop: 8 }}>
                    {stat.trend.isPositive ? (
                      <span className="trend-up">
                        <ArrowUpOutlined /> {stat.trend.value}%
                      </span>
                    ) : (
                      <span className="trend-down">
                        <ArrowDownOutlined /> {stat.trend.value}%
                      </span>
                    )}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Bookings */}
        <Col xs={24} lg={16}>
          <Card
            title="Recent Bookings"
            extra={
              <Button type="primary" size="small">
                View All
              </Button>
            }
          >
            <Table
              dataSource={recentBookings}
              columns={bookingColumns}
              pagination={{ pageSize: 5, showSizeChanger: false }}
              className="data-table"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>

        {/* Popular Exhibitions */}
        <Col xs={24} lg={8}>
          <Card title="Exhibition Occupancy" style={{ height: '100%' }}>
            <List
              dataSource={popularExhibitions}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: '#1890ff' }}
                        icon={<CalendarOutlined />}
                      />
                    }
                    title={item.name}
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">
                            {item.bookedStalls}/{item.totalStalls} stalls booked
                          </Text>
                        </div>
                        <Progress
                          percent={item.occupancy}
                          size="small"
                          status={item.occupancy > 90 ? 'success' : item.occupancy > 70 ? 'active' : 'normal'}
                        />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard 