import React from 'react'
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Typography
} from 'antd'
import { 
  BankOutlined, 
  CreditCardOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'

const { Title, Text } = Typography

interface BankingInformationTabProps {
  form: FormInstance
}

const BankingInformationTab: React.FC<BankingInformationTabProps> = () => {
  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Bank Account Information */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BankOutlined style={{ color: '#6366f1' }} />
            <span>Bank Account Information</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="bankName"
              label="Bank Name"
              rules={[{ required: true, message: 'Please enter bank name' }]}
            >
              <Input 
                placeholder="Enter bank name"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="bankBranch"
              label="Branch Name"
              rules={[{ required: true, message: 'Please enter branch name' }]}
            >
              <Input 
                placeholder="Enter branch name"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="bankAccountName"
              label="Account Holder Name"
              rules={[{ required: true, message: 'Please enter account holder name' }]}
            >
              <Input 
                placeholder="Enter account holder name"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="bankAccount"
              label="Account Number"
              rules={[
                { required: true, message: 'Please enter account number' },
                { pattern: /^\d+$/, message: 'Please enter a valid account number' }
              ]}
            >
              <Input 
                placeholder="Enter account number"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="bankIFSC"
              label="IFSC Code"
              rules={[
                { required: true, message: 'Please enter IFSC code' },
                { pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Please enter a valid IFSC code' }
              ]}
              extra="IFSC code format: ABCD0123456"
            >
              <Input 
                placeholder="ABCD0123456"
                size="large"
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Payment Information */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCardOutlined style={{ color: '#6366f1' }} />
            <span>Payment Information</span>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <div style={{ 
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <InfoCircleOutlined style={{ color: '#6366f1', marginTop: '2px' }} />
            <div>
              <Title level={5} style={{ margin: 0, marginBottom: '8px', color: '#1e293b' }}>
                Bank Details Usage
              </Title>
              <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.8' }}>
                • These bank details will be displayed on invoices for customer payments<br/>
                • Customers will use this information for bank transfers and NEFT/RTGS payments<br/>
                • Make sure all details are accurate to avoid payment delays<br/>
                • IFSC code is mandatory for electronic fund transfers<br/>
                • Account holder name should match with your business registration
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Bank Verification Status */}
      <Card 
        size="small"
        style={{ 
          background: '#fef3c7', 
          border: '1px solid #fbbf24',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <InfoCircleOutlined style={{ color: '#d97706' }} />
          <div>
            <Text style={{ color: '#92400e', fontWeight: 500 }}>
              Bank Verification Required
            </Text>
            <br />
            <Text style={{ color: '#92400e', fontSize: '13px' }}>
              After saving, you will need to verify these bank details by uploading 
              bank statements or cancelled cheque for account verification.
            </Text>
          </div>
        </div>
      </Card>

      {/* Sample Bank Details Format */}
      <Card 
        title="Sample Format"
        size="small"
        style={{ background: '#f0f9ff', border: '1px solid #0ea5e9' }}
      >
        <Row gutter={[16, 8]}>
          <Col xs={24} md={12}>
            <Text strong style={{ color: '#0369a1' }}>Bank Name:</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '13px' }}>
              State Bank of India
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <Text strong style={{ color: '#0369a1' }}>Branch:</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Connaught Place, New Delhi
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <Text strong style={{ color: '#0369a1' }}>Account Holder:</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '13px' }}>
              ABC Exhibition Pvt Ltd
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <Text strong style={{ color: '#0369a1' }}>Account Number:</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '13px' }}>
              123456789012345
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <Text strong style={{ color: '#0369a1' }}>IFSC Code:</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '13px' }}>
              SBIN0001234
            </Text>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default BankingInformationTab 