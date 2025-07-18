import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Checkbox,
  Divider,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  SafetyCertificateOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials } from '../../services/auth.service';
import './login.css';

const { Title, Text, Link } = Typography;

interface LocationState {
  from?: Location;
  message?: string;
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState;

  // Load remembered credentials
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('admin_remembered_email');
    if (rememberedEmail) {
      form.setFieldsValue({ email: rememberedEmail });
      setRememberMe(true);
    }
  }, [form]);

  // Redirect if already authenticated (after all hooks are called)
  if (isAuthenticated && !loading) {
    const from = state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (values: LoginCredentials) => {
    setError('');
    setIsSubmitting(true);

    try {
      await login(values);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('admin_remembered_email', values.email);
      } else {
        localStorage.removeItem('admin_remembered_email');
      }

      // Redirect will happen automatically via the Navigate component above
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoCredentials = {
    email: 'admin@stallbooking.com',
    password: 'admin123',
  };

  const fillDemoCredentials = () => {
    form.setFieldsValue(demoCredentials);
  };

  return (
    <div className="login-container">
      {/* Background Elements */}
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      {/* Content */}
      <Row className="login-content" justify="center" align="middle">
        <Col xs={22} sm={16} md={12} lg={8} xl={6}>
          <Card className="login-card" bordered={false}>
            {/* Header */}
            <div className="login-header">
              <div className="logo-container">
                <div className="logo-icon">
                  <DashboardOutlined />
                </div>
                <Title level={2} className="login-title">
                  Stall Booking
                </Title>
              </div>
              <Text className="login-subtitle">
                Admin Panel Access
              </Text>
            </div>

            {/* Alert Messages */}
            {state?.message && (
              <Alert
                message={state.message}
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {error && (
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
                style={{ marginBottom: 24 }}
              />
            )}

            {/* Login Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email address' },
                  { type: 'email', message: 'Please enter a valid email address' },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="admin@stallbooking.com"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Enter your password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item>
                <div className="login-options">
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  >
                    Remember me
                  </Checkbox>
                  <Link className="forgot-password">
                    Forgot password?
                  </Link>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  block
                  className="login-button"
                  icon={<SafetyCertificateOutlined />}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            {/* Demo Section */}
            <Divider>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Demo Access
              </Text>
            </Divider>

            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Button
                type="dashed"
                block
                onClick={fillDemoCredentials}
                style={{ height: 'auto', padding: '12px 16px' }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Demo Admin Account
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    Email: {demoCredentials.email}
                  </div>
                </div>
              </Button>
            </Space>

            {/* Footer */}
            <div className="login-footer">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Secure access to your exhibition management dashboard
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage; 