import React, { useState, useEffect } from 'react'
import { Card, Typography, Breadcrumb, Spin, App } from 'antd'
import { HomeOutlined, CalendarOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import ExhibitionForm from '../create/components/ExhibitionForm'
import type { CreateExhibitionForm, Exhibition } from '@/types'
import dayjs from 'dayjs'

const { Title } = Typography

// Extended form type for edit page that includes dateRange
interface EditExhibitionForm extends Partial<CreateExhibitionForm> {
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs]
}

const EditExhibitionPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [exhibition, setExhibition] = useState<Exhibition | null>(null)
  const { message } = App.useApp()
  
  useEffect(() => {
    if (id) {
      loadExhibition(id)
    }
  }, [id])

  const loadExhibition = async (exhibitionId: string) => {
    try {
      setLoading(true)
      const exhibitionService = await import('../../../services/exhibition.service')
      const response = await exhibitionService.default.getExhibition(exhibitionId)
      setExhibition(response.data)
    } catch (error) {
      console.error('Error loading exhibition:', error)
      message.error('Failed to load exhibition details')
      navigate('/exhibitions')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (values: CreateExhibitionForm) => {
    try {
      setSubmitting(true)
      
      console.log('=== EDIT PAGE SUBMISSION DEBUG ===')
      console.log('Original exhibition data:', exhibition)
      console.log('Form values received:', values)
      console.log('stallRates in form values:', values.stallRates)
      console.log('taxConfig in form values:', values.taxConfig)
      console.log('discountConfig in form values:', values.discountConfig)
      console.log('publicDiscountConfig in form values:', values.publicDiscountConfig)
      
      // Merge form values with existing exhibition data to prevent field loss
      const mergedValues = {
        // Start with original exhibition data (preserving all fields)
        ...exhibition,
        // Override with form values (only the fields that have been modified)
        ...values,
        // Ensure key fields are not accidentally cleared
        id: exhibition?.id || exhibition?._id,
        _id: exhibition?._id,
        createdBy: exhibition?.createdBy,
        createdAt: exhibition?.createdAt,
        updatedAt: new Date().toISOString()
      }
      
      console.log('Merged values before cleanup:', mergedValues)
      console.log('stallRates in merged:', mergedValues.stallRates)
      console.log('discountConfig in merged:', mergedValues.discountConfig)
      console.log('publicDiscountConfig in merged:', mergedValues.publicDiscountConfig)
      
      // Remove internal fields that shouldn't be sent to backend
      const { id, _id, createdAt, updatedAt, ...updateData } = mergedValues
      
      console.log('Final update data being sent to backend:', updateData)
      console.log('stallRates in final data:', updateData.stallRates)
      console.log('discountConfig in final data:', updateData.discountConfig)
      console.log('publicDiscountConfig in final data:', updateData.publicDiscountConfig)
      
      const exhibitionService = await import('../../../services/exhibition.service')
            await exhibitionService.default.updateExhibition(id!, updateData)
      message.success('Exhibition updated successfully!')
      navigate('/exhibitions')
    } catch (error) {
      console.error('Error updating exhibition:', error)
      message.error('Failed to update exhibition')
    } finally {
      setSubmitting(false)
    }
  }

  // Transform exhibition data to form values
  const getInitialValues = (): EditExhibitionForm => {
    if (!exhibition) return {}

    return {
      name: exhibition.name,
      description: exhibition.description,
      venue: exhibition.venue,
      startDate: exhibition.startDate,
      endDate: exhibition.endDate,
      status: exhibition.status,
      isActive: exhibition.isActive,
      invoicePrefix: exhibition.invoicePrefix,
      dimensions: exhibition.dimensions,
      stallRates: exhibition.stallRates,
      taxConfig: exhibition.taxConfig || [],
      discountConfig: exhibition.discountConfig || [],
      publicDiscountConfig: exhibition.publicDiscountConfig || [],
      companyName: exhibition.companyName,
      companyContactNo: exhibition.companyContactNo,
      companyEmail: exhibition.companyEmail,
      companyAddress: exhibition.companyAddress,
      companyWebsite: exhibition.companyWebsite,
      companyPAN: exhibition.companyPAN,
      companyGST: exhibition.companyGST,
      companySAC: exhibition.companySAC,
      companyCIN: exhibition.companyCIN,
      termsAndConditions: exhibition.termsAndConditions,
      piInstructions: exhibition.piInstructions,
      bankName: exhibition.bankName,
      bankBranch: exhibition.bankBranch,
      bankIFSC: exhibition.bankIFSC,
      bankAccountName: exhibition.bankAccountName,
      bankAccount: exhibition.bankAccount,
      headerTitle: exhibition.headerTitle,
      headerSubtitle: exhibition.headerSubtitle,
      headerDescription: exhibition.headerDescription,
      headerLogo: exhibition.headerLogo,
      sponsorLogos: exhibition.sponsorLogos,
      footerText: exhibition.footerText,
      footerLogo: exhibition.footerLogo,
      contactEmail: exhibition.contactEmail,
      contactPhone: exhibition.contactPhone,
      footerLinks: exhibition.footerLinks,
      amenities: exhibition.amenities,
      basicAmenities: exhibition.basicAmenities,
      specialRequirements: exhibition.specialRequirements,
      // Transform dates to dayjs objects for the date picker
      dateRange: exhibition.startDate && exhibition.endDate ? [
        dayjs(exhibition.startDate),
        dayjs(exhibition.endDate)
      ] : undefined
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!exhibition) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Title level={3}>Exhibition not found</Title>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        style={{ marginBottom: '24px' }}
        items={[
          {
            href: '/dashboard',
            title: (
              <>
                <HomeOutlined />
                <span>Dashboard</span>
              </>
            ),
          },
          {
            href: '/exhibitions',
            title: (
              <>
                <CalendarOutlined />
                <span>Exhibitions</span>
              </>
            ),
          },
          {
            title: `Edit: ${exhibition.name}`,
          },
        ]}
      />

      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
          Edit Exhibition
        </Title>
        <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
          Update exhibition configuration and settings
        </Typography.Text>
      </div>

      {/* Form Container */}
      <Card 
        style={{ 
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <ExhibitionForm 
          onSubmit={handleSubmit} 
          initialValues={getInitialValues()}
          loading={submitting}
          isEditing={true}
        />
      </Card>
    </div>
  )
}

export default EditExhibitionPage 