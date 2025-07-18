import React from 'react';
import { Row, Col, Card, Statistic, Progress } from 'antd';
import { 
  FileTextOutlined, 
  DollarCircleOutlined, 
  ClockCircleOutlined, 
  ShopOutlined
} from '@ant-design/icons';
import { BookingStatsProps } from '../types';

export const BookingStats: React.FC<BookingStatsProps> = ({ stats, loading }) => {
  const statsCards = [
    {
      title: 'Total Bookings',
      value: stats?.total || 0,
      icon: <FileTextOutlined />,
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      prefix: null,
    },
    {
      title: 'Total Revenue',
      value: stats?.totalAmount || 0,
      icon: <DollarCircleOutlined />,
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
      prefix: '₹',
      precision: 0,
    },
    {
      title: 'Pending Approval',
      value: stats?.pending || 0,
      icon: <ClockCircleOutlined />,
      color: '#faad14',
      gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      prefix: null,
      extra: stats?.total ? Math.round((stats.pending / stats.total) * 100) : 0,
    },
    {
      title: 'Stalls Booked',
      value: stats?.totalStalls || 0,
      icon: <ShopOutlined />,
      color: '#722ed1',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      prefix: null,
    },
  ];

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
      {statsCards.map((card, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card
            style={{
              borderRadius: '16px',
              border: 'none',
              background: card.gradient,
              color: 'white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            bodyStyle={{ padding: '24px' }}
            hoverable
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  opacity: 0.9, 
                  marginBottom: '8px' 
                }}>
                  {card.title}
                </div>
                <Statistic
                  value={card.value}
                  loading={loading}
                  prefix={card.prefix}
                  precision={card.precision}
                  valueStyle={{ 
                    color: 'white', 
                    fontSize: '28px', 
                    fontWeight: 'bold',
                    lineHeight: 1.2
                  }}
                />
                {card.extra !== undefined && (
                  <div style={{ marginTop: '12px' }}>
                    <Progress
                      percent={card.extra}
                      size="small"
                      showInfo={false}
                      strokeColor="rgba(255,255,255,0.8)"
                      trailColor="rgba(255,255,255,0.2)"
                    />
                    <div style={{ 
                      fontSize: '12px', 
                      opacity: 0.8, 
                      marginTop: '4px' 
                    }}>
                      {card.extra}% of total bookings
                    </div>
                  </div>
                )}
              </div>
              <div style={{ 
                fontSize: '32px', 
                opacity: 0.8,
                marginLeft: '16px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {card.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}; 