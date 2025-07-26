import React from 'react';
import { Card, Row, Col, Space, Typography, Button, Tag } from 'antd';
import { 
  ArrowLeftOutlined, 
  PlusOutlined, 
  UndoOutlined, 
  RedoOutlined, 
  SaveOutlined
} from '@ant-design/icons';
import { LayoutData, ViewMode } from '../types/layout-types';
import { Exhibition } from '../../../../types/index';
import LayoutCanvas from './LayoutCanvas';


const { Title, Text } = Typography;

interface WorkspaceViewProps {
  exhibition: Exhibition;
  layout: LayoutData;
  viewMode: ViewMode;
  saving: boolean;
  onBackToSelection: () => void;
  onSave: () => void;

  onShowSpaceModal: () => void;
  onShowHallModal: () => void;
  onShowStallModal: () => void;
  onShowFixtureModal: () => void;
  onMouseDown: (e: React.MouseEvent, targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture') => void;
  onEditStall: (stallId: string) => void;
  onEditHall: (hallId: string) => void;
  selectedHallForStalls?: string | null;
  onHallSelect?: (hallId: string) => void;
  onHallSelectForDelete?: (hallId: string | null) => void;
  onPositionUpdate: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', newX: number, newY: number) => void;
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>;
  isModalOpen?: boolean;
}

const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  layout,
  viewMode,
  saving,
  onBackToSelection,
  onSave,
  onShowSpaceModal,
  onShowHallModal,
  onShowStallModal,
  onShowFixtureModal,
  onMouseDown,
  onEditStall,
  onEditHall,
  selectedHallForStalls,
  onHallSelect,
  onHallSelectForDelete,
  onPositionUpdate,
  onDragComplete,
  isModalOpen
}) => {
  const getViewTitle = () => {
    switch (viewMode) {
      case 'space': return 'Exhibition Space Management';
      case 'hall': return 'Hall Management';
      case 'stall': return 'Stall Management';
      case 'fixture': return 'Fixture Management';
      default: return 'Layout Management';
    }
  };

  const getViewDescription = () => {
    switch (viewMode) {
      case 'space': return 'Design your main exhibition space';
      case 'hall': return 'Add and organize halls within your space';
      case 'stall': return 'Create stalls for exhibitors within halls';
      case 'fixture': return 'Add global fixtures and facilities';
      default: return 'Manage your exhibition layout';
    }
  };

  const renderActionButton = () => {
    switch (viewMode) {
      case 'space':
        return !layout.space ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onShowSpaceModal}
            size="large"
          >
            Create Exhibition Space
          </Button>
        ) : (
          <Button icon={<PlusOutlined />} onClick={onShowSpaceModal}>
            Edit Space
          </Button>
        );
      case 'hall':
        return (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onShowHallModal}
            size="large"
          >
            Add Hall
          </Button>
        );
      case 'stall':
        const selectedHall = selectedHallForStalls ? layout.space?.halls.find(h => h.id === selectedHallForStalls) : null;
        return (
          <Space>
            {selectedHall ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color="blue" style={{ margin: 0 }}>
                  Hall: {selectedHall.name}
                </Tag>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={onShowStallModal}
                  size="large"
                >
                  Add Stall to {selectedHall.name}
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  First click a hall to select it
                </Typography.Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={onShowStallModal}
                  size="large"
                  disabled
                >
                  Add New Stall
                </Button>
              </div>
            )}
          </Space>
        );
      case 'fixture':
        return (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onShowFixtureModal}
            size="large"
          >
            Add New Fixture
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={onBackToSelection}
              type="text"
              style={{ marginRight: 16 }}
            >
              Back to Selection
            </Button>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {getViewTitle()}
              </Title>
              <Text type="secondary">
                {getViewDescription()}
              </Text>
            </div>
          </div>
          <div>
            <Space>
              {renderActionButton()}
              <Button icon={<UndoOutlined />} disabled>
                Undo
              </Button>
              <Button icon={<RedoOutlined />} disabled>
                Redo
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                loading={saving}
                onClick={onSave}
              >
                Save Layout
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      {viewMode === 'space' || viewMode === 'hall' || viewMode === 'stall' ? (
        // Full width canvas for Exhibition Space, Hall Management, and Stall Management
        <Card 
          title="Layout Canvas"
          style={{ height: 'calc(100vh - 200px)', position: 'relative' }}
        >
          <LayoutCanvas
            layout={layout}
            viewMode={viewMode}
            onMouseDown={onMouseDown}
            onEditStall={onEditStall}
            onEditHall={onEditHall}
            onHallSelect={onHallSelect}
            onHallSelectForDelete={onHallSelectForDelete}
            onPositionUpdate={onPositionUpdate}
            onDragComplete={onDragComplete}
            isModalOpen={isModalOpen}
          />
        </Card>
      ) : (
        // Three column layout for fixture views only
        <Row gutter={24} style={{ height: '100%' }}>
          {/* Sidebar */}
          <Col span={6}>
            <Card title={`${getViewTitle()} Tools`} style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">


                {viewMode === 'fixture' && (
                  <div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={onShowFixtureModal}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      Add New Fixture
                    </Button>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center', marginTop: 8 }}>
                      {layout.fixtures.length || 0} fixture(s) created
                    </Text>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Canvas Area */}
          <Col span={12}>
            <Card 
              title="Layout Canvas"
              style={{ height: '100%', position: 'relative' }}
            >
              <LayoutCanvas
                layout={layout}
                viewMode={viewMode}
                onMouseDown={onMouseDown}
                onEditStall={onEditStall}
                onEditHall={onEditHall}
                onHallSelect={onHallSelect}
                onHallSelectForDelete={onHallSelectForDelete}
                onPositionUpdate={onPositionUpdate}
                onDragComplete={onDragComplete}
                isModalOpen={isModalOpen}
              />
            </Card>
          </Col>

          {/* Properties Panel */}
          <Col span={6}>
            <Card title="Properties" style={{ height: '100%' }}>
              <div>
                <Title level={5}>Layout Info</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Exhibition Space:</Text>
                    <br />
                    <Text type="secondary">
                      {layout.space ? `${layout.space.widthSqm}m × ${layout.space.heightSqm}m` : 'Not created'}
                    </Text>
                  </div>
                  <div>
                    <Text strong>Halls:</Text>
                    <br />
                    <Text type="secondary">{layout.space?.halls.length || 0}</Text>
                  </div>
                  <div>
                    <Text strong>Stalls:</Text>
                    <br />
                    <Text type="secondary">
                      {layout.space?.halls.reduce((acc, hall) => acc + hall.stalls.length, 0) || 0}
                    </Text>
                  </div>
                  <div>
                    <Text strong>Fixtures:</Text>
                    <br />
                    <Text type="secondary">{layout.fixtures.length || 0}</Text>
                  </div>
                  <div>
                    <Text strong>Scale:</Text>
                    <br />
                    <Text type="secondary">{layout.pixelsPerSqm} pixels = 1 m²</Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default WorkspaceView; 