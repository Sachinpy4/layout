import React from 'react'
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Typography,
  Divider
} from 'antd'
import { 
  BankOutlined, 
  FileTextOutlined, 
  SafetyCertificateOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'

const { TextArea } = Input
const { Title, Text } = Typography

interface CompanyDetailsTabProps {
  form: FormInstance
}

const CompanyDetailsTab: React.FC<CompanyDetailsTabProps> = () => {
  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Company Information */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BankOutlined style={{ color: '#6366f1' }} />
            <span>Company Information</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[{ required: true, message: 'Please enter company name' }]}
            >
              <Input 
                placeholder="Enter company name"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="companyContactNo"
              label="Contact Number"
              rules={[
                { required: true, message: 'Please enter contact number' },
                { pattern: /^[0-9-+()]*$/, message: 'Please enter a valid phone number' }
              ]}
            >
              <Input 
                placeholder="Enter contact number"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="companyEmail"
              label="Company Email"
              rules={[
                { required: true, message: 'Please enter company email' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input 
                placeholder="Enter company email"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="companyWebsite"
              label="Company Website"
              rules={[
                { type: 'url', message: 'Please enter a valid URL' }
              ]}
            >
              <Input 
                placeholder="https://www.example.com"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="companyAddress"
              label="Company Address"
              rules={[{ required: true, message: 'Please enter company address' }]}
            >
              <TextArea
                placeholder="Enter complete company address"
                rows={3}
                showCount
                maxLength={300}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Legal & Compliance Details */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SafetyCertificateOutlined style={{ color: '#6366f1' }} />
            <span>Legal & Compliance Details</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="companyPAN"
              label="PAN Number"
              rules={[
                { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Please enter a valid PAN number' }
              ]}
            >
              <Input 
                placeholder="ABCDE1234F"
                size="large"
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="companyGST"
              label="GST Number"
              rules={[
                { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Please enter a valid GST number' }
              ]}
            >
              <Input 
                placeholder="22AAAAA0000A1Z5"
                size="large"
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="companySAC"
              label="SAC Code"
              tooltip="Service Accounting Code for tax purposes"
            >
              <Input 
                placeholder="999999"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="companyCIN"
              label="CIN Number"
              tooltip="Corporate Identification Number"
              rules={[
                { pattern: /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/, message: 'Please enter a valid CIN number' }
              ]}
            >
              <Input 
                placeholder="U12345AB1234ABC123456"
                size="large"
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Terms & Conditions */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined style={{ color: '#6366f1' }} />
            <span>Terms & Conditions</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 24]}>
          <Col xs={24}>
            <Form.Item
              name="termsAndConditions"
              label="Terms and Conditions"
              extra="These terms will be shown to customers during booking"
            >
              <TextArea
                placeholder="Enter terms and conditions for the exhibition..."
                rows={8}
                showCount
                maxLength={5000}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Divider orientation="left" orientationMargin="0">
              <span style={{ color: '#6366f1', fontWeight: 500 }}>
                <InfoCircleOutlined style={{ marginRight: '8px' }} />
                Payment Instructions
              </span>
            </Divider>
            <Form.Item
              name="piInstructions"
              label="Payment Instructions"
              extra="Special instructions for customers regarding payment process"
            >
              <TextArea
                placeholder="Enter payment instructions..."
                rows={6}
                showCount
                maxLength={2000}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Help Text */}
      <Card size="small" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <InfoCircleOutlined style={{ color: '#6366f1', marginTop: '2px' }} />
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: '8px', color: '#1e293b' }}>
              Company Details Guidelines
            </Title>
            <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
              • Company information will be displayed on invoices and public exhibition pages<br/>
              • Legal details are required for tax compliance and official documentation<br/>
              • Terms & conditions will be shown to customers during the booking process<br/>
              • All fields marked with asterisk (*) are mandatory
            </Text>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CompanyDetailsTab 