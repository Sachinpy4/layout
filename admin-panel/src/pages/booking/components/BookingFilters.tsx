import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Space, Tag } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { BookingFiltersProps } from '../types';
import exhibitionService from '../../../services/exhibition.service';
import { Exhibition } from '../../../types';

const { Option } = Select;

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  searchText,
  statusFilter,
  paymentFilter,
  sourceFilter,
  exhibitionFilter,
  onSearchChange,
  onStatusChange,
  onPaymentChange,
  onSourceChange,
  onExhibitionChange,
}) => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loadingExhibitions, setLoadingExhibitions] = useState(false);

  const activeFiltersCount = [statusFilter, paymentFilter, sourceFilter, exhibitionFilter].filter(Boolean).length;

  const clearAllFilters = () => {
    onStatusChange('');
    onPaymentChange('');
    onSourceChange('');
    onExhibitionChange('');
    onSearchChange('');
  };

  // Load exhibitions on component mount
  useEffect(() => {
    const loadExhibitions = async () => {
      try {
        setLoadingExhibitions(true);
        const response = await exhibitionService.getExhibitions({ isActive: true });
        setExhibitions(response.data);
      } catch (error) {
        console.error('Failed to load exhibitions:', error);
      } finally {
        setLoadingExhibitions(false);
      }
    };

    loadExhibitions();
  }, []);

  return (
    <Card 
      style={{ 
        marginBottom: '24px',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
      bodyStyle={{ padding: '20px' }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px' 
      }}>
        <Space align="center">
          <FilterOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Filters</span>
          {activeFiltersCount > 0 && (
            <Tag color="blue" style={{ borderRadius: '12px' }}>
              {activeFiltersCount} active
            </Tag>
          )}
        </Space>
        {(searchText || activeFiltersCount > 0) && (
          <Tag 
            icon={<ClearOutlined />}
            color="red"
            style={{ 
              cursor: 'pointer',
              borderRadius: '12px',
              padding: '4px 12px'
            }}
            onClick={clearAllFilters}
          >
            Clear All
          </Tag>
        )}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Search by customer, company, invoice number..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            size="large"
            style={{ 
              borderRadius: '8px',
              border: '1px solid #d9d9d9',
              boxShadow: searchText ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none'
            }}
          />
        </Col>
        
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Exhibition"
            value={exhibitionFilter || undefined}
            onChange={onExhibitionChange}
            allowClear
            size="large"
            style={{ width: '100%' }}
            loading={loadingExhibitions}
            dropdownStyle={{ borderRadius: '8px' }}
            optionLabelProp="label"
          >
            {exhibitions.map((exhibition) => (
              <Option 
                key={exhibition.id} 
                value={exhibition.id}
                label={exhibition.name}
              >
                <div style={{ 
                  padding: '4px 0',
                  lineHeight: '1.2'
                }}>
                  <div style={{ 
                    fontWeight: 500,
                    marginBottom: '2px'
                  }}>
                    {exhibition.name}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    lineHeight: '1.2'
                  }}>
                    {exhibition.venue}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Col>
        
        <Col xs={12} sm={6} md={3}>
          <Select
            placeholder="Status"
            value={statusFilter || undefined}
            onChange={onStatusChange}
            allowClear
            size="large"
            style={{ width: '100%' }}
            optionFilterProp="children"
            dropdownStyle={{ borderRadius: '8px' }}
          >
            <Option value="pending">
              <Space>
                <Tag color="warning" style={{ margin: 0 }}>●</Tag>
                Pending
              </Space>
            </Option>
            <Option value="approved">
              <Space>
                <Tag color="blue" style={{ margin: 0 }}>●</Tag>
                Approved
              </Space>
            </Option>
            <Option value="confirmed">
              <Space>
                <Tag color="success" style={{ margin: 0 }}>●</Tag>
                Confirmed
              </Space>
            </Option>
            <Option value="cancelled">
              <Space>
                <Tag color="default" style={{ margin: 0 }}>●</Tag>
                Cancelled
              </Space>
            </Option>
            <Option value="rejected">
              <Space>
                <Tag color="error" style={{ margin: 0 }}>●</Tag>
                Rejected
              </Space>
            </Option>
          </Select>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Select
            placeholder="Payment"
            value={paymentFilter || undefined}
            onChange={onPaymentChange}
            allowClear
            size="large"
            style={{ width: '100%' }}
            dropdownStyle={{ borderRadius: '8px' }}
          >
            <Option value="pending">
              <Space>
                <Tag color="warning" style={{ margin: 0 }}>●</Tag>
                Pending
              </Space>
            </Option>
            <Option value="paid">
              <Space>
                <Tag color="success" style={{ margin: 0 }}>●</Tag>
                Paid
              </Space>
            </Option>
            <Option value="partial">
              <Space>
                <Tag color="blue" style={{ margin: 0 }}>●</Tag>
                Partial
              </Space>
            </Option>
            <Option value="refunded">
              <Space>
                <Tag color="default" style={{ margin: 0 }}>●</Tag>
                Refunded
              </Space>
            </Option>
          </Select>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Select
            placeholder="Source"
            value={sourceFilter || undefined}
            onChange={onSourceChange}
            allowClear
            size="large"
            style={{ width: '100%' }}
            dropdownStyle={{ borderRadius: '8px' }}
          >
            <Option value="admin">
              <Space>
                <Tag color="purple" style={{ margin: 0 }}>●</Tag>
                Admin
              </Space>
            </Option>
            <Option value="exhibitor">
              <Space>
                <Tag color="orange" style={{ margin: 0 }}>●</Tag>
                Exhibitor
              </Space>
            </Option>
            <Option value="public">
              <Space>
                <Tag color="green" style={{ margin: 0 }}>●</Tag>
                Public
              </Space>
            </Option>
          </Select>
        </Col>
      </Row>
    </Card>
  );
}; 