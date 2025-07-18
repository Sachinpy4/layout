import React from 'react';
import { Card, Col, Row, Typography, Button } from 'antd';
import { 
  HomeOutlined, 
  BankOutlined, 
  ShopOutlined, 
  SettingOutlined,
  EditOutlined 
} from '@ant-design/icons';
import { LayoutData, ViewMode } from '../types/layout-types';

const { Title, Text } = Typography;

interface SelectionViewProps {
  layout: LayoutData | null;
  onViewModeChange: (mode: ViewMode) => void;
  onShowSpaceModal: () => void;
  onShowHallModal: () => void;
  onShowStallModal: () => void;
  onShowFixtureModal: () => void;
}

const SelectionView: React.FC<SelectionViewProps> = ({
  layout,
  onViewModeChange,
  onShowSpaceModal: _onShowSpaceModal,
  onShowHallModal: _onShowHallModal,
  onShowStallModal: _onShowStallModal,
  onShowFixtureModal: _onShowFixtureModal
}) => {
  const handleSpaceClick = () => {
    // Always go to workspace view, create space from inside
    onViewModeChange('space');
  };

  const handleHallClick = () => {
    if (!layout?.space) {
      // message.warning('Create Exhibition Space first');
      return;
    }
    onViewModeChange('hall');
  };

  const handleStallClick = () => {
    if (!layout?.space) {
      // message.warning('Create Exhibition Space first');
      return;
    }
    if (layout.space.halls.length === 0) {
      // message.warning('Create Halls first');
      return;
    }
    onViewModeChange('stall');
  };

  const handleFixtureClick = () => {
    onViewModeChange('fixture');
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>Layout Builder</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Choose what you want to add or manage in your exhibition layout
        </Text>
      </div>
      
      <Row gutter={[32, 32]} justify="center">
        {/* Exhibition Space */}
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={handleSpaceClick}
            style={{ 
              textAlign: 'center', 
              height: 280,
              border: '2px solid #d9d9d9',
              borderRadius: 16,
              cursor: 'pointer'
            }}
            styles={{ body: { padding: '32px 24px' } }}
          >
            <div style={{ marginBottom: 16 }}>
              <HomeOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </div>
            <Title level={3} style={{ margin: '16px 0 8px 0', color: '#1890ff' }}>
              Exhibition Space
            </Title>
            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>
              Main exhibition area with custom dimensions in square meters
            </Text>
          
            {layout?.space ? (
              <div>
                <Text type="success" style={{ fontSize: 12, fontWeight: 'bold' }}>
                  ✓ Created ({layout.space.widthSqm}m × {layout.space.heightSqm}m)
                </Text>
                <br />
                <Button type="link" size="small" icon={<EditOutlined />}>
                  Manage Space
                </Button>
              </div>
            ) : (
              <Button type="primary" ghost>
                Enter Workspace
              </Button>
            )}
          </Card>
        </Col>

        {/* Halls */}
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={handleHallClick}
            style={{ 
              textAlign: 'center', 
              height: 280,
              border: '2px solid #d9d9d9',
              borderRadius: 16,
              cursor: layout?.space ? 'pointer' : 'not-allowed',
              opacity: layout?.space ? 1 : 0.6
            }}
            styles={{ body: { padding: '32px 24px' } }}
          >
            <div style={{ marginBottom: 16 }}>
              <BankOutlined style={{ fontSize: 48, color: '#52c41a' }} />
            </div>
            <Title level={3} style={{ margin: '16px 0 8px 0', color: '#52c41a' }}>
              Halls
            </Title>
            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>
              Hall sections within your exhibition space
            </Text>
            
            <div>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 'bold' }}>
                {layout?.space?.halls.length || 0} Halls Created
              </Text>
              <br />
              <Button type="primary" ghost disabled={!layout?.space}>
                Manage Halls
              </Button>
            </div>
          </Card>
        </Col>

        {/* Stalls */}
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={handleStallClick}
            style={{ 
              textAlign: 'center', 
              height: 280,
              border: '2px solid #d9d9d9',
              borderRadius: 16,
              cursor: (layout?.space && layout.space.halls.length > 0) ? 'pointer' : 'not-allowed',
              opacity: (layout?.space && layout.space.halls.length > 0) ? 1 : 0.6
            }}
            styles={{ body: { padding: '32px 24px' } }}
          >
            <div style={{ marginBottom: 16 }}>
              <ShopOutlined style={{ fontSize: 48, color: '#fa8c16' }} />
            </div>
            <Title level={3} style={{ margin: '16px 0 8px 0', color: '#fa8c16' }}>
              Stalls
            </Title>
            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>
              Individual stalls within halls for exhibitors
            </Text>
            
            <div>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 'bold' }}>
                {layout?.space?.halls.reduce((acc, hall) => acc + hall.stalls.length, 0) || 0} Stalls Created
              </Text>
              <br />
              <Button
                type="primary"
                ghost 
                disabled={!layout?.space || layout.space.halls.length === 0}
              >
                Manage Stalls
              </Button>
            </div>
          </Card>
        </Col>

        {/* Fixtures */}
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            onClick={handleFixtureClick}
            style={{ 
              textAlign: 'center', 
              height: 280,
              border: '2px solid #d9d9d9',
              borderRadius: 16,
              cursor: 'pointer'
            }}
            styles={{ body: { padding: '32px 24px' } }}
          >
            <div style={{ marginBottom: 16 }}>
              <SettingOutlined style={{ fontSize: 48, color: '#d46b08' }} />
            </div>
            <Title level={3} style={{ margin: '16px 0 8px 0', color: '#d46b08' }}>
              Fixtures
            </Title>
            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>
              Global fixtures like entrances, restrooms, and facilities
            </Text>
            
            <div>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 'bold' }}>
                {layout?.fixtures.length || 0} Fixtures Created
              </Text>
              <br />
              <Button type="primary" ghost>
                Manage Fixtures
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SelectionView; 