import React from 'react'
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Typography,
  Upload,
} from 'antd'
import { 
  PictureOutlined, 
  UploadOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'

const { TextArea } = Input
const { Title, Text } = Typography

interface HeaderSettingsTabProps {
  form: FormInstance
}

const HeaderSettingsTab: React.FC<HeaderSettingsTabProps> = () => {
  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header Content */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PictureOutlined style={{ color: '#6366f1' }} />
            <span>Header Content</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="headerTitle"
              label="Header Title"
              extra="Main title displayed at the top of your exhibition page"
            >
              <Input 
                placeholder="Enter header title"
                size="large"
                maxLength={100}
                showCount
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="headerSubtitle"
              label="Header Subtitle"
              extra="Subtitle or tagline for your exhibition"
            >
              <Input 
                placeholder="Enter header subtitle"
                size="large"
                maxLength={150}
                showCount
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="headerDescription"
              label="Header Description"
              extra="Brief description that appears in the header section"
            >
              <TextArea
                placeholder="Enter header description..."
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Logo Management */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadOutlined style={{ color: '#6366f1' }} />
            <span>Logo Management</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 24]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="headerLogo"
              label="Main Header Logo"
              extra="Primary logo displayed in the header (Recommended: 200x80px, PNG/JPG)"
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                accept="image/*"
                showUploadList={{ showPreviewIcon: true }}
              >
                <div style={{ textAlign: 'center' }}>
                  <UploadOutlined style={{ fontSize: '24px', color: '#6366f1' }} />
                  <div style={{ marginTop: '8px', fontSize: '14px' }}>
                    Upload Logo
                  </div>
                </div>
              </Upload>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="sponsorLogos"
              label="Sponsor Logos"
              extra="Multiple sponsor logos (Recommended: 150x60px each, PNG/JPG)"
            >
              <Upload
                listType="picture-card"
                multiple
                maxCount={10}
                accept="image/*"
                showUploadList={{ showPreviewIcon: true }}
              >
                <div style={{ textAlign: 'center' }}>
                  <UploadOutlined style={{ fontSize: '24px', color: '#6366f1' }} />
                  <div style={{ marginTop: '8px', fontSize: '14px' }}>
                    Add Sponsors
                  </div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Header Preview */}
      <Card 
        title="Header Preview"
        style={{ marginBottom: '24px' }}
      >
        <div style={{
          padding: '32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              width: '120px',
              height: '48px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Text style={{ color: 'white', fontSize: '12px' }}>Header Logo</Text>
            </div>
          </div>
          
          <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
            {/* This will be dynamically updated based on form values */}
            Your Exhibition Title
          </Title>
          
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', display: 'block', marginBottom: '16px' }}>
            Your Exhibition Subtitle
          </Text>
          
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
            Your exhibition description will appear here. This is a preview of how your header will look to visitors.
          </Text>
          
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                width: '80px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: '10px' }}>Sponsor {i}</Text>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Header Guidelines */}
      <Card 
        size="small" 
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <InfoCircleOutlined style={{ color: '#6366f1', marginTop: '2px' }} />
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: '8px', color: '#1e293b' }}>
              Header Customization Guidelines
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
              • Header title should be concise and memorable (max 100 characters)<br/>
              • Use subtitle to add context or highlight key features<br/>
              • Description should provide clear information about the exhibition<br/>
              • Logo dimensions: Header logo 200x80px, Sponsor logos 150x60px<br/>
              • Supported formats: PNG, JPG, GIF (PNG recommended for logos)<br/>
              • Keep file sizes under 2MB for optimal loading speed
            </Text>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default HeaderSettingsTab 