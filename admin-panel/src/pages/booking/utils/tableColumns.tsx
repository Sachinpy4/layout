import React from 'react';
import { Typography, Tag, Tooltip, Button, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Booking } from '../types';
import { getStatusColor, getPaymentStatusColor, getSourceColor } from './statusColors';

const { Text } = Typography;

export const createBookingTableColumns = (
  getActionMenu: (record: Booking) => React.ReactElement
) => [
  {
    title: 'Invoice No.',
    dataIndex: 'invoiceNumber',
    key: 'invoiceNumber',
    width: 140,
    fixed: 'left' as const,
    render: (text: string) => (
      <Text strong style={{ fontFamily: 'monospace' }}>{text}</Text>
    )
  },
  {
    title: 'Customer',
    key: 'customer',
    width: 200,
    render: (record: Booking) => (
      <div>
        <div><Text strong>{record.customerName}</Text></div>
        <div><Text type="secondary" style={{ fontSize: '12px' }}>{record.companyName}</Text></div>
        <div><Text type="secondary" style={{ fontSize: '11px' }}>{record.customerEmail}</Text></div>
      </div>
    )
  },

  {
    title: 'Stalls',
    key: 'stalls',
    width: 180,
    render: (record: Booking) => {
      const stalls = record.calculations?.stalls || [];
      
      const formatDimensions = (dimensions: any) => {
        if (!dimensions) return 'Dimensions N/A';
        if (typeof dimensions.width !== 'number' || typeof dimensions.height !== 'number') {
          return 'Invalid dimensions';
        }
        const area = (dimensions.width * dimensions.height).toFixed(1);
        return `${dimensions.width.toFixed(1)}m × ${dimensions.height.toFixed(1)}m (${area}m²)`;
      };
      
      const stallDetails = stalls.map(stall => {
        const dimensionStr = formatDimensions(stall.dimensions);
        return `${stall.number || 'N/A'}: ${dimensionStr}`;
      }).join('\n');
      
      return (
        <div>
          <div>
            <Tag color="blue">{stalls.length} stall{stalls.length > 1 ? 's' : ''}</Tag>
          </div>
          <Tooltip title={<div style={{ whiteSpace: 'pre-line' }}>{stallDetails}</div>}>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {stalls.map((stall, index) => (
                <div key={stall.stallId || index} style={{ color: '#666', marginBottom: '2px' }}>
                  <Text strong>{stall.number || 'N/A'}</Text>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {formatDimensions(stall.dimensions)}
                  </div>
                </div>
              ))}
            </div>
          </Tooltip>
        </div>
      );
    }
  },
  {
    title: 'Base Amount',
    key: 'baseAmount',
    width: 130,
    align: 'right' as const,
    render: (record: Booking) => (
      <Text strong style={{ color: '#1890ff' }}>
        ₹{record.calculations.totalBaseAmount.toLocaleString()}
      </Text>
    )
  },
  {
    title: 'Discount',
    key: 'discount',
    width: 130,
    align: 'right' as const,
    render: (record: Booking) => {
      const totalDiscount = record.calculations.totalDiscountAmount;
      const totalBase = record.calculations.totalBaseAmount;
      const discountPercentage = totalBase > 0 ? (totalDiscount / totalBase) * 100 : 0;
      
      return (
        <div>
          <Text strong style={{ color: '#ff4d4f' }}>
            ₹{totalDiscount.toLocaleString()}
          </Text>
          {discountPercentage > 0 && (
            <div style={{ fontSize: '11px', color: '#666' }}>
              ({discountPercentage.toFixed(1)}%)
            </div>
          )}
        </div>
      );
    }
  },
  {
    title: 'Total Amount',
    key: 'totalAmount',
    width: 130,
    align: 'right' as const,
    render: (record: Booking) => (
      <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
        ₹{record.calculations.totalAmount.toLocaleString()}
      </Text>
    )
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => (
      <Tag color={getStatusColor(status)}>
        {status.toUpperCase()}
      </Tag>
    )
  },
  {
    title: 'Payment',
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    width: 100,
    render: (status: string) => (
      <Tag color={getPaymentStatusColor(status)}>
        {status.toUpperCase()}
      </Tag>
    )
  },
  {
    title: 'Source',
    dataIndex: 'bookingSource',
    key: 'bookingSource',
    width: 80,
    render: (source: string) => (
      <Tag color={getSourceColor(source)}>
        {source.toUpperCase()}
      </Tag>
    )
  },
  {
    title: 'Created',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120,
    render: (date: string) => dayjs(date).format('MMM DD, YYYY')
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    fixed: 'right' as const,
    align: 'center' as const,
    render: (record: Booking) => (
      <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
        <Button type="text" icon={<MoreOutlined />} />
      </Dropdown>
    )
  }
]; 