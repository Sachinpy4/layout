import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Space, Button, ColorPicker, Card, Typography, Divider } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface HallModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  exhibitionSpace?: {
    widthSqm: number;
    heightSqm: number;
    pixelsPerSqm: number;
  };
  editingHall?: any;
  mode?: 'create' | 'edit';
  onDelete?: (hallId: string) => void;
}

const HallModal: React.FC<HallModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  exhibitionSpace,
  editingHall,
  mode = 'create',
  onDelete
}) => {
  const [form] = Form.useForm();

  // Populate form with hall data when in edit mode
  useEffect(() => {
    if (visible && mode === 'edit' && editingHall) {
      if (form) { // Add safety check
        form.setFieldsValue({
          name: editingHall.name,
          width: editingHall.widthSqm,
          height: editingHall.heightSqm,
          color: editingHall.color || '#f6ffed',
          description: editingHall.description || ''
        });
      }
    } else if (visible && mode === 'create') {
      if (form) { // Add safety check
        form.resetFields();
      }
    }
  }, [visible, editingHall, mode]); // Remove form from dependencies

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert meter dimensions to pixels for internal storage
      const hallData = {
        ...values,
        widthSqm: values.width,  // Store meter dimensions
        heightSqm: values.height,
        width: values.width * (exhibitionSpace?.pixelsPerSqm || 50),   // Convert to pixels
        height: values.height * (exhibitionSpace?.pixelsPerSqm || 50),
        color: values.color || '#f6ffed',
        ...(mode === 'edit' && editingHall && { id: editingHall.id })
      };
      
      onSubmit(hallData);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleDelete = () => {
    if (onDelete && editingHall) {
      onDelete(editingHall.id);
    }
  };

  // Calculate maximum hall dimensions based on exhibition space
  const maxWidth = exhibitionSpace?.widthSqm || 50;
  const maxHeight = exhibitionSpace?.heightSqm || 50;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HomeOutlined style={{ color: '#52c41a' }} />
          <span>{mode === 'edit' ? 'Edit Exhibition Hall' : 'Create Exhibition Hall'}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Card style={{ marginBottom: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <Text type="secondary">
          <strong>Hall Guidelines:</strong> {mode === 'edit' ? 'Update hall properties and layout.' : 'Create functional halls within your exhibition space.'} 
          Each hall can contain multiple stalls and should be sized appropriately for visitor flow.
        </Text>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          width: Math.min(10, maxWidth - 2), // Default 10m or max-2m
          height: Math.min(8, maxHeight - 2), // Default 8m or max-2m
          color: '#f6ffed',
          description: ''
        }}
      >
        <Form.Item
          name="name"
          label="Hall Name"
          rules={[
            { required: true, message: 'Please enter a hall name' },
            { min: 2, message: 'Name must be at least 2 characters' },
            { max: 50, message: 'Name cannot exceed 50 characters' }
          ]}
        >
          <Input 
            placeholder="e.g., Main Hall, North Wing, Technology Pavilion" 
            size="large"
          />
        </Form.Item>

        <Space direction="horizontal" size="large" style={{ width: '100%' }}>
          <Form.Item
            name="width"
            label={`Width (meters)`}
            rules={[
              { required: true, message: 'Please enter hall width' },
              { 
                type: 'number', 
                min: 2, 
                max: maxWidth - 1, 
                message: `Width must be between 2m and ${maxWidth - 1}m` 
              }
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber 
              min={2} 
              max={maxWidth - 1} 
              step={0.5}
              placeholder="Width in meters"
              style={{ width: '100%' }}
              addonAfter="meters"
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="height"
            label={`Height (meters)`}
            rules={[
              { required: true, message: 'Please enter hall height' },
              { 
                type: 'number', 
                min: 2, 
                max: maxHeight - 1, 
                message: `Height must be between 2m and ${maxHeight - 1}m` 
              }
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber 
              min={2} 
              max={maxHeight - 1} 
              step={0.5}
              placeholder="Height in meters"
              style={{ width: '100%' }}
              addonAfter="meters"
              size="large"
            />
          </Form.Item>
        </Space>

        {exhibitionSpace && (
          <Card size="small" style={{ marginBottom: 16, background: '#f0f8ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <Text type="secondary">Exhibition Space: {exhibitionSpace.widthSqm}m × {exhibitionSpace.heightSqm}m</Text>
              <Text type="secondary">Resolution: {exhibitionSpace.pixelsPerSqm} pixels/meter</Text>
            </div>
          </Card>
        )}

        <Form.Item
          name="description"
          label="Description (Optional)"
        >
          <Input.TextArea 
            placeholder="Brief description of this hall's purpose or contents"
            rows={2}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="color"
          label="Hall Color"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ColorPicker
              value="#f6ffed"
              presets={[
                {
                  label: 'Recommended',
                  colors: [
                    '#f6ffed', // Light green
                    '#e6f7ff', // Light blue  
                    '#fff7e6', // Light orange
                    '#f9f0ff', // Light purple
                    '#fff0f6', // Light pink
                    '#f0f8ff', // Light cyan
                  ],
                },
              ]}
            />
            <Text type="secondary">Choose a color to help distinguish this hall</Text>
          </div>
        </Form.Item>

        <Divider />
        
        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            {mode === 'edit' && onDelete && (
              <Button 
                danger 
                onClick={handleDelete}
                size="large"
              >
                Delete Hall
              </Button>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <Space>
                <Button onClick={onCancel} size="large">
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  style={{ minWidth: 120 }}
                >
                  {mode === 'edit' ? 'Update Hall' : 'Create Hall'}
                </Button>
              </Space>
            </div>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HallModal; 