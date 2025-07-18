import React from 'react';
import { 
  Table, Button, Tag, Space, Input, Tooltip, Dropdown, Menu, App
} from 'antd';
import { TableColumnsType } from 'antd';
import { 
  EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { ExhibitorProfile } from '../../services/exhibitor.service';

interface ExhibitorTableProps {
  // Data props
  exhibitors: ExhibitorProfile[];
  loading: boolean;
  
  // Pagination props
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  
  // Selection props
  selectedRowKeys: React.Key[];
  onSelectionChange: (selectedRowKeys: React.Key[]) => void;
  
  // Action handlers
  onView: (exhibitor: ExhibitorProfile) => void;
  onEdit: (exhibitor: ExhibitorProfile) => void;
  onUpdateStatus: (exhibitor: ExhibitorProfile) => void;
  onDelete: (id: string) => void;
  
  // Table change handlers
  onTableChange: (page: number, size: number) => void;
  onSortChange: (field: string, order: 'ascend' | 'descend' | undefined) => void;
}

const ExhibitorTable: React.FC<ExhibitorTableProps> = ({
  exhibitors,
  loading,
  currentPage,
  pageSize,
  total,
  selectedRowKeys,
  onSelectionChange,
  onView,
  onEdit,
  onUpdateStatus,
  onDelete,
  onTableChange,
  onSortChange
}) => {
  const { modal } = App.useApp();

  const getStatusTag = (status: string) => {
    switch(status) {
      case 'approved':
        return <Tag color="success">Approved</Tag>;
      case 'pending':
        return <Tag color="warning">Pending</Tag>;
      case 'rejected':
        return <Tag color="error">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectionChange
  };

  const columns: TableColumnsType<ExhibitorProfile> = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 200,
      fixed: 'left',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search company name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
            <Button
              onClick={() => { 
                if (clearFilters) {
                  clearFilters();
                }
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => {
        const searchTerm = String(value).toLowerCase();
        return record.companyName.toLowerCase().includes(searchTerm);
      },
      render: (text: string) => (
        <div style={{ fontWeight: 'bold' }}>{text}</div>
      ),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 160,
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search contact person"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
            <Button
              onClick={() => { 
                if (clearFilters) {
                  clearFilters();
                }
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => {
        const searchTerm = String(value).toLowerCase();
        return record.contactPerson.toLowerCase().includes(searchTerm);
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone: string) => (
        <span style={{ fontFamily: 'monospace' }}>{phone}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search email"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
            <Button
              onClick={() => { 
                if (clearFilters) {
                  clearFilters();
                }
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => {
        const searchTerm = String(value).toLowerCase();
        return record.email.toLowerCase().includes(searchTerm);
      },
      render: (email: string) => (
        <Tooltip title={email}>
          <a href={`mailto:${email}`}>{email}</a>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      sorter: true,
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Registration Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          {new Date(date).toLocaleDateString()}
        </Tooltip>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      width: 180,
      render: (website: string) => (
        website ? (
          <a href={website} target="_blank" rel="noopener noreferrer">
            {website.replace(/^https?:\/\/(www\.)?/i, '')}
          </a>
        ) : '-'
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 230,
      render: (_: any, record: ExhibitorProfile) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Button
            type="primary"
            onClick={() => onUpdateStatus(record)}
          >
            Update Status
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item 
                  key="edit" 
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                >
                  Edit
                </Menu.Item>
                <Menu.Item 
                  key="delete" 
                  icon={<DeleteOutlined />}
                  danger
                  onClick={(e) => {
                    e.domEvent.stopPropagation();
                    modal.confirm({
                      title: 'Delete Exhibitor',
                      content: 'Are you sure you want to delete this exhibitor? This action cannot be undone.',
                      okText: 'Yes',
                      okType: 'danger',
                      cancelText: 'No',
                      onOk: () => onDelete(record.id)
                    });
                  }}
                >
                  Delete
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowSelection={rowSelection}
      dataSource={exhibitors}
      columns={columns}
      rowKey="_id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        onChange: onTableChange,
        onShowSizeChange: onTableChange,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      scroll={{ x: 1500 }}
      onChange={(_pagination, _filters, sorter: any) => {
        if (sorter.field) {
          onSortChange(sorter.field, sorter.order);
        }
      }}
    />
  );
};

export default ExhibitorTable; 