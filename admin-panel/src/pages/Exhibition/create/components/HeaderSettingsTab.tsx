import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Typography,
  Upload,
  message,
} from 'antd'
import { 
  PictureOutlined, 
  UploadOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'
import type { UploadProps, UploadFile } from 'antd/es/upload/interface'
import { useParams } from 'react-router-dom'
import api from '../../../../services/api'

const { TextArea } = Input
const { Title, Text } = Typography

interface HeaderSettingsTabProps {
  form: FormInstance
}

const HeaderSettingsTab: React.FC<HeaderSettingsTabProps> = ({ form }) => {
  const { id: exhibitionId } = useParams<{ id: string }>()
  
  // State to manage file lists for Upload components
  const [headerFileList, setHeaderFileList] = useState<UploadFile[]>([]);
  const [sponsorFileList, setSponsorFileList] = useState<UploadFile[]>([]);

  // Helper function to get correct image URL (static files, not API endpoints)
  const getImageUrl = (filePath: string): string => {
    if (!filePath) return '';
    
    if (filePath.startsWith('/uploads/')) {
      // For file paths, use domain without /api/v1 prefix
      const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3001';
      return `${baseUrl}${filePath}`;
    }
    
    // For base64 data, return as-is
    return filePath;
  };

  // Effect to sync form values with upload component display
  useEffect(() => {
    const syncUploadLists = () => {
      const formValues = form.getFieldsValue();
      
      // Handle header logo
      if (formValues.headerLogo && typeof formValues.headerLogo === 'string') {
        const headerFile: UploadFile = {
          uid: 'header-logo',
          name: 'header-logo.jpg',
          status: 'done',
          url: getImageUrl(formValues.headerLogo),
          thumbUrl: getImageUrl(formValues.headerLogo),
        };
        setHeaderFileList([headerFile]);
      } else {
        setHeaderFileList([]);
      }

      // Handle sponsor logos
      if (formValues.sponsorLogos && Array.isArray(formValues.sponsorLogos)) {
        const sponsorFiles: UploadFile[] = formValues.sponsorLogos.map((logo: string, index: number) => ({
          uid: `sponsor-${index}`,
          name: `sponsor-logo-${index + 1}.jpg`,
          status: 'done',
          url: getImageUrl(logo),
          thumbUrl: getImageUrl(logo),
        }));
        setSponsorFileList(sponsorFiles);
      } else {
        setSponsorFileList([]);
      }
    };

    // Initial sync
    syncUploadLists();

    // Set up a small delay to handle async form initialization
    const timer = setTimeout(syncUploadLists, 300);

    return () => clearTimeout(timer);
  }, [form]);

  // Upload header logo to backend
  const uploadHeaderLogo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post(
        `/upload/exhibition/${exhibitionId || 'temp'}/header-logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data.filePath;
    } catch (error) {
      console.error('Error uploading header logo:', error);
      throw new Error('Failed to upload header logo');
    }
  };

  // Upload sponsor logo to backend
  const uploadSponsorLogo = async (file: File, index: number): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('index', index.toString());
    
    try {
      const response = await api.post(
        `/upload/exhibition/${exhibitionId || 'temp'}/sponsor-logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data.filePath;
    } catch (error) {
      console.error('Error uploading sponsor logo:', error);
      throw new Error('Failed to upload sponsor logo');
    }
  };

  // CUSTOM UPLOAD PROPS: Handle file validation and upload to backend
  const headerLogoProps: UploadProps = {
    fileList: headerFileList,
    beforeUpload: (file) => {
      // Validate file type
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
      if (!isValidType) {
        message.error('Please upload only JPG, PNG, or WebP files!');
        return false;
      }

      // Validate file size (10MB max)
      const isValidSize = file.size / 1024 / 1024 < 10;
      if (!isValidSize) {
        message.error('Image must be smaller than 10MB!');
        return false;
      }

      return false; // Prevent auto upload, handle manually
    },
    onChange: async (info) => {
      try {
        // Update local file list for display
        setHeaderFileList(info.fileList);

        if (info.fileList.length > 0) {
          const file = info.fileList[0];
          if (file.originFileObj) {
            // Set uploading status
            const uploadingFile = {
              ...file,
              status: 'uploading' as const,
            };
            setHeaderFileList([uploadingFile]);
            
            message.loading('Uploading header logo...', 0);
            
            try {
              const filePath = await uploadHeaderLogo(file.originFileObj);
              message.destroy(); // Clear loading message
              
              // Update form value with file path
              form.setFieldValue('headerLogo', filePath);
              
              // Get the correct image URL
              const imageUrl = getImageUrl(filePath);
              
              console.log('=== FRONTEND UPLOAD DEBUG ===');
              console.log('File path from server:', filePath);
              console.log('Constructed image URL:', imageUrl);
              
              // Update file list with success status
              const uploadedFile: UploadFile = {
                ...file,
                status: 'done',
                url: imageUrl,
                thumbUrl: imageUrl,
                name: file.name || 'header-logo.jpg', // Ensure name is set
              };
              setHeaderFileList([uploadedFile]);
              
              // Force a re-render by updating the file list after a short delay
              setTimeout(() => {
                setHeaderFileList([{
                  ...uploadedFile,
                  uid: `header-logo-${Date.now()}`, // Change UID to force re-render
                }]);
              }, 100);
              
              message.success('Header logo uploaded successfully!');
            } catch (uploadError) {
              message.destroy();
              
              // Set error status
              const errorFile = {
                ...file,
                status: 'error' as const,
              };
              setHeaderFileList([errorFile]);
              
              message.error('Failed to upload header logo. Please try again.');
              console.error('Header logo upload error:', uploadError);
            }
          }
        } else {
          // Handle removal
          form.setFieldValue('headerLogo', undefined);
          setHeaderFileList([]);
        }
      } catch (error) {
        message.destroy();
        message.error('Failed to process header logo. Please try again.');
        console.error('Header logo processing error:', error);
      }
    },
    onRemove: async (_file) => {
      // Delete file from server if it's a file path
      const headerLogo = form.getFieldValue('headerLogo');
      if (headerLogo && headerLogo.startsWith('/uploads/')) {
        try {
          await api.delete('/upload/file', {
            data: { filePath: headerLogo }
          });
        } catch (error) {
          console.error('Error deleting header logo:', error);
        }
      }
      
      form.setFieldValue('headerLogo', undefined);
      setHeaderFileList([]);
      return true;
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    maxCount: 1,
    accept: 'image/jpeg,image/jpg,image/png,image/webp',
  };

  // CUSTOM UPLOAD PROPS: Handle sponsor logos with upload to backend
  const sponsorLogosProps: UploadProps = {
    fileList: sponsorFileList,
    beforeUpload: (file) => {
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
      if (!isValidType) {
        message.error('Please upload only JPG, PNG, or WebP files!');
        return false;
      }

      const isValidSize = file.size / 1024 / 1024 < 5;
      if (!isValidSize) {
        message.error('Each sponsor logo must be smaller than 5MB!');
        return false;
      }

      return false;
    },
    onChange: async (info) => {
      try {
        // Update local file list for display
        setSponsorFileList(info.fileList);

        if (info.fileList.length > 0) {
          message.loading('Uploading sponsor logos...', 0);
          
          const uploadPromises = info.fileList.map(async (file, index) => {
            if (file.originFileObj) {
              return await uploadSponsorLogo(file.originFileObj, index);
            }
            // Keep existing file path if no new file
            return form.getFieldValue('sponsorLogos')?.[index] || '';
          });
          
          try {
            const filePaths = await Promise.all(uploadPromises);
            message.destroy();
            
            // Filter out empty paths
            const validPaths = filePaths.filter(Boolean);
            
            // Update form with file paths
            form.setFieldValue('sponsorLogos', validPaths);
            
            // Update file list with success status
            const updatedFileList: UploadFile[] = info.fileList.map((file, index) => ({
              ...file,
              status: 'done',
              url: validPaths[index] ? getImageUrl(validPaths[index]) : file.url,
              thumbUrl: validPaths[index] ? getImageUrl(validPaths[index]) : file.thumbUrl,
            }));
            setSponsorFileList(updatedFileList);
            
            message.success(`${validPaths.length} sponsor logo(s) uploaded successfully!`);
          } catch (uploadError) {
            message.destroy();
            message.error('Failed to upload sponsor logos. Please try again.');
            console.error('Sponsor logos upload error:', uploadError);
          }
        } else {
          form.setFieldValue('sponsorLogos', []);
          setSponsorFileList([]);
        }
      } catch (error) {
        message.destroy();
        message.error('Failed to process sponsor logos. Please try again.');
        console.error('Sponsor logos processing error:', error);
      }
    },
    onRemove: async (file) => {
      const sponsorLogos = form.getFieldValue('sponsorLogos') || [];
      const fileIndex = sponsorFileList.findIndex(f => f.uid === file.uid);
      
      // Delete file from server if it's a file path
      if (fileIndex !== -1 && sponsorLogos[fileIndex]?.startsWith('/uploads/')) {
        try {
          await api.delete('/upload/file', {
            data: { filePath: sponsorLogos[fileIndex] }
          });
        } catch (error) {
          console.error('Error deleting sponsor logo:', error);
        }
      }
      
      const newSponsorLogos = sponsorLogos.filter((_: any, index: number) => index !== fileIndex);
      form.setFieldValue('sponsorLogos', newSponsorLogos);
      setSponsorFileList(prev => prev.filter(f => f.uid !== file.uid));
      return true;
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    maxCount: 10,
    accept: 'image/jpeg,image/jpg,image/png,image/webp',
  };

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
              extra={
                <div>
                  <Text type="secondary">Primary logo displayed in the header</Text><br/>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    • Recommended: 200x80px, JPG/PNG/WebP<br/>
                    • Max size: 10MB (auto-compressed)<br/>
                    • Aspect ratio will be preserved
                  </Text>
                </div>
              }
            >
              <Upload
                {...headerLogoProps}
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

          <Col xs={24} md={12}>
            <Form.Item
              name="sponsorLogos"
              label="Sponsor Logos"
              extra={
                <div>
                  <Text type="secondary">Multiple sponsor logos</Text><br/>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    • Recommended: 150x60px each, JPG/PNG/WebP<br/>
                    • Max size: 5MB each (auto-compressed)<br/>
                    • Up to 10 sponsors supported
                  </Text>
                </div>
              }
            >
              <Upload
                {...sponsorLogosProps}
                listType="picture-card"
                multiple
              >
                <div style={{ textAlign: 'center' }}>
                  <UploadOutlined style={{ fontSize: '24px', color: '#6366f1' }} />
                  <div style={{ marginTop: '8px', fontSize: '14px' }}>
                    Add Sponsors
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px' }}>
                    Auto-compressed
                  </div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        
        {/* File Upload Guidelines */}
        <Card size="small" style={{ background: '#f8fafc', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <InfoCircleOutlined style={{ color: '#6366f1', marginTop: '2px' }} />
            <div>
              <Title level={5} style={{ margin: 0, marginBottom: '8px', color: '#1e293b' }}>
                🚀 Image Upload Optimization
              </Title>
              <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.8' }}>
                • <strong>Smart Compression:</strong> Large images are automatically compressed to reduce upload time<br/>
                • <strong>Format Support:</strong> JPG, PNG, and WebP formats accepted<br/>
                • <strong>Size Optimization:</strong> Images resized to optimal dimensions while preserving quality<br/>
                • <strong>Progress Feedback:</strong> Real-time processing status with success/error messages<br/>
                • <strong>Quality Assurance:</strong> Maintains visual quality while ensuring fast loading
              </Text>
            </div>
          </div>
        </Card>
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