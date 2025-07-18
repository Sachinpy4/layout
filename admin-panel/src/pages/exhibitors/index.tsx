import React, { useEffect, useState } from 'react';
import { 
  Card, Button, Space, Modal, Select, Input, message, 
  Form, Switch, Typography, Radio, Alert, Row, Col,
  Statistic, Tag, Badge, Divider
} from 'antd';
import { 
  UserOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, ClockCircleOutlined, UserAddOutlined,
  DownloadOutlined, MailOutlined, PhoneOutlined, EditOutlined
} from '@ant-design/icons';
import { useExhibitors } from '../../hooks/useExhibitors';
import { useAuth } from '../../hooks/useAuth';
import { ExhibitorProfile, CreateExhibitorDto, UpdateExhibitorDto } from '../../services/exhibitor.service';
import ExhibitorTable from './ExhibitorTable';
import '../dashboard/Dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea, Search } = Input;

const ExhibitorsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    state: {
      exhibitors,
      stats,
      loading,
      error,
      filters,
      pagination,
    },
    actions: {
      loadExhibitors,
      loadExhibitorStats,
      updateExhibitor,
      updateExhibitorStatus,
      createExhibitor,
      deleteExhibitor,
      bulkDeleteExhibitors,
      setFilters,
      setPagination,
    },
  } = useExhibitors();

  const [selectedExhibitor, setSelectedExhibitor] = useState<ExhibitorProfile | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'suspended'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const hasSelected = selectedRowKeys.length > 0;

  useEffect(() => {
    loadExhibitors();
    loadExhibitorStats();
  }, [loadExhibitors, loadExhibitorStats]);

  const getStatusTag = (status: string) => {
    switch(status) {
      case 'approved':
        return <Tag color="success">Approved</Tag>;
      case 'pending':
        return <Tag color="warning">Pending</Tag>;
      case 'rejected':
        return <Tag color="error">Rejected</Tag>;
      case 'suspended':
        return <Tag color="purple">Suspended</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const handleSelectionChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleUpdateStatus = async (status: string, rejectionReason?: string) => {
    if (!selectedExhibitor) return;

    setUpdateLoading(true);
    try {
      await updateExhibitorStatus(selectedExhibitor.id, status, rejectionReason);
      setIsUpdateModalVisible(false);
      setRejectionReason('');
      setSelectedExhibitor(null);
      message.success('Status updated successfully');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditExhibitor = async (values: UpdateExhibitorDto) => {
    if (!selectedExhibitor) return;

    setEditLoading(true);
    try {
      await updateExhibitor(selectedExhibitor.id, values);
      setIsEditModalVisible(false);
      form.resetFields();
      setSelectedExhibitor(null);
      message.success('Exhibitor updated successfully');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddExhibitor = async (values: CreateExhibitorDto) => {
    setAddLoading(true);
    try {
      await createExhibitor(values);
      setIsAddModalVisible(false);
      addForm.resetFields();
      message.success({
        content: 'Exhibitor created successfully! Login credentials have been sent to their email and phone.',
        duration: 5
      });
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteExhibitor = async (id: string) => {
    setDeleteLoading(true);
    try {
      await deleteExhibitor(id);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters({ search: value });
    loadExhibitors();
  };

  const handleFilterByStatus = (value: any) => {
    setFilters({ status: value });
    loadExhibitors();
  };

  const handleTableChange = (page: number, size: number) => {
    setPagination({ current: page, pageSize: size });
    loadExhibitors();
  };

  const handleSortChange = (field: string, order: 'ascend' | 'descend' | undefined) => {
    const sortBy = field as 'createdAt' | 'companyName' | 'status' | 'contactPerson' | 'updatedAt';
    const sortOrder = order === 'ascend' ? 'asc' : 'desc';
    loadExhibitors({ sortBy, sortOrder });
  };

  const handleExportToExcel = async (selectedOnly = false) => {
    try {
      const dataToExport = selectedOnly 
        ? exhibitors.filter(exhibitor => selectedRowKeys.includes(exhibitor.id))
        : exhibitors;

      if (dataToExport.length === 0) {
        message.warning('No data to export');
        return;
      }

      const exportData = dataToExport.map(exhibitor => ({
        'Company Name': exhibitor.companyName,
        'Contact Person': exhibitor.contactPerson,
        'Email': exhibitor.email,
        'Phone': exhibitor.phone,
        'Address': exhibitor.address || '',
        'City': exhibitor.city || '',
        'State': exhibitor.state || '',
        'PIN Code': exhibitor.pinCode || '',
        'Website': exhibitor.website || '',
        'PAN Number': exhibitor.panNumber || '',
        'GST Number': exhibitor.gstNumber || '',
        'Status': exhibitor.status,
        'Active': exhibitor.isActive ? 'Yes' : 'No',
        'Created Date': new Date(exhibitor.createdAt).toLocaleDateString(),
        'Last Updated': new Date(exhibitor.updatedAt).toLocaleDateString(),
      }));

             // Use a simple export without xlsx dependency
       const headers = Object.keys(exportData[0]);
       const csvContent = [
         headers.join(','),
         ...exportData.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
       ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `exhibitors_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      message.success('Data exported successfully');
    } catch (error) {
      message.error('Export failed');
    }
  };

  const handleExport = () => {
    Modal.confirm({
      title: 'Export Exhibitors',
      content: 'Do you want to export all exhibitors or only selected ones?',
      okText: 'All Exhibitors',
      cancelText: 'Selected Only',
      onOk: () => handleExportToExcel(false),
      onCancel: () => handleExportToExcel(true),
    });
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete these exhibitors?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await bulkDeleteExhibitors(selectedRowKeys as string[]);
          setSelectedRowKeys([]);
        } catch (error) {
          // Error handling is done in the hook
        }
      },
    });
  };

  const handleViewExhibitor = (exhibitor: ExhibitorProfile) => {
    setSelectedExhibitor(exhibitor);
    setIsViewModalVisible(true);
  };

  const handleEditExhibitorOpen = (exhibitor: ExhibitorProfile) => {
    setSelectedExhibitor(exhibitor);
    form.setFieldsValue(exhibitor);
    setIsEditModalVisible(true);
  };

  const handleUpdateStatusAction = (exhibitor: ExhibitorProfile) => {
    setSelectedExhibitor(exhibitor);
    setStatus(exhibitor.status as any);
    setRejectionReason(exhibitor.rejectionReason || '');
    setIsUpdateModalVisible(true);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: '24px' }}>
        <Col flex="auto">
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Exhibitor Management</Title>
            <Text type="secondary">Manage exhibitor registrations and approvals</Text>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              size="large"
            >
              Export
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<UserAddOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Add Exhibitor
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Exhibitors"
              value={stats.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Approval"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search exhibitors..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              allowClear
              onChange={handleFilterByStatus}
            >
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              {hasSelected && (
                <Button
                  type="primary"
                  danger
                  onClick={handleBulkDelete}
                  loading={deleteLoading}
                >
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <ExhibitorTable
          exhibitors={exhibitors}
          loading={loading}
          currentPage={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          totalPages={pagination.totalPages}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          onView={handleViewExhibitor}
                      onEdit={handleEditExhibitorOpen}
          onUpdateStatus={handleUpdateStatusAction}
          onDelete={handleDeleteExhibitor}
          onTableChange={handleTableChange}
          onSortChange={handleSortChange}
        />
      </Card>

      {/* Add New Exhibitor Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserAddOutlined style={{ color: '#1890ff' }} />
            Add New Exhibitor
          </div>
        }
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={800}
        styles={{
          body: { padding: '20px 24px' }
        }}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddExhibitor}
          size="middle"
        >
          {/* Company Information Section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div style={{
                width: 4,
                height: 16,
                backgroundColor: '#1890ff',
                borderRadius: 2
              }} />
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1890ff'
              }}>
                Company Information
              </span>
            </div>
            
            <Row gutter={[16, 12]}>
              <Col span={24}>
                <Form.Item
                  name="companyName"
                  label="Company Name"
                  rules={[{ required: true, message: 'Please enter company name' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="Enter company name" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ max: 200, message: 'Address cannot exceed 200 characters' }]}
                  style={{ marginBottom: 12 }}
                >
                  <TextArea 
                    rows={2} 
                    placeholder="Enter complete address" 
                    showCount 
                    maxLength={200}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="city"
                  label="City"
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="Enter city" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="state"
                  label="State"
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="Enter state" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="pinCode"
                  label="PIN Code"
                  rules={[
                    { pattern: /^[0-9]{6}$/, message: 'Enter valid 6-digit PIN code' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="123456" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="website"
                  label="Website"
                  rules={[
                    { type: 'url', message: 'Enter valid website URL' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="https://www.company.com" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Company Description"
                  rules={[{ max: 500, message: 'Description cannot exceed 500 characters' }]}
                  style={{ marginBottom: 12 }}
                >
                  <TextArea 
                    rows={2} 
                    placeholder="Brief description about the company" 
                    showCount 
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Contact & Legal Information Section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div style={{
                width: 4,
                height: 16,
                backgroundColor: '#722ed1',
                borderRadius: 2
              }} />
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#722ed1'
              }}>
                Contact & Legal Information
              </span>
            </div>
            
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Form.Item
                  name="contactPerson"
                  label="Contact Person"
                  rules={[{ required: true, message: 'Please enter contact person name' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="Enter contact person name" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter email address' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input 
                    placeholder="contact@company.com" 
                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^[\+]?[1-9][\d]{9,15}$/, message: 'Please enter a valid phone number' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input 
                    placeholder="9876543210" 
                    prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="panNumber"
                  label="PAN Number"
                  rules={[
                    { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Enter valid PAN (e.g., ABCDE1234F)' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input 
                    placeholder="ABCDE1234F" 
                    style={{ textTransform: 'uppercase' }}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="gstNumber"
                  label="GST Number"
                  rules={[
                    { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Enter valid GST number' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input 
                    placeholder="27AAPFU0939F1ZV" 
                    style={{ textTransform: 'uppercase' }}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Account Status"
                  valuePropName="checked"
                  initialValue={true}
                  style={{ marginBottom: 12 }}
                >
                  <Switch 
                    checkedChildren="Active" 
                    unCheckedChildren="Inactive" 
                    defaultChecked 
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Account Creation Notice */}
          <Alert
            message="Account Creation Notice"
            description="A temporary password will be automatically generated and sent to the provided email and phone number. The exhibitor will be pre-approved and can log in immediately."
            type="info"
            showIcon
            style={{ 
              marginBottom: 20,
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f'
            }}
          />

          {/* Form Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 12,
            paddingTop: 16,
            borderTop: '1px solid #f0f0f0'
          }}>
            <Button 
              onClick={() => {
                setIsAddModalVisible(false);
                addForm.resetFields();
              }}
              style={{ minWidth: 80 }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={addLoading}
              style={{ minWidth: 120 }}
            >
              {addLoading ? 'Creating...' : 'Create Exhibitor'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Exhibitor Status"
        open={isUpdateModalVisible}
        onOk={() => handleUpdateStatus(status, rejectionReason)}
        onCancel={() => setIsUpdateModalVisible(false)}
        confirmLoading={updateLoading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <strong>Exhibitor:</strong> {selectedExhibitor?.companyName}
          </div>
          <div>
            <strong>Current Status:</strong> {getStatusTag(selectedExhibitor?.status || '')}
          </div>
          <div>
            <strong>New Status:</strong>
            <Radio.Group value={status} onChange={(e) => setStatus(e.target.value)}>
              <Radio value="pending">Pending</Radio>
              <Radio value="approved">Approved</Radio>
              <Radio value="rejected">Rejected</Radio>
              <Radio value="suspended">Suspended</Radio>
            </Radio.Group>
          </div>
          {(status === 'rejected' || status === 'suspended') && (
            <div>
              <strong>Reason:</strong>
              <TextArea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Enter reason for rejection/suspension"
              />
            </div>
          )}
        </Space>
      </Modal>

      {/* Edit Exhibitor Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditOutlined style={{ color: '#1890ff' }} />
            Edit Exhibitor
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={800}
        styles={{
          body: { padding: '20px 24px' }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditExhibitor}
          size="middle"
        >
          {/* Company Information Section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div style={{
                width: 4,
                height: 16,
                backgroundColor: '#1890ff',
                borderRadius: 2
              }} />
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1890ff'
              }}>
                Company Information
              </span>
            </div>
            
            <Row gutter={[16, 12]}>
              <Col span={24}>
                <Form.Item
                  name="companyName"
                  label="Company Name"
                  rules={[{ required: true, message: 'Please enter company name' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="Enter company name" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ max: 200, message: 'Address cannot exceed 200 characters' }]}
                  style={{ marginBottom: 12 }}
                >
                  <TextArea 
                    rows={2} 
                    placeholder="Enter complete address" 
                    showCount 
                    maxLength={200}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="city"
                  label="City"
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="Enter city" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="state"
                  label="State"
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="Enter state" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="pinCode"
                  label="PIN Code"
                  rules={[
                    { pattern: /^[0-9]{6}$/, message: 'Enter valid 6-digit PIN code' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="123456" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="website"
                  label="Website"
                  rules={[
                    { type: 'url', message: 'Enter valid website URL' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="https://www.company.com" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Company Description"
                  rules={[{ max: 500, message: 'Description cannot exceed 500 characters' }]}
                  style={{ marginBottom: 12 }}
                >
                  <TextArea 
                    rows={2} 
                    placeholder="Brief description about the company" 
                    showCount 
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Contact & Legal Information Section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div style={{
                width: 4,
                height: 16,
                backgroundColor: '#722ed1',
                borderRadius: 2
              }} />
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#722ed1'
              }}>
                Contact & Legal Information
              </span>
            </div>
            
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Form.Item
                  name="contactPerson"
                  label="Contact Person"
                  rules={[{ required: true, message: 'Please enter contact person name' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="Enter contact person name" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter email address' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input 
                    placeholder="contact@company.com" 
                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^[\+]?[1-9][\d]{9,15}$/, message: 'Please enter a valid phone number' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input 
                    placeholder="9876543210" 
                    prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="panNumber"
                  label="PAN Number"
                  rules={[
                    { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Enter valid PAN (e.g., ABCDE1234F)' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input 
                    placeholder="ABCDE1234F" 
                    style={{ textTransform: 'uppercase' }}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="gstNumber"
                  label="GST Number"
                  rules={[
                    { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Enter valid GST number' }
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input 
                    placeholder="27AAPFU0939F1ZV" 
                    style={{ textTransform: 'uppercase' }}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Account Status"
                  valuePropName="checked"
                  style={{ marginBottom: 12 }}
                >
                  <Switch 
                    checkedChildren="Active" 
                    unCheckedChildren="Inactive" 
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Form Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 12,
            paddingTop: 16,
            borderTop: '1px solid #f0f0f0'
          }}>
            <Button 
              onClick={() => {
                setIsEditModalVisible(false);
                form.resetFields();
              }}
              style={{ minWidth: 80 }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={editLoading}
              style={{ minWidth: 120 }}
            >
              {editLoading ? 'Updating...' : 'Update Exhibitor'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Exhibitor Modal */}
      <Modal
        title="View Exhibitor Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedExhibitor && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Company Name:</strong> {selectedExhibitor.companyName}
              </Col>
              <Col span={12}>
                <strong>Contact Person:</strong> {selectedExhibitor.contactPerson}
              </Col>
              <Col span={12}>
                <strong>Email:</strong> {selectedExhibitor.email}
              </Col>
              <Col span={12}>
                <strong>Phone:</strong> {selectedExhibitor.phone}
              </Col>
              <Col span={12}>
                <strong>Status:</strong> {getStatusTag(selectedExhibitor.status)}
              </Col>
              <Col span={12}>
                <strong>Active:</strong> {selectedExhibitor.isActive ? 'Yes' : 'No'}
              </Col>
              <Col span={24}>
                <strong>Address:</strong> {selectedExhibitor.address || 'Not provided'}
              </Col>
              <Col span={24}>
                <strong>Created:</strong> {new Date(selectedExhibitor.createdAt).toLocaleString()}
              </Col>
              <Col span={24}>
                <strong>Last Updated:</strong> {new Date(selectedExhibitor.updatedAt).toLocaleString()}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExhibitorsPage; 