import React, { useState } from 'react'
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Typography,
  Upload,
  Button,
  Space,
  Table,
  Popconfirm
} from 'antd'
import { 
  GlobalOutlined, 
  UploadOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'

const { TextArea } = Input
const { Title, Text } = Typography

interface FooterSettingsTabProps {
  form: FormInstance
}

const FooterSettingsTab: React.FC<FooterSettingsTabProps> = ({ form }) => {
  const [footerLinks, setFooterLinks] = useState<Array<{ label: string; url: string }>>([])

  const handleAddLink = () => {
    const newLink = { label: '', url: '' }
    const updatedLinks = [...footerLinks, newLink]
    setFooterLinks(updatedLinks)
    form.setFieldValue('footerLinks', updatedLinks)
  }

  const handleRemoveLink = (index: number) => {
    const updatedLinks = footerLinks.filter((_, i) => i !== index)
    setFooterLinks(updatedLinks)
    form.setFieldValue('footerLinks', updatedLinks)
  }

  const handleLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    const updatedLinks = [...footerLinks]
    updatedLinks[index] = { ...updatedLinks[index], [field]: value }
    setFooterLinks(updatedLinks)
    form.setFieldValue('footerLinks', updatedLinks)
  }

  const linkColumns = [
    {
      title: 'Link Label',
      dataIndex: 'label',
      key: 'label',
      render: (value: string, _: any, index: number) => (
        <Input
          value={value}
          placeholder="e.g., About Us"
          onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
        />
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (value: string, _: any, index: number) => (
        <Input
          value={value}
          placeholder="https://example.com"
          onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Popconfirm
          title="Remove this link?"
          onConfirm={() => handleRemoveLink(index)}
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
      {/* Footer Content */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GlobalOutlined style={{ color: '#6366f1' }} />
            <span>Footer Content</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item
              name="footerText"
              label="Footer Text"
              extra="Copyright notice, company description, or other footer content"
            >
              <TextArea
                placeholder="© 2024 Your Company Name. All rights reserved."
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="footerLogo"
              label="Footer Logo"
              extra="Optional logo for footer (Recommended: 150x50px, PNG/JPG)"
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
        </Row>
      </Card>

      {/* Contact Information */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhoneOutlined style={{ color: '#6366f1' }} />
            <span>Contact Information</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="contactEmail"
              label="Contact Email"
              rules={[
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
              extra="Public email for customer inquiries"
            >
              <Input 
                prefix={<MailOutlined />}
                placeholder="contact@example.com"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="contactPhone"
              label="Contact Phone"
              rules={[
                { pattern: /^[0-9-+()]*$/, message: 'Please enter a valid phone number' }
              ]}
              extra="Public phone number for customer support"
            >
              <Input 
                prefix={<PhoneOutlined />}
                placeholder="+1 (555) 123-4567"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Footer Links */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Footer Links</span>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddLink}
              size="small"
            >
              Add Link
            </Button>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Form.Item name="footerLinks" style={{ marginBottom: 0 }}>
          {footerLinks.length > 0 ? (
            <Table
              dataSource={footerLinks.map((link, index) => ({ ...link, key: index }))}
              columns={linkColumns}
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
                No footer links added. Click "Add Link" to create useful links for your visitors.
              </Text>
            </div>
          )}
        </Form.Item>
      </Card>

      {/* Footer Preview */}
      <Card 
        title="Footer Preview"
        style={{ marginBottom: '24px' }}
      >
        <div style={{
          padding: '32px',
          background: '#1f2937',
          borderRadius: '12px',
          color: '#d1d5db'
        }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div style={{
                width: '100px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Text style={{ color: '#d1d5db', fontSize: '10px' }}>Footer Logo</Text>
              </div>
              <Text style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.6' }}>
                Your footer text content will appear here. This could include copyright information, company description, or other relevant details.
              </Text>
            </Col>
            
            <Col xs={24} md={8}>
              <Title level={5} style={{ color: '#f3f4f6', margin: 0, marginBottom: '16px' }}>
                Quick Links
              </Title>
              <Space direction="vertical" size="small">
                {footerLinks.length > 0 ? footerLinks.slice(0, 4).map((link, index) => (
                  <Text key={index} style={{ color: '#9ca3af', fontSize: '13px' }}>
                    {link.label || `Link ${index + 1}`}
                  </Text>
                )) : (
                  <>
                    <Text style={{ color: '#9ca3af', fontSize: '13px' }}>About Us</Text>
                    <Text style={{ color: '#9ca3af', fontSize: '13px' }}>Privacy Policy</Text>
                    <Text style={{ color: '#9ca3af', fontSize: '13px' }}>Terms of Service</Text>
                  </>
                )}
              </Space>
            </Col>
            
            <Col xs={24} md={8}>
              <Title level={5} style={{ color: '#f3f4f6', margin: 0, marginBottom: '16px' }}>
                Contact Info
              </Title>
              <Space direction="vertical" size="small">
                <Text style={{ color: '#9ca3af', fontSize: '13px' }}>
                  <MailOutlined style={{ marginRight: '8px' }} />
                  contact@example.com
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: '13px' }}>
                  <PhoneOutlined style={{ marginRight: '8px' }} />
                  +1 (555) 123-4567
                </Text>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Footer Guidelines */}
      <Card 
        size="small" 
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <InfoCircleOutlined style={{ color: '#6366f1', marginTop: '2px' }} />
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: '8px', color: '#1e293b' }}>
              Footer Configuration Tips
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
              • Footer text should include essential information like copyright and company details<br/>
              • Add useful links like About Us, Privacy Policy, Terms of Service<br/>
              • Contact information helps visitors reach you easily<br/>
              • Keep footer content concise but informative<br/>
              • Footer logo should be smaller than header logo (150x50px recommended)
            </Text>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default FooterSettingsTab 