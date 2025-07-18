import React from 'react'
import { Card, Typography, Breadcrumb, message } from 'antd'
import { HomeOutlined, CalendarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ExhibitionForm from './components/ExhibitionForm'
import type { CreateExhibitionForm } from '@/types'

const { Title } = Typography

const CreateExhibitionPage: React.FC = () => {
  const navigate = useNavigate()
  
  const handleSubmit = async (values: CreateExhibitionForm) => {
    try {
      console.log('Exhibition data:', values)
              const exhibitionService = await import('../../../services/exhibition.service')
        await exhibitionService.default.createExhibition(values)
        message.success('Exhibition created successfully!')
        navigate('/exhibitions')
    } catch (error) {
      console.error('Error creating exhibition:', error)
      message.error('Failed to create exhibition')
    }
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
            title: 'Create New Exhibition',
          },
        ]}
      />

      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
          Create New Exhibition
        </Title>
        <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
          Set up your exhibition with comprehensive configuration options
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
        <ExhibitionForm onSubmit={handleSubmit} />
      </Card>
    </div>
  )
}

export default CreateExhibitionPage 