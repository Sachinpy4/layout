import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  InputNumber,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Table,
  Popconfirm,
  message
} from 'antd'
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'
import stallService, { type StallType } from '@/services/stall.service'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { TextArea } = Input
const { Text } = Typography
const { Option } = Select

interface BasicInformationTabProps {
  form: FormInstance
}

const BasicInformationTab: React.FC<BasicInformationTabProps> = ({ form }) => {
  const [stallTypes, setStallTypes] = useState<StallType[]>([])
  const [stallRates, setStallRates] = useState<Array<{ stallTypeId: string; rate: number }>>([])

  // Fetch stall types from API
  useEffect(() => {
    const fetchStallTypes = async () => {
      try {
        const response = await stallService.getStallTypes({ isActive: true })
        setStallTypes(response.data || [])
      } catch (error) {
        console.error('Error fetching stall types:', error)
        message.error('Failed to load stall types')
      }
    }

    fetchStallTypes()
  }, [])

  // Load existing stallRates when component mounts or when stallTypes are loaded
  useEffect(() => {
    const loadExistingStallRates = () => {
      try {
        const allFormValues = form.getFieldsValue()
        const existingStallRates = allFormValues.stallRates
        
        // console.log('Checking for existing stall rates:', existingStallRates)
        
        if (existingStallRates && Array.isArray(existingStallRates) && existingStallRates.length > 0) {
          // Normalize the stallRates to handle both populated objects and string IDs
          const normalizedStallRates = existingStallRates.map((rate: any) => ({
            stallTypeId: typeof rate.stallTypeId === 'object' ? rate.stallTypeId._id : rate.stallTypeId,
            rate: rate.rate
          }))
          
          console.log('Loading existing stall rates (normalized):', normalizedStallRates)
          setStallRates(normalizedStallRates)
        }
      } catch (error) {
        console.log('Error loading existing stall rates:', error)
      }
    }

    // Load immediately
    loadExistingStallRates()

    // Also check after a short delay to handle async form initialization
    const timer = setTimeout(loadExistingStallRates, 200)

    return () => clearTimeout(timer)
  }, [form, stallTypes])

  // Additional effect to sync state when form values change externally
  useEffect(() => {
    // Set up form field listener for stallRates changes
    const currentStallRates = form.getFieldValue('stallRates')
    if (currentStallRates && Array.isArray(currentStallRates)) {
      // Normalize the data before comparing
      const normalizedCurrentRates = currentStallRates.map((rate: any) => ({
        stallTypeId: typeof rate.stallTypeId === 'object' ? rate.stallTypeId._id : rate.stallTypeId,
        rate: rate.rate
      }))
      
      if (JSON.stringify(normalizedCurrentRates) !== JSON.stringify(stallRates)) {
        console.log('Form stallRates field changed externally, syncing state:', normalizedCurrentRates)
        setStallRates(normalizedCurrentRates)
      }
    }
  }, [form.getFieldValue('stallRates')])

  const handleAddStallRate = () => {
    const newRate = { stallTypeId: '', rate: 0 }
    const updatedRates = [...stallRates, newRate]
    setStallRates(updatedRates)
    form.setFieldValue('stallRates', updatedRates)
  }

  const handleRemoveStallRate = (index: number) => {
    const updatedRates = stallRates.filter((_, i) => i !== index)
    setStallRates(updatedRates)
    form.setFieldValue('stallRates', updatedRates)
  }

  const handleStallRateChange = (index: number, field: 'stallTypeId' | 'rate', value: any) => {
    const updatedRates = [...stallRates]
    updatedRates[index] = { ...updatedRates[index], [field]: value }
    setStallRates(updatedRates)
    form.setFieldValue('stallRates', updatedRates)
  }

  const stallRateColumns = [
    {
      title: 'Stall Type',
      dataIndex: 'stallTypeId',
      key: 'stallTypeId',
      render: (value: string, _: any, index: number) => (
        <Select
          value={value}
          placeholder="Select stall type"
          onChange={(val) => handleStallRateChange(index, 'stallTypeId', val)}
          style={{ width: '100%' }}
        >
          {stallTypes.map(type => (
            <Option key={type._id} value={type._id}>
              {type.name} - {type.description}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Rate per Sq.m (₹)',
      dataIndex: 'rate',
      key: 'rate',
      render: (value: number, _: any, index: number) => (
        <InputNumber
          value={value}
          min={0}
          placeholder="Enter rate"
          onChange={(val) => handleStallRateChange(index, 'rate', val || 0)}
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
          title="Remove this stall rate?"
          onConfirm={() => handleRemoveStallRate(index)}
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

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Basic Exhibition Details */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#6366f1' }} />
            <span>Exhibition Details</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Exhibition Name"
              rules={[
                { required: true, message: 'Please enter exhibition name' },
                { min: 3, message: 'Name must be at least 3 characters' }
              ]}
            >
              <Input 
                placeholder="Enter exhibition name"
                size="large"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="venue"
              label="Venue"
              rules={[{ required: true, message: 'Please enter venue' }]}
            >
              <Input 
                placeholder="Enter venue location"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter description' },
                { min: 10, message: 'Description must be at least 10 characters' }
              ]}
            >
              <TextArea 
                placeholder="Enter exhibition description"
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="dateRange"
              label="Exhibition Duration"
              rules={[{ required: true, message: 'Please select exhibition dates' }]}
            >
              <RangePicker
                size="large"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                placeholder={['Start Date', 'End Date']}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="registrationDeadline"
              label="Registration Deadline"
              tooltip="Last date for registration submissions"
            >
              <DatePicker
                size="large"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                placeholder="Select registration deadline"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="invoicePrefix"
              label="Invoice Prefix"
              tooltip="Prefix for invoice numbers (e.g., EXH2024)"
            >
              <Input 
                placeholder="e.g., EXH2024"
                size="large"
                maxLength={10}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Status and Layout Configuration */}
      <Card 
        title="Configuration" 
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Form.Item
              name="status"
              label="Status"
              initialValue="draft"
            >
              <Select size="large">
                <Option value="draft">Draft</Option>
                <Option value="published">Published</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="isActive"
              label="Active Status"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="theme"
              label="Theme"
              initialValue="default"
            >
              <Select size="large">
                <Option value="default">Default</Option>
                <Option value="modern">Modern</Option>
                <Option value="classic">Classic</Option>
                <Option value="minimal">Minimal</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Layout Dimensions */}
      <Card 
        title="Layout Dimensions" 
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name={['dimensions', 'width']}
              label="Canvas Width (units)"
              initialValue={100}
              rules={[{ required: true, message: 'Please enter width' }]}
            >
              <InputNumber
                min={10}
                max={1000}
                size="large"
                style={{ width: '100%' }}
                placeholder="Enter width"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name={['dimensions', 'height']}
              label="Canvas Height (units)"
              initialValue={100}
              rules={[{ required: true, message: 'Please enter height' }]}
            >
              <InputNumber
                min={10}
                max={1000}
                size="large"
                style={{ width: '100%' }}
                placeholder="Enter height"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Stall Rates Configuration */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Stall Rates Configuration</span>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddStallRate}
              size="small"
            >
              Add Rate
            </Button>
          </div>
        }
      >
        <Form.Item name="stallRates" style={{ marginBottom: 0 }} initialValue={[]}>
          {stallRates.length > 0 ? (
            <Table
              dataSource={stallRates.map((rate, index) => ({ ...rate, key: index }))}
              columns={stallRateColumns}
              pagination={false}
              size="small"
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
                No stall rates configured. Click "Add Rate" to get started.
              </Text>
            </div>
          )}
        </Form.Item>
      </Card>
    </div>
  )
}

export default BasicInformationTab 