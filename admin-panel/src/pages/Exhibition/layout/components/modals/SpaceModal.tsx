import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Space, Button, Typography, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Exhibition } from '../../../../../types/index';

const { Text } = Typography;

interface SpaceModalProps {
  visible: boolean;
  exhibition: Exhibition;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  onDelete?: () => void;
  // Add props for edit mode
  existingSpace?: any;
  mode?: 'create' | 'edit';
}

const SpaceModal: React.FC<SpaceModalProps> = ({
  visible,
  exhibition,
  onCancel,
  onSubmit,
  onDelete,
  existingSpace,
  mode = 'create'
}) => {
  const [form] = Form.useForm();

  // Populate form when editing existing space
  useEffect(() => {
    if (visible && mode === 'edit' && existingSpace) {
      form.setFieldsValue({
        name: existingSpace.name,
        widthSqm: existingSpace.widthSqm,
        heightSqm: existingSpace.heightSqm
      });
    } else if (visible && mode === 'create') {
      form.resetFields();
    }
  }, [visible, mode, existingSpace, form]);



  const getModalTitle = () => {
    switch (mode) {
      case 'edit':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditOutlined style={{ color: '#1890ff' }} />
            <span>Edit Exhibition Space</span>
          </div>
        );
      default:
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusOutlined style={{ color: '#52c41a' }} />
            <span>Create Exhibition Space</span>
          </div>
        );
    }
  };

  const getButtonText = () => {
    return mode === 'edit' ? 'Update Space' : 'Create Space';
  };

  const showDeleteButton = mode === 'edit' && onDelete;

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      {mode === 'edit' && existingSpace && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          backgroundColor: '#f0f8ff', 
          borderRadius: 6, 
          border: '1px solid #1890ff' 
        }}>
          <Text strong style={{ color: '#1890ff' }}>
            Editing: {existingSpace.name}
          </Text>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Current Size: {existingSpace.widthSqm}m × {existingSpace.heightSqm}m
            {existingSpace.halls && existingSpace.halls.length > 0 && 
              ` • ${existingSpace.halls.length} halls`
            }
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          name: mode === 'create' ? `${exhibition?.name} Exhibition Space` : undefined,
          widthSqm: mode === 'create' ? 30 : undefined,
          heightSqm: mode === 'create' ? 20 : undefined
        }}
      >
        <Form.Item
          name="name"
          label="Space Name"
          rules={[{ required: true, message: 'Please enter space name' }]}
        >
          <Input placeholder="Enter exhibition space name" />
        </Form.Item>
        
        <Form.Item
          name="widthSqm"
          label="Width (square meters)"
          rules={[
            { required: true, message: 'Please enter width' },
            { type: 'number', min: 10, max: 200, message: 'Width must be between 10-200 meters' }
          ]}
        >
          <InputNumber 
            min={10} 
            max={200} 
            placeholder="Width in meters"
            style={{ width: '100%' }}
            addonAfter="meters"
          />
        </Form.Item>
        
        <Form.Item
          name="heightSqm"
          label="Height (square meters)"
          rules={[
            { required: true, message: 'Please enter height' },
            { type: 'number', min: 10, max: 200, message: 'Height must be between 10-200 meters' }
          ]}
        >
          <InputNumber 
            min={10} 
            max={200} 
            placeholder="Height in meters"
            style={{ width: '100%' }}
            addonAfter="meters"
          />
        </Form.Item>
        
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            💡 <strong>Grid System:</strong> Grid lines will appear inside your Exhibition Space. 
            Each grid square represents 1 square meter for precise measurements.
            {mode === 'edit' && (
              <span style={{ color: '#fa8c16', fontWeight: 'bold' }}> 
                <br />⚠️ Changing dimensions may affect existing halls and stalls!
              </span>
            )}
          </Text>
        </div>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {getButtonText()}
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            {showDeleteButton && (
              <Popconfirm
                title="Delete Exhibition Space"
                description="Are you sure you want to delete this exhibition space? This will also delete all halls and stalls inside it. This action cannot be undone."
                onConfirm={onDelete}
                okText="Yes, Delete"
                cancelText="Cancel"
                okType="danger"
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  Delete Space
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SpaceModal; 