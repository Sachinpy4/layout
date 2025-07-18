import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Typography, Row, Col, Tag, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import exhibitionService from '../../../services/exhibition.service';
import '../../Dashboard/Dashboard.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface Stall {
  _id: string;
  stallNumber: string;
  exhibition: {
    _id: string;
    title: string;
  };
  type: string;
  size: {
    width: number;
    height: number;
  };
  rate: number;
  status: string;
  createdAt: string;
}

const StallListPage: React.FC = () => {
  const navigate = useNavigate();
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchStalls();
  }, []);

  const fetchStalls = async () => {
    try {
      setLoading(true);
      // Mock data for now since we don't have a dedicated stalls endpoint
      setStalls([]);
    } catch (error: any) {
      console.error('Failed to fetch stalls:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Stall Number',
      dataIndex: 'stallNumber',
      key: 'stallNumber',
      sorter: (a: Stall, b: Stall) => a.stallNumber.localeCompare(b.stallNumber),
    },
    {
      title: 'Exhibition',
      dataIndex: ['exhibition', 'title'],
      key: 'exhibition',
      render: (_: any, record: Stall) => record.exhibition?.title || 'N/A',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
      ),
    },
    {
      title: 'Size',
      key: 'size',
      render: (_: any, record: Stall) => (
        `${record.size?.width || 0} x ${record.size?.height || 0}`
      ),
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => `$${rate?.toLocaleString() || 0}`,
      sorter: (a: Stall, b: Stall) => (a.rate || 0) - (b.rate || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'available' ? 'green' : status === 'booked' ? 'red' : 'orange';
        return <Tag color={color}>{status?.toUpperCase() || 'UNKNOWN'}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Stall) => (
        <Space>
          <Button type="link" size="small">View</Button>
          <Button type="link" size="small">Edit</Button>
        </Space>
      ),
    },
  ];

  const filteredStalls = stalls.filter(stall => {
    const matchesSearch = !searchTerm || 
      stall.stallNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stall.exhibition?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || stall.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0 }}>Stall List</Title>
              <Text type="secondary">Manage exhibition stalls and bookings</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/exhibitions')}
              >
                Manage via Exhibitions
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Filters Section */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search stalls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="available">Available</Option>
              <Option value="booked">Booked</Option>
              <Option value="reserved">Reserved</Option>
              <Option value="maintenance">Maintenance</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card>
        <Table 
          columns={columns}
          dataSource={filteredStalls}
          rowKey={record => record._id}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} stalls`,
          }}
        />
      </Card>
    </div>
  );
};

export default StallListPage; 