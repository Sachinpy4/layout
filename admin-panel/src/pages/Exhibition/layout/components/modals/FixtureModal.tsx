import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Space, Button } from 'antd';

interface FixtureModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const FixtureModal: React.FC<FixtureModalProps> = ({
  visible,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Add Fixture"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          width: 40,
          height: 40
        }}
      >
        <Form.Item
          name="name"
          label="Fixture Name"
          rules={[{ required: true, message: 'Please enter fixture name' }]}
        >
          <Input placeholder="Enter fixture name" />
        </Form.Item>
        
        <Form.Item
          name="type"
          label="Fixture Type"
          rules={[{ required: true, message: 'Please select fixture type' }]}
        >
          <Select placeholder="Choose fixture type">
            <Select.Option value="entrance">Entrance</Select.Option>
            <Select.Option value="exit">Exit</Select.Option>
            <Select.Option value="restroom">Restroom</Select.Option>
            <Select.Option value="cafe">Cafe</Select.Option>
            <Select.Option value="info">Information Desk</Select.Option>
            <Select.Option value="stage">Stage</Select.Option>
            <Select.Option value="pillar">Pillar</Select.Option>
            <Select.Option value="decoration">Decoration</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="width"
          label="Width (pixels)"
          rules={[
            { required: true, message: 'Please enter width' },
            { type: 'number', min: 20, max: 200, message: 'Width must be between 20-200 pixels' }
          ]}
        >
          <InputNumber 
            min={20} 
            max={200} 
            placeholder="Width in pixels"
            style={{ width: '100%' }}
            addonAfter="pixels"
          />
        </Form.Item>
        
        <Form.Item
          name="height"
          label="Height (pixels)"
          rules={[
            { required: true, message: 'Please enter height' },
            { type: 'number', min: 20, max: 200, message: 'Height must be between 20-200 pixels' }
          ]}
        >
          <InputNumber 
            min={20} 
            max={200} 
            placeholder="Height in pixels"
            style={{ width: '100%' }}
            addonAfter="pixels"
          />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Add Fixture
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FixtureModal; 