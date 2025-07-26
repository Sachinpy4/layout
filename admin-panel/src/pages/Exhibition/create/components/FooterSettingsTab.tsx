import React, { useState, useEffect } from 'react'
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
  Popconfirm,
  message
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
import type { UploadProps, UploadFile } from 'antd/es/upload/interface'
import { useParams } from 'react-router-dom'
import api from '../../../../services/api'

const { TextArea } = Input
const { Title, Text } = Typography

interface FooterSettingsTabProps {
  form: FormInstance
}

const FooterSettingsTab: React.FC<FooterSettingsTabProps> = ({ form }) => {
  const { id: exhibitionId } = useParams<{ id: string }>()
  const [footerLinks, setFooterLinks] = useState<Array<{ label: string; url: string }>>([])
  const [footerFileList, setFooterFileList] = useState<UploadFile[]>([]);

  // Initialize footer links from form values
  useEffect(() => {
    const formValues = form.getFieldsValue();
    if (formValues.footerLinks && Array.isArray(formValues.footerLinks)) {
      setFooterLinks(formValues.footerLinks);
    }
  }, [form]);

  // Helper function to get correct image URL (static files, not API endpoints)
  const getImageUrl = (filePath: string): string => {
    // Ensure we have a valid string input
    if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
      return '';
    }
    
    // Trim whitespace
    const cleanPath = filePath.trim();
    
    if (cleanPath.startsWith('/uploads/')) {
      // For file paths, use domain without /api/v1 prefix
      const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3001';
      return `${baseUrl}${cleanPath}`;
    }
    
    // For base64 data or other valid URLs, return as-is
    return cleanPath;
  };

  // Upload footer logo to backend
  const uploadFooterLogo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post(
        `/upload/exhibition/${exhibitionId || 'temp'}/footer-logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data.filePath;
    } catch (error) {
      console.error('Error uploading footer logo:', error);
      throw new Error('Failed to upload footer logo');
    }
  };

  // Effect to sync form values with upload component display
  useEffect(() => {
    const syncFooterLogo = () => {
      const formValues = form.getFieldsValue();
      
      // Handle footer logo with proper validation
      if (formValues.footerLogo && typeof formValues.footerLogo === 'string' && formValues.footerLogo.trim().length > 0) {
        const imageUrl = getImageUrl(formValues.footerLogo);
        // Additional validation to ensure we have a valid URL
        if (imageUrl && imageUrl.trim().length > 0) {
          const footerFile: UploadFile = {
            uid: 'footer-logo',
            name: 'footer-logo.jpg',
            status: 'done',
            url: imageUrl,
            thumbUrl: imageUrl,
            // Ensure all string properties are properly set to prevent Ant Design errors
            type: 'image/jpeg',
            size: 0,
          };
          setFooterFileList([footerFile]);
        } else {
          setFooterFileList([]);
        }
      } else {
        setFooterFileList([]);
      }
    };

    // Initial sync
    syncFooterLogo();

    // Set up a small delay to handle async form initialization
    const timer = setTimeout(syncFooterLogo, 300);

    return () => clearTimeout(timer);
  }, [form]);

  // CUSTOM UPLOAD PROPS: Handle footer logo with file upload to backend
  const footerLogoProps: UploadProps = {
    fileList: footerFileList,
    beforeUpload: (file) => {
      // Validate file type
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
      if (!isValidType) {
        message.error('Please upload only JPG, PNG, or WebP files!');
        return false;
      }

      // Validate file size (5MB max)
      const isValidSize = file.size / 1024 / 1024 < 5;
      if (!isValidSize) {
        message.error('Footer logo must be smaller than 5MB!');
        return false;
      }

      return false; // Prevent auto upload, handle manually
    },
    onChange: async (info) => {
      try {
        // Update local file list for display
        setFooterFileList(info.fileList);

        if (info.fileList.length > 0) {
          const file = info.fileList[0];
          if (file.originFileObj) {
            // Set uploading status
            const uploadingFile = {
              ...file,
              status: 'uploading' as const,
            };
            setFooterFileList([uploadingFile]);
            
            message.loading('Uploading footer logo...', 0);
            
            try {
              const filePath = await uploadFooterLogo(file.originFileObj);
              message.destroy(); // Clear loading message
              
              // Update form value with file path
              form.setFieldValue('footerLogo', filePath);
              
              // Get the correct image URL
              const imageUrl = getImageUrl(filePath);
              
              console.log('=== FOOTER UPLOAD DEBUG ===');
              console.log('File path from server:', filePath);
              console.log('Constructed image URL:', imageUrl);
              
              // Update file list with success status
              const uploadedFile: UploadFile = {
                ...file,
                status: 'done',
                url: imageUrl,
                thumbUrl: imageUrl,
                name: file.name || 'footer-logo.jpg',
                // Ensure all required properties are set
                type: file.type || 'image/jpeg',
                size: file.size || 0,
              };
              setFooterFileList([uploadedFile]);
              
              // Force a re-render by updating the file list after a short delay
              setTimeout(() => {
                setFooterFileList([{
                  ...uploadedFile,
                  uid: `footer-logo-${Date.now()}`,
                }]);
              }, 100);
              
              message.success('Footer logo uploaded successfully!');
            } catch (uploadError) {
              message.destroy();
              
              // Set error status
              const errorFile = {
                ...file,
                status: 'error' as const,
              };
              setFooterFileList([errorFile]);
              
              message.error('Failed to upload footer logo. Please try again.');
              console.error('Footer logo upload error:', uploadError);
            }
          }
        } else {
          // Handle removal
          form.setFieldValue('footerLogo', undefined);
          setFooterFileList([]);
        }
      } catch (error) {
        message.destroy();
        message.error('Failed to process footer logo. Please try again.');
        console.error('Footer logo processing error:', error);
        
        // Reset file list to prevent further errors
        setFooterFileList([]);
        form.setFieldValue('footerLogo', undefined);
      }
    },
    onRemove: async (_file) => {
      // Delete file from server if it's a file path
      const footerLogo = form.getFieldValue('footerLogo');
      if (footerLogo && footerLogo.startsWith('/uploads/')) {
        try {
          await api.delete('/upload/file', {
            data: { filePath: footerLogo }
          });
        } catch (error) {
          console.error('Error deleting footer logo:', error);
        }
      }
      
      form.setFieldValue('footerLogo', undefined);
      setFooterFileList([]);
      return true;
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    maxCount: 1,
    accept: 'image/jpeg,image/jpg,image/png,image/webp',
  };

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
              extra={
                <div>
                  <Text type="secondary">Optional logo for footer</Text><br/>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    • Recommended: 150x50px, JPG/PNG/WebP<br/>
                    • Max size: 5MB (auto-compressed)<br/>
                    • Optimized for footer display
                  </Text>
                </div>
              }
            >
              <Upload
                {...footerLogoProps}
                listType="picture-card"
              >
                <div style={{ textAlign: 'center' }}>
                  <UploadOutlined style={{ fontSize: '24px', color: '#6366f1' }} />
                  <div style={{ marginTop: '8px', fontSize: '14px' }}>
                    Upload Logo
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px' }}>
                    Auto-compressed
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