import React, { useState } from 'react';
import { message, Modal, Form, Table, Card, Button, Menu, Tag, Descriptions, Select, Input } from 'antd';
import { EyeOutlined, EditOutlined, FileTextOutlined, DeleteOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import bookingService from '../../services/booking.service';

// Import our new modular components
import { BookingHeader, BookingStats, BookingFilters } from './components';
import { useBookings, useBookingStats } from './hooks';
import { Booking, UpdateBookingStatusData } from './types';
import { createBookingTableColumns } from './utils/tableColumns';
import { getStatusColor, getPaymentStatusColor } from './utils/statusColors';

const BookingsPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [statusForm] = Form.useForm();
  
  // Custom hooks for data management
  const {
    bookings,
    loading,
    pagination,
    searchText,
    statusFilter,
    paymentFilter,
    sourceFilter,
    exhibitionFilter,
    fetchBookings,
    setSearchText,
    setStatusFilter,
    setPaymentFilter,
    setSourceFilter,
    setExhibitionFilter,
    setPagination,
  } = useBookings();

  const {
    stats,
    loading: statsLoading,
    fetchStats,
  } = useBookingStats();

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Event handlers
  const handleRefresh = () => {
    fetchBookings();
    fetchStats();
  };

  const handleExport = () => {
    message.info('Export functionality coming soon');
  };

  const handleCreateBooking = () => {
    navigate('/bookings/create');
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setViewModalVisible(true);
  };

  const handleUpdateStatus = (booking: Booking) => {
    setSelectedBooking(booking);
    setStatusModalVisible(true);
    statusForm.setFieldsValue({
      status: booking.status,
      rejectionReason: booking.rejectionReason || '',
      cancellationReason: booking.cancellationReason || ''
    });
  };

  const handleStatusSubmit = async (values: UpdateBookingStatusData) => {
    if (!selectedBooking) return;

    try {
      await bookingService.updateBookingStatus(selectedBooking._id, values);
      message.success(`Booking status updated to ${values.status.toUpperCase()}`);
      setStatusModalVisible(false);
      setSelectedBooking(null);
      statusForm.resetFields();
      fetchBookings();
      fetchStats();
    } catch (error: any) {
      message.error(error.message || 'Failed to update booking status');
    }
  };

  const performDeleteBooking = async (booking: Booking) => {
    try {
      await bookingService.deleteBooking(booking._id);
      message.success('Booking deleted successfully');
      fetchBookings();
      fetchStats();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete booking');
      throw error; // Re-throw to let Modal.confirm handle it
    }
  };

  const handleDeleteBooking = (booking: Booking) => {
    setBookingToDelete(booking);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (bookingToDelete) {
      await performDeleteBooking(bookingToDelete);
      setDeleteModalVisible(false);
      setBookingToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setBookingToDelete(null);
  };

  const handleTableChange = (paginationInfo: any) => {
    setPagination({
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
      total: pagination.total,
    });
  };



  // Create action menu for table rows
  const getActionMenu = (record: Booking) => (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleViewBooking(record)}>
        View Details
      </Menu.Item>
      <Menu.Item key="status" icon={<EditOutlined />} onClick={() => handleUpdateStatus(record)}>
        Update Status
      </Menu.Item>
      <Menu.Item key="invoice" icon={<FileTextOutlined />}>
        View Invoice
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />} 
        danger
        onClick={() => handleDeleteBooking(record)}
      >
        Delete Booking
      </Menu.Item>
    </Menu>
  );

  // Get table columns
  const columns = createBookingTableColumns(getActionMenu);

  return (
    <div style={{ 
      // background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
      }}>
        {/* Header */}
        <BookingHeader
          loading={loading}
          statsLoading={statsLoading}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onCreate={handleCreateBooking}
        />

        {/* Statistics */}
        <BookingStats 
          stats={stats}
          loading={statsLoading}
        />

        {/* Filters */}
        <BookingFilters
          searchText={searchText}
          statusFilter={statusFilter}
          paymentFilter={paymentFilter}
          sourceFilter={sourceFilter}
          exhibitionFilter={exhibitionFilter}
          onSearchChange={setSearchText}
          onStatusChange={setStatusFilter}
          onPaymentChange={setPaymentFilter}
          onSourceChange={setSourceFilter}
          onExhibitionChange={setExhibitionFilter}
        />

        {/* Bookings Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} bookings`
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* View Booking Modal */}
        <Modal
          title={`Booking Details - ${selectedBooking?.invoiceNumber}`}
          open={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedBooking(null);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setViewModalVisible(false);
              setSelectedBooking(null);
            }}>
              Close
            </Button>,
            <Button 
              key="status" 
              type="primary" 
              onClick={() => {
                setViewModalVisible(false);
                handleUpdateStatus(selectedBooking!);
              }}
            >
              Update Status
            </Button>
          ]}
          width={800}
        >
          {selectedBooking && (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Customer Name">{selectedBooking.customerName}</Descriptions.Item>
              <Descriptions.Item label="Company">{selectedBooking.companyName}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedBooking.customerEmail}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedBooking.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="Exhibition" span={2}>
                {typeof selectedBooking.exhibitionId === 'object' 
                  ? selectedBooking.exhibitionId.name 
                  : selectedBooking.exhibitionId}
              </Descriptions.Item>
              <Descriptions.Item label="Venue" span={2}>
                {typeof selectedBooking.exhibitionId === 'object' 
                  ? selectedBooking.exhibitionId.venue 
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Stalls">{selectedBooking.stallIds.join(', ')}</Descriptions.Item>
              <Descriptions.Item label="Amount">₹{selectedBooking.amount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedBooking.status)}>
                  {selectedBooking.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={getPaymentStatusColor(selectedBooking.paymentStatus)}>
                  {selectedBooking.paymentStatus.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(selectedBooking.createdAt).format('MMMM DD, YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Source">
                <Tag color="blue">{selectedBooking.bookingSource.toUpperCase()}</Tag>
              </Descriptions.Item>
              {selectedBooking.rejectionReason && (
                <Descriptions.Item label="Rejection Reason" span={2}>
                  {selectedBooking.rejectionReason}
                </Descriptions.Item>
              )}
              {selectedBooking.cancellationReason && (
                <Descriptions.Item label="Cancellation Reason" span={2}>
                  {selectedBooking.cancellationReason}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>

        {/* Update Status Modal */}
        <Modal
          title="Update Booking Status"
          open={statusModalVisible}
          onCancel={() => {
            setStatusModalVisible(false);
            setSelectedBooking(null);
            statusForm.resetFields();
          }}
          onOk={() => statusForm.submit()}
          okText="Update Status"
          width={600}
        >
          {selectedBooking && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <strong>Booking:</strong> {selectedBooking.invoiceNumber} - {selectedBooking.customerName}
            </div>
          )}
          
          <Form
            form={statusForm}
            layout="vertical"
            onFinish={handleStatusSubmit}
          >
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select
                size="large"
                placeholder="Select status"
                style={{ width: '100%' }}
              >
                <Select.Option value="pending">
                  <Tag color="warning" style={{ marginRight: 8 }}>●</Tag>
                  Pending
                </Select.Option>
                <Select.Option value="approved">
                  <Tag color="blue" style={{ marginRight: 8 }}>●</Tag>
                  Approved
                </Select.Option>
                <Select.Option value="confirmed">
                  <Tag color="success" style={{ marginRight: 8 }}>●</Tag>
                  Confirmed
                </Select.Option>
                <Select.Option value="rejected">
                  <Tag color="error" style={{ marginRight: 8 }}>●</Tag>
                  Rejected
                </Select.Option>
                <Select.Option value="cancelled">
                  <Tag color="default" style={{ marginRight: 8 }}>●</Tag>
                  Cancelled
                </Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}>
              {({ getFieldValue }) => {
                const status = getFieldValue('status');
                
                return (
                  <>
                    {status === 'rejected' && (
                      <Form.Item
                        label="Rejection Reason"
                        name="rejectionReason"
                        rules={[{ required: true, message: 'Please provide reason for rejection' }]}
                      >
                        <Input.TextArea
                          rows={3}
                          placeholder="Please provide reason for rejection..."
                          showCount
                          maxLength={500}
                        />
                      </Form.Item>
                    )}
                    
                    {status === 'cancelled' && (
                      <Form.Item
                        label="Cancellation Reason"
                        name="cancellationReason"
                        rules={[{ required: true, message: 'Please provide reason for cancellation' }]}
                      >
                        <Input.TextArea
                          rows={3}
                          placeholder="Please provide reason for cancellation..."
                          showCount
                          maxLength={500}
                        />
                      </Form.Item>
                    )}
                  </>
                );
              }}
            </Form.Item>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Delete Booking"
          open={deleteModalVisible}
          onCancel={handleCancelDelete}
          onOk={handleConfirmDelete}
          okText="Yes, Delete"
          cancelText="Cancel"
          okType="danger"
        >
          <p>
            Are you sure you want to delete booking <strong>{bookingToDelete?.invoiceNumber}</strong>?
          </p>
          <p>This action cannot be undone.</p>
        </Modal>
      </div>
    </div>
  );
};

export default BookingsPageNew; 