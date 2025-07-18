import React, { useState, useEffect } from 'react'
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
  Switch,
  Tabs
} from 'antd'
import { 
  CalculatorOutlined, 
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
  TagOutlined,
  CrownOutlined
} from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'

const { Title, Text } = Typography
const { Option } = Select

interface TaxDiscountTabProps {
  form: FormInstance
}

const TaxDiscountTab: React.FC<TaxDiscountTabProps> = ({ form }) => {
  const [taxConfig, setTaxConfig] = useState<Array<{
    name: string;
    rate: number;
    isActive: boolean;
  }>>([])

  const [discountConfig, setDiscountConfig] = useState<Array<{
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    isActive: boolean;
  }>>([])

  const [publicDiscountConfig, setPublicDiscountConfig] = useState<Array<{
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    isActive: boolean;
  }>>([])

  // SIMPLIFIED: Sync local state with form values - runs when form instance changes
  useEffect(() => {
    const formValues = form.getFieldsValue()
    
    
    // Always sync with form values, including empty arrays
    setTaxConfig(formValues.taxConfig || [])
    setDiscountConfig(formValues.discountConfig || [])
    setPublicDiscountConfig(formValues.publicDiscountConfig || [])
    
  }, [form]) // Only run when form instance changes
  
  // Additional effect to handle initial data loading
  useEffect(() => {
    const interval = setInterval(() => {
      const formValues = form.getFieldsValue()
      
      // Only update if we have actual data and it's different from current state
      if (formValues.taxConfig && JSON.stringify(formValues.taxConfig) !== JSON.stringify(taxConfig)) {
        setTaxConfig(formValues.taxConfig)
      }
      if (formValues.discountConfig && JSON.stringify(formValues.discountConfig) !== JSON.stringify(discountConfig)) {
        setDiscountConfig(formValues.discountConfig)
      }
      if (formValues.publicDiscountConfig && JSON.stringify(formValues.publicDiscountConfig) !== JSON.stringify(publicDiscountConfig)) {
        setPublicDiscountConfig(formValues.publicDiscountConfig)
      }
    }, 500) // Check every 500ms for form updates
    
    // Clear interval after 5 seconds (should be enough for form initialization)
    const timeout = setTimeout(() => clearInterval(interval), 5000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [taxConfig, discountConfig, publicDiscountConfig])

  // Tax Configuration Handlers
  const handleAddTax = () => {
    const newTax = { name: '', rate: 0, isActive: true }
    const updated = [...taxConfig, newTax]
    setTaxConfig(updated)
    form.setFieldValue('taxConfig', updated)
  }

  const handleRemoveTax = (index: number) => {
    const updated = taxConfig.filter((_, i) => i !== index)
    setTaxConfig(updated)
    form.setFieldValue('taxConfig', updated)
  }

  const handleTaxChange = (index: number, field: string, value: any) => {
    const updated = [...taxConfig]
    updated[index] = { ...updated[index], [field]: value }
    setTaxConfig(updated)
    form.setFieldValue('taxConfig', updated)
  }

  // Admin Discount Configuration Handlers
  const handleAddDiscount = () => {
    const newDiscount = { name: '', type: 'percentage' as const, value: 0, isActive: true }
    const updated = [...discountConfig, newDiscount]
    setDiscountConfig(updated)
    form.setFieldValue('discountConfig', updated)
  }

  const handleRemoveDiscount = (index: number) => {
    const updated = discountConfig.filter((_, i) => i !== index)
    setDiscountConfig(updated)
    form.setFieldValue('discountConfig', updated)
  }

  const handleDiscountChange = (index: number, field: string, value: any) => {
    const updated = [...discountConfig]
    updated[index] = { ...updated[index], [field]: value }
    setDiscountConfig(updated)
    form.setFieldValue('discountConfig', updated)
  }

  // Public Discount Configuration Handlers
  const handleAddPublicDiscount = () => {
    const newDiscount = { name: '', type: 'percentage' as const, value: 0, isActive: true }
    const updated = [...publicDiscountConfig, newDiscount]
    setPublicDiscountConfig(updated)
    form.setFieldValue('publicDiscountConfig', updated)
  }

  const handleRemovePublicDiscount = (index: number) => {
    const updated = publicDiscountConfig.filter((_, i) => i !== index)
    setPublicDiscountConfig(updated)
    form.setFieldValue('publicDiscountConfig', updated)
  }

  const handlePublicDiscountChange = (index: number, field: string, value: any) => {
    const updated = [...publicDiscountConfig]
    updated[index] = { ...updated[index], [field]: value }
    setPublicDiscountConfig(updated)
    form.setFieldValue('publicDiscountConfig', updated)
  }

  const taxColumns = [
    {
      title: 'Tax Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: string, _: any, index: number) => (
        <Input
          value={value}
          placeholder="e.g., GST, VAT"
          onChange={(e) => handleTaxChange(index, 'name', e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: 'Rate (%)',
      dataIndex: 'rate',
      key: 'rate',
      width: 120,
      render: (value: number, _: any, index: number) => (
        <InputNumber
          value={value}
          min={0}
          max={100}
          onChange={(val) => handleTaxChange(index, 'rate', val || 0)}
          size="small"
          style={{ width: '100%' }}
          formatter={(value) => `${value}%`}
          parser={(value) => Number(value!.replace('%', ''))}
        />
      ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (value: boolean, _: any, index: number) => (
        <Switch
          checked={value}
          onChange={(checked) => handleTaxChange(index, 'isActive', checked)}
          size="small"
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Popconfirm
          title="Remove this tax?"
          onConfirm={() => handleRemoveTax(index)}
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

  const discountColumns = [
    {
      title: 'Discount Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: string, _: any, index: number, isPublic: boolean = false) => (
        <Input
          value={value}
          placeholder="e.g., Early Bird, Bulk Booking"
          onChange={(e) => isPublic 
            ? handlePublicDiscountChange(index, 'name', e.target.value)
            : handleDiscountChange(index, 'name', e.target.value)
          }
          size="small"
        />
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (value: string, _: any, index: number, isPublic: boolean = false) => (
        <Select
          value={value}
          onChange={(val) => isPublic 
            ? handlePublicDiscountChange(index, 'type', val)
            : handleDiscountChange(index, 'type', val)
          }
          size="small"
          style={{ width: '100%' }}
        >
          <Option value="percentage">Percentage</Option>
          <Option value="fixed">Fixed Amount</Option>
        </Select>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (value: number, record: any, index: number, isPublic: boolean = false) => (
        <InputNumber
          value={value}
          min={0}
          max={record.type === 'percentage' ? 100 : undefined}
          onChange={(val) => isPublic 
            ? handlePublicDiscountChange(index, 'value', val || 0)
            : handleDiscountChange(index, 'value', val || 0)
          }
          size="small"
          style={{ width: '100%' }}
          formatter={(value) => record.type === 'percentage' ? `${value}%` : `₹${value}`}
          parser={(value) => Number(value!.replace(/[₹%]/g, ''))}
        />
      ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (value: boolean, _: any, index: number, isPublic: boolean = false) => (
        <Switch
          checked={value}
          onChange={(checked) => isPublic 
            ? handlePublicDiscountChange(index, 'isActive', checked)
            : handleDiscountChange(index, 'isActive', checked)
          }
          size="small"
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: any, __: any, index: number, isPublic: boolean = false) => (
        <Popconfirm
          title="Remove this discount?"
          onConfirm={() => isPublic 
            ? handleRemovePublicDiscount(index)
            : handleRemoveDiscount(index)
          }
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

  const taxDiscountTabItems = [
    {
      key: 'tax',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalculatorOutlined />
          Tax Configuration
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Tax Setup</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Configure taxes that will be applied to bookings
              </Text>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddTax}
              size="small"
            >
              Add Tax
            </Button>
          </div>

          <Form.Item name="taxConfig" style={{ marginBottom: 0 }}>
            {taxConfig.length > 0 ? (
              <Table
                dataSource={taxConfig.map((tax, index) => ({ ...tax, key: index }))}
                columns={taxColumns}
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
                  No taxes configured. Add taxes like GST, VAT, etc.
                </Text>
              </div>
            )}
          </Form.Item>
        </div>
      )
    },
    {
      key: 'admin-discount',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TagOutlined />
          Admin Discounts
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Admin-Only Discounts</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Discounts that only admins can apply during booking management
              </Text>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddDiscount}
              size="small"
            >
              Add Discount
            </Button>
          </div>

          <Form.Item name="discountConfig" style={{ marginBottom: 0 }}>
            {discountConfig.length > 0 ? (
              <Table
                dataSource={discountConfig.map((discount, index) => ({ ...discount, key: index }))}
                columns={discountColumns.map(col => ({
                  ...col,
                  render: col.render ? (value: any, record: any, index: number) => 
                    (col.render as any)(value, record, index, false) : undefined
                }))}
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
                  No admin discounts configured.
                </Text>
              </div>
            )}
          </Form.Item>
        </div>
      )
    },
    {
      key: 'public-discount',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CrownOutlined />
          Public Discounts
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Public Discounts</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Discounts available to all customers during public booking
              </Text>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddPublicDiscount}
              size="small"
            >
              Add Public Discount
            </Button>
          </div>

          <Form.Item name="publicDiscountConfig" style={{ marginBottom: 0 }}>
            {publicDiscountConfig.length > 0 ? (
              <Table
                dataSource={publicDiscountConfig.map((discount, index) => ({ ...discount, key: index }))}
                columns={discountColumns.map(col => ({
                  ...col,
                  render: col.render ? (value: any, record: any, index: number) => 
                    (col.render as any)(value, record, index, true) : undefined
                }))}
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
                  No public discounts configured.
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
      {/* Tax & Discount Configuration */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PercentageOutlined style={{ color: '#6366f1' }} />
            <span>Tax & Discount Configuration</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Tabs
          defaultActiveKey="tax"
          items={taxDiscountTabItems}
          type="card"
        />
      </Card>

      {/* Configuration Guidelines */}
      <Card 
        size="small" 
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <InfoCircleOutlined style={{ color: '#6366f1', marginTop: '2px' }} />
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: '8px', color: '#1e293b' }}>
              Tax & Discount Guidelines
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <strong>Tax Configuration:</strong><br/>
              • Add all applicable taxes (GST, VAT, Service Tax, etc.)<br/>
              • Rates are in percentage (e.g., 18 for 18% GST)<br/>
              • Only active taxes will be applied to bookings<br/>
              • Taxes are calculated after discounts are applied<br/><br/>
              
              <strong>Admin Discounts:</strong><br/>
              • Available only to admin users during booking management<br/>
              • Can be percentage-based or fixed amount<br/>
              • Examples: Staff discount, special negotiations, bulk booking rates<br/><br/>
              
              <strong>Public Discounts:</strong><br/>
              • Available to all customers during online booking<br/>
              • Examples: Early bird discounts, promotional offers, student discounts<br/>
              • Set reasonable limits to avoid abuse
            </Text>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default TaxDiscountTab 