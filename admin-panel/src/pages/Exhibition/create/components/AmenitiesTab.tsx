import React, { useState } from 'react'
import {
  Form,
  Input,
  Card,
  Typography,
  Button,
  Table,
  Select,
  InputNumber,
  Popconfirm,
  Tabs
} from 'antd'
import { 
  ToolOutlined, 
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  GiftOutlined,
  StarOutlined
} from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'

const { TextArea } = Input
const { Title, Text } = Typography
const { Option } = Select

interface AmenitiesTabProps {
  form: FormInstance
}

const AmenitiesTab: React.FC<AmenitiesTabProps> = ({ form }) => {
  const [basicAmenities, setBasicAmenities] = useState<Array<{
    type: string;
    name: string;
    description: string;
    perSqm: number;
    quantity: number;
  }>>([])

  const [extraAmenities, setExtraAmenities] = useState<Array<{
    type: string;
    name: string;
    description: string;
    rate: number;
  }>>([])

  const amenityTypes = [
    { value: 'facility', label: 'Facility' },
    { value: 'service', label: 'Service' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'other', label: 'Other' }
  ]

  // Basic Amenities Handlers
  const handleAddBasicAmenity = () => {
    const newAmenity = { type: 'facility', name: '', description: '', perSqm: 9, quantity: 1 }
    const updated = [...basicAmenities, newAmenity]
    setBasicAmenities(updated)
    form.setFieldValue('basicAmenities', updated)
  }

  const handleRemoveBasicAmenity = (index: number) => {
    const updated = basicAmenities.filter((_, i) => i !== index)
    setBasicAmenities(updated)
    form.setFieldValue('basicAmenities', updated)
  }

  const handleBasicAmenityChange = (index: number, field: string, value: any) => {
    const updated = [...basicAmenities]
    updated[index] = { ...updated[index], [field]: value }
    setBasicAmenities(updated)
    form.setFieldValue('basicAmenities', updated)
  }

  // Extra Amenities Handlers
  const handleAddExtraAmenity = () => {
    const newAmenity = { type: 'service', name: '', description: '', rate: 0 }
    const updated = [...extraAmenities, newAmenity]
    setExtraAmenities(updated)
    form.setFieldValue('amenities', updated)
  }

  const handleRemoveExtraAmenity = (index: number) => {
    const updated = extraAmenities.filter((_, i) => i !== index)
    setExtraAmenities(updated)
    form.setFieldValue('amenities', updated)
  }

  const handleExtraAmenityChange = (index: number, field: string, value: any) => {
    const updated = [...extraAmenities]
    updated[index] = { ...updated[index], [field]: value }
    setExtraAmenities(updated)
    form.setFieldValue('amenities', updated)
  }

  const basicAmenityColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (value: string, _: any, index: number) => (
        <Select
          value={value}
          onChange={(val) => handleBasicAmenityChange(index, 'type', val)}
          style={{ width: '100%' }}
          size="small"
        >
          {amenityTypes.map(type => (
            <Option key={type.value} value={type.value}>{type.label}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: string, _: any, index: number) => (
        <Input
          value={value}
          placeholder="e.g., Table"
          onChange={(e) => handleBasicAmenityChange(index, 'name', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (value: string, _: any, index: number) => (
        <Input
          value={value}
          placeholder="e.g., Standard exhibition table"
          onChange={(e) => handleBasicAmenityChange(index, 'description', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: 'Per Sq.m',
      dataIndex: 'perSqm',
      key: 'perSqm',
      width: 100,
      render: (value: number, _: any, index: number) => (
        <InputNumber
          value={value}
          min={1}
          max={100}
          onChange={(val) => handleBasicAmenityChange(index, 'perSqm', val || 1)}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (value: number, _: any, index: number) => (
        <InputNumber
          value={value}
          min={1}
          onChange={(val) => handleBasicAmenityChange(index, 'quantity', val || 1)}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Popconfirm
          title="Remove this amenity?"
          onConfirm={() => handleRemoveBasicAmenity(index)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            size="small"
          />
        </Popconfirm>
      ),
    },
  ]

  const extraAmenityColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (value: string, _: any, index: number) => (
        <Select
          value={value}
          onChange={(val) => handleExtraAmenityChange(index, 'type', val)}
          style={{ width: '100%' }}
          size="small"
        >
          {amenityTypes.map(type => (
            <Option key={type.value} value={type.value}>{type.label}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: string, _: any, index: number) => (
        <Input
          value={value}
          placeholder="e.g., Extra Spotlight"
          onChange={(e) => handleExtraAmenityChange(index, 'name', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (value: string, _: any, index: number) => (
        <Input
          value={value}
          placeholder="e.g., Additional spotlight for better visibility"
          onChange={(e) => handleExtraAmenityChange(index, 'description', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: 'Rate (₹)',
      dataIndex: 'rate',
      key: 'rate',
      width: 120,
      render: (value: number, _: any, index: number) => (
        <InputNumber
          value={value}
          min={0}
          onChange={(val) => handleExtraAmenityChange(index, 'rate', val || 0)}
          size="small"
          style={{ width: '100%' }}
          formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value!.replace(/₹\s?|(,*)/g, ''))}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Popconfirm
          title="Remove this amenity?"
          onConfirm={() => handleRemoveExtraAmenity(index)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            size="small"
          />
        </Popconfirm>
      ),
    },
  ]

  const amenityTabItems = [
    {
      key: 'basic',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GiftOutlined />
          Basic Amenities
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Included Amenities</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '13px' }}>
                These amenities are automatically calculated and included with stall bookings
              </Text>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddBasicAmenity}
              size="small"
            >
              Add Basic Amenity
            </Button>
          </div>

          <Form.Item name="basicAmenities" style={{ marginBottom: 0 }}>
            {basicAmenities.length > 0 ? (
              <Table
                dataSource={basicAmenities.map((amenity, index) => ({ ...amenity, key: index }))}
                columns={basicAmenityColumns}
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                background: '#fafafa',
                borderRadius: '8px',
                border: '1px dashed #d9d9d9'
              }}>
                <Text type="secondary">
                  No basic amenities configured. These are automatically included with stall bookings.
                </Text>
              </div>
            )}
          </Form.Item>
        </div>
      )
    },
    {
      key: 'extra',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarOutlined />
          Extra Amenities
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Paid Add-ons</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Optional amenities that customers can purchase during booking
              </Text>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddExtraAmenity}
              size="small"
            >
              Add Extra Amenity
            </Button>
          </div>

          <Form.Item name="amenities" style={{ marginBottom: 0 }}>
            {extraAmenities.length > 0 ? (
              <Table
                dataSource={extraAmenities.map((amenity, index) => ({ ...amenity, key: index }))}
                columns={extraAmenityColumns}
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                background: '#fafafa',
                borderRadius: '8px',
                border: '1px dashed #d9d9d9'
              }}>
                <Text type="secondary">
                  No extra amenities configured. Add paid amenities that customers can choose.
                </Text>
              </div>
            )}
          </Form.Item>
        </div>
      )
    }
  ]

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Special Requirements */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ToolOutlined style={{ color: '#6366f1' }} />
            <span>Special Requirements</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Form.Item
          name="specialRequirements"
          label="Special Requirements"
          extra="Any special requirements or instructions for exhibitors"
        >
          <TextArea
            placeholder="Enter any special requirements, restrictions, or instructions for exhibitors..."
            rows={4}
            showCount
            maxLength={1000}
          />
        </Form.Item>
      </Card>

      {/* Amenities Configuration */}
      <Card 
        title="Amenities Configuration"
        style={{ marginBottom: '24px' }}
      >
        <Tabs
          defaultActiveKey="basic"
          items={amenityTabItems}
          type="card"
        />
      </Card>

      {/* Amenities Guidelines */}
      <Card 
        size="small" 
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <InfoCircleOutlined style={{ color: '#6366f1', marginTop: '2px' }} />
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: '8px', color: '#1e293b' }}>
              Amenities Configuration Guide
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <strong>Basic Amenities:</strong><br/>
              • Automatically included with stall bookings based on stall size<br/>
              • "Per Sq.m" defines area coverage (e.g., 1 table per 9 sq.m)<br/>
              • "Quantity" is the base amount provided per calculation<br/>
              • Examples: Tables, chairs, basic lighting, power outlets<br/><br/>
              
              <strong>Extra Amenities:</strong><br/>
              • Optional paid add-ons customers can purchase<br/>
              • Set competitive rates for additional services<br/>
              • Examples: Extra lighting, promotional displays, WiFi, catering<br/>
              • Clearly describe what's included in each amenity
            </Text>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AmenitiesTab 