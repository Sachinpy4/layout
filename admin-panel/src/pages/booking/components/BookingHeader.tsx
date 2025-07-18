import React from 'react';
import { Row, Col, Typography, Button, Space } from 'antd';
import { PlusOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import { BookingHeaderProps } from '../types';

const { Title, Text } = Typography;

export const BookingHeader: React.FC<BookingHeaderProps> = ({
  loading,
  statsLoading,
  onRefresh,
  onExport,
  onCreate,
}) => {
  return (
    <div style={{ 
      marginBottom: '24px',
      padding: '24px 0',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Booking Management
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Manage and track all exhibition stall bookings
            </Text>
          </Space>
        </Col>
        <Col>
          <Space size="middle">
            <Button 
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading || statsLoading}
              size="large"
              style={{ 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Refresh
            </Button>
            <Button 
              icon={<ExportOutlined />}
              onClick={onExport}
              size="large"
              style={{ 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Export
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={onCreate}
              size="large"
              style={{ 
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 8px rgba(102, 126, 234, 0.3)'
              }}
            >
              Create Booking
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}; 