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
      const formValues = form.getFieldsValue(true) // true = get all fields including non-touched
      
      // Validate only required fields but include all form data
      await form.validateFields()
      
      // Create a deep copy to avoid mutating form state
      const allFormValues = JSON.parse(JSON.stringify(formValues))
      
      // Transform date range to individual dates
      if (formValues.dateRange && Array.isArray(formValues.dateRange)) {
        allFormValues.startDate = formValues.dateRange[0]?.format('YYYY-MM-DD')
        allFormValues.endDate = formValues.dateRange[1]?.format('YYYY-MM-DD')
        delete allFormValues.dateRange
      }

      // Transform registration deadline
      if (formValues.registrationDeadline && typeof formValues.registrationDeadline === 'object') {
        allFormValues.registrationDeadline = formValues.registrationDeadline.format('YYYY-MM-DD')
      }

      // Pre-submission validation for large files
      let hasLargeFiles = false;
      let fileWarnings = [];

      if (allFormValues.headerLogo && allFormValues.headerLogo.length > 2000000) {
        hasLargeFiles = true;
        fileWarnings.push('Header logo is very large');
      }

      if (allFormValues.sponsorLogos && Array.isArray(allFormValues.sponsorLogos)) {
        const totalSize = allFormValues.sponsorLogos.join('').length;
        if (totalSize > 3000000) {
          hasLargeFiles = true;
          fileWarnings.push('Sponsor logos combined are very large');
        }
      }

      if (allFormValues.footerLogo && allFormValues.footerLogo.length > 1500000) {
        hasLargeFiles = true;
        fileWarnings.push('Footer logo is very large');
      }

      if (hasLargeFiles) {
        message.warning({
          content: `Large files detected: ${fileWarnings.join(', ')}. Upload may take longer...`,
          duration: 3,
        });
      }

      await onSubmit(allFormValues)
    } catch (error: any) {
      console.error('Form submission error:', error)
      
      // Enhanced error message display
      const errorMessage = error.message || 'Form validation failed';
      
      if (errorMessage.includes('🚨 File Upload Error')) {
        // Special handling for file upload errors
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                File Upload Error
              </div>
              <div style={{ fontSize: '14px' }}>
                Your images are too large. Please:
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Use images smaller than 2MB each</li>
                  <li>Try compressing images before upload</li>
                  <li>Upload fewer sponsor logos at once</li>
                </ul>
                The system compresses images automatically, but very large files may still exceed server limits.
              </div>
            </div>
          ),
          duration: 8,
        });
      } else if (errorMessage.includes('timeout')) {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Upload Timeout
              </div>
              <div style={{ fontSize: '14px' }}>
                The upload took too long. This usually happens with large images. 
                Please try uploading smaller images or check your internet connection.
              </div>
            </div>
          ),
          duration: 6,
        });
      } else if (errorMessage.includes('Network error')) {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Connection Error
              </div>
              <div style={{ fontSize: '14px' }}>
                Unable to connect to server. Please check your internet connection and try again.
              </div>
            </div>
          ),
          duration: 5,
        });
      } else {
        // Standard error handling
        message.error({
          content: errorMessage.includes('validation') 
            ? 'Please check all required fields and try again'
            : errorMessage,
          duration: 5,
        });
      }
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