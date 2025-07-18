import React, { useState } from 'react'
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Typography,
  Space,
  Tabs,
  Divider,
  message,
  Upload,
  Avatar,
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  GlobalOutlined,
  UploadOutlined,
  SaveOutlined,
  KeyOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs
const { TextArea } = Input

const SettingsPage: React.FC = () => {
  const [profileForm] = Form.useForm()
  const [securityForm] = Form.useForm()
  const [systemForm] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleProfileSubmit = async () => {
    try {
      setLoading(true)
      await profileForm.validateFields()
      // API call would go here
      message.success('Profile updated successfully')
    } catch (error) {
      console.error('Profile update failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSecuritySubmit = async () => {
    try {
      setLoading(true)
      await securityForm.validateFields()
      // API call would go here
      message.success('Security settings updated successfully')
    } catch (error) {
      console.error('Security update failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSystemSubmit = async () => {
    try {
      setLoading(true)
      await systemForm.validateFields()
      // API call would go here
      message.success('System settings updated successfully')
    } catch (error) {
      console.error('System update failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadProps = {
    name: 'avatar',
    listType: 'picture-card' as const,
    className: 'avatar-uploader',
    showUploadList: false,
    beforeUpload: (file: File) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!')
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error('Image must smaller than 2MB!')
      }
      return isJpgOrPng && isLt2M
    },
    onChange: (info: any) => {
      if (info.file.status === 'done') {
        message.success('Avatar uploaded successfully')
      }
    },
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <Title level={2} className="page-title">
          Settings
        </Title>
        <Text type="secondary">Manage your account and system preferences</Text>
      </div>

      <Tabs defaultActiveKey="profile" size="large">
        {/* Profile Settings */}
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Profile
            </span>
          }
          key="profile"
        >
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Card title="Profile Information">
                <Form
                  form={profileForm}
                  layout="vertical"
                  initialValues={{
                    name: 'Admin User',
                    email: 'admin@stallbooking.com',
                    phone: '+1234567890',
                    bio: 'System Administrator for Stall Booking Platform',
                    timezone: 'UTC',
                    language: 'en',
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                      >
                        <Input placeholder="Enter your full name" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input placeholder="Enter your email" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please enter your phone' }]}
                      >
                        <Input placeholder="Enter your phone number" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="timezone"
                        label="Timezone"
                        rules={[{ required: true, message: 'Please select timezone' }]}
                      >
                        <Select placeholder="Select timezone">
                          <Option value="UTC">UTC</Option>
                          <Option value="America/New_York">Eastern Time</Option>
                          <Option value="America/Los_Angeles">Pacific Time</Option>
                          <Option value="Europe/London">London</Option>
                          <Option value="Asia/Tokyo">Tokyo</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="bio"
                    label="Bio"
                  >
                    <TextArea rows={3} placeholder="Tell us about yourself" />
                  </Form.Item>

                  <Form.Item
                    name="language"
                    label="Language"
                  >
                    <Select>
                      <Option value="en">English</Option>
                      <Option value="es">Spanish</Option>
                      <Option value="fr">French</Option>
                      <Option value="de">German</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={loading}
                      onClick={handleProfileSubmit}
                    >
                      Save Profile
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Profile Picture">
                <div style={{ textAlign: 'center' }}>
                  <Upload {...uploadProps}>
                    <Avatar
                      size={120}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
                    />
                  </Upload>
                  <div>
                    <Button icon={<UploadOutlined />}>
                      Upload New Picture
                    </Button>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                    JPG or PNG. Max size 2MB.
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Security Settings */}
        <TabPane
          tab={
            <span>
              <LockOutlined />
              Security
            </span>
          }
          key="security"
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Card title="Change Password">
                <Form
                  form={securityForm}
                  layout="vertical"
                >
                  <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[{ required: true, message: 'Please enter current password' }]}
                  >
                    <Input.Password placeholder="Enter current password" />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      { required: true, message: 'Please enter new password' },
                      { min: 8, message: 'Password must be at least 8 characters' }
                    ]}
                  >
                    <Input.Password placeholder="Enter new password" />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Please confirm new password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('Passwords do not match!'))
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Confirm new password" />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      icon={<KeyOutlined />}
                      loading={loading}
                      onClick={handleSecuritySubmit}
                    >
                      Update Password
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Security Options">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span>Two-Factor Authentication</span>
                      <Switch defaultChecked={false} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Add an extra layer of security to your account
                    </Text>
                  </div>

                  <Divider />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span>Login Notifications</span>
                      <Switch defaultChecked={true} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Get notified when someone logs into your account
                    </Text>
                  </div>

                  <Divider />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span>Session Timeout</span>
                      <Select defaultValue="30" style={{ width: 100 }}>
                        <Option value="15">15 min</Option>
                        <Option value="30">30 min</Option>
                        <Option value="60">1 hour</Option>
                        <Option value="240">4 hours</Option>
                      </Select>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Automatically log out after period of inactivity
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* System Settings */}
        <TabPane
          tab={
            <span>
              <GlobalOutlined />
              System
            </span>
          }
          key="system"
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Card title="Application Settings">
                <Form
                  form={systemForm}
                  layout="vertical"
                  initialValues={{
                    siteName: 'Stall Booking Admin',
                    maintenanceMode: false,
                    registrationEnabled: true,
                    defaultCurrency: 'USD',
                    dateFormat: 'MM/DD/YYYY',
                  }}
                >
                  <Form.Item
                    name="siteName"
                    label="Site Name"
                    rules={[{ required: true, message: 'Please enter site name' }]}
                  >
                    <Input placeholder="Enter site name" />
                  </Form.Item>

                  <Form.Item
                    name="defaultCurrency"
                    label="Default Currency"
                    rules={[{ required: true, message: 'Please select currency' }]}
                  >
                    <Select placeholder="Select currency">
                      <Option value="USD">USD - US Dollar</Option>
                      <Option value="EUR">EUR - Euro</Option>
                      <Option value="GBP">GBP - British Pound</Option>
                      <Option value="JPY">JPY - Japanese Yen</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="dateFormat"
                    label="Date Format"
                    rules={[{ required: true, message: 'Please select date format' }]}
                  >
                    <Select placeholder="Select date format">
                      <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                      <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                    </Select>
                  </Form.Item>

                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                      <Form.Item name="maintenanceMode" valuePropName="checked">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Maintenance Mode</span>
                          <Switch />
                        </div>
                      </Form.Item>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Temporarily disable access to the application
                      </Text>
                    </div>

                    <div>
                      <Form.Item name="registrationEnabled" valuePropName="checked">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>User Registration</span>
                          <Switch defaultChecked />
                        </div>
                      </Form.Item>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Allow new users to register accounts
                      </Text>
                    </div>
                  </Space>

                  <Form.Item style={{ marginTop: 24 }}>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={loading}
                      onClick={handleSystemSubmit}
                    >
                      Save System Settings
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Notification Settings">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span>Email Notifications</span>
                      <Switch defaultChecked={true} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Receive notifications via email
                    </Text>
                  </div>

                  <Divider />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span>New Booking Alerts</span>
                      <Switch defaultChecked={true} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Get notified when new bookings are made
                    </Text>
                  </div>

                  <Divider />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span>Payment Notifications</span>
                      <Switch defaultChecked={true} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Get notified about payment updates
                    </Text>
                  </div>

                  <Divider />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span>System Alerts</span>
                      <Switch defaultChecked={true} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Receive system maintenance and error alerts
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default SettingsPage 