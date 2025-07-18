import React, { useState } from 'react'
import { Form, Button, Tabs, message } from 'antd'
import { SaveOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { CreateExhibitionForm } from '@/types'
import BasicInformationTab from './BasicInformationTab'
import CompanyDetailsTab from './CompanyDetailsTab'
import BankingInformationTab from './BankingInformationTab'
import HeaderSettingsTab from './HeaderSettingsTab'
import FooterSettingsTab from './FooterSettingsTab'
import AmenitiesTab from './AmenitiesTab'
import TaxDiscountTab from './TaxDiscountTab'

interface ExhibitionFormProps {
  onSubmit: (values: CreateExhibitionForm) => void
  initialValues?: Partial<CreateExhibitionForm>
  loading?: boolean
  isEditing?: boolean
}

const ExhibitionForm: React.FC<ExhibitionFormProps> = ({
  onSubmit,
  initialValues,
  loading = false,
  isEditing = false
}) => {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('basic')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      
      // CRITICAL FIX: Get ALL form field values, not just validated fields
      // This ensures fields from all tabs are included, preventing data loss
      const allFormValues = form.getFieldsValue(true) // true = get all fields including non-touched
      
      // Validate only required fields but include all form data
      await form.validateFields()
      
      console.log('=== FORM SUBMISSION DEBUG ===')
      console.log('All form values:', allFormValues)
      console.log('stallRates in form:', allFormValues.stallRates)
      console.log('taxConfig in form:', allFormValues.taxConfig)
      console.log('discountConfig in form:', allFormValues.discountConfig)
      console.log('publicDiscountConfig in form:', allFormValues.publicDiscountConfig)
      
      // Transform date range to individual dates
      if (allFormValues.dateRange && Array.isArray(allFormValues.dateRange)) {
        allFormValues.startDate = allFormValues.dateRange[0]?.format('YYYY-MM-DD')
        allFormValues.endDate = allFormValues.dateRange[1]?.format('YYYY-MM-DD')
        delete allFormValues.dateRange
      }

      await onSubmit(allFormValues)
    } catch (error) {
      console.error('Form validation failed:', error)
      message.error('Please check all required fields')
    } finally {
      setSubmitting(false)
    }
  }

  const tabItems = [
    {
      key: 'basic',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleOutlined />
          Basic Information
        </span>
      ),
      children: <BasicInformationTab form={form} />
    },
    {
      key: 'company',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Company Details
        </span>
      ),
      children: <CompanyDetailsTab form={form} />
    },
    {
      key: 'banking',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Banking Information
        </span>
      ),
      children: <BankingInformationTab form={form} />
    },
    {
      key: 'header',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Header Settings
        </span>
      ),
      children: <HeaderSettingsTab form={form} />
    },
    {
      key: 'footer',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Footer Settings
        </span>
      ),
      children: <FooterSettingsTab form={form} />
    },
    {
      key: 'amenities',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Amenities
        </span>
      ),
      children: <AmenitiesTab form={form} />
    },
    {
      key: 'tax-discount',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Tax & Discounts
        </span>
      ),
      children: <TaxDiscountTab form={form} />
    }
  ]

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      style={{ height: '100%' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
        {/* Tabs Content */}
        <div style={{ flex: 1, marginBottom: '32px' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            type="card"
            size="large"
          />
        </div>

        {/* Form Actions */}
        <div 
          style={{ 
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            * Required fields must be filled
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              size="large"
              style={{
                height: '44px',
                padding: '0 24px',
                borderRadius: '8px',
                fontWeight: 500
              }}
            >
              Save as Draft
            </Button>
            
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={submitting || loading}
              style={{
                height: '44px',
                padding: '0 24px',
                borderRadius: '8px',
                fontWeight: 500,
                background: '#6366f1',
                borderColor: '#6366f1'
              }}
            >
              {isEditing ? 'Update Exhibition' : 'Create Exhibition'}
            </Button>
          </div>
        </div>
      </div>
    </Form>
  )
}

export default ExhibitionForm 