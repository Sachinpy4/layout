import React, { useState, useEffect } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleFilled, CloseCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Table, Card, Typography, Tag, Avatar, Switch, Space, Modal, Tooltip, Badge, Input, Row, Col, App } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchRoles, addRole, modifyRole, removeRole, setSelectedRole } from '../../store/slices/roleSlice';
import { Role, CreateRoleData } from '../../services/role.service';
import RoleModal from './RoleModal';
import { usePermission } from '../../hooks/reduxHooks';

const { Title, Paragraph, Text } = Typography;
const { confirm } = Modal;

function PermissionIcon({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <CheckCircleFilled className="text-success" style={{ color: '#52c41a', fontSize: 16 }} />
  ) : (
    <CloseCircleFilled className="text-danger" style={{ color: '#f5222d', fontSize: 16 }} />
  );
}

// Helper function to check if a role has a specific permission
const hasPermission = (role: Role, permissionKey: string): boolean => {
  return role.permissions.includes(permissionKey);
};

export default function RolesPage() {
  const { message, notification } = App.useApp();
  const dispatch = useDispatch<AppDispatch>();
  const { roles, loading, error } = useSelector((state: RootState) => state.role);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { hasPermission } = usePermission();
  
  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);
  
  useEffect(() => {
    if (error) {
      notification.error({
        message: 'Error',
        description: error,
      });
    }
  }, [error, notification]);
  
  const handleAddRole = () => {
    setEditingRole(null);
    setModalVisible(true);
  };
  
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setModalVisible(true);
  };
  
  const handleSaveRole = (roleData: CreateRoleData) => {
    if (editingRole) {
      dispatch(modifyRole({ id: editingRole._id, roleData }))
        .unwrap()
        .then(() => {
          setModalVisible(false);
          message.success('Role updated successfully');
        })
        .catch((err: any) => {
          message.error(`Failed to update role: ${err.message}`);
        });
    } else {
      dispatch(addRole(roleData))
        .unwrap()
        .then(() => {
          setModalVisible(false);
          message.success('Role created successfully');
        })
        .catch((err: any) => {
          message.error(`Failed to create role: ${err.message}`);
        });
    }
  };
  
  const showDeleteConfirm = (role: Role) => {
    confirm({
      title: 'Are you sure you want to delete this role?',
      icon: <ExclamationCircleOutlined />,
      content: `This will permanently delete the ${role.name} role. This action cannot be undone.`,
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        dispatch(removeRole(role._id))
          .unwrap()
          .then(() => {
            message.success(`${role.name} role deleted successfully`);
          })
          .catch((err: any) => {
            message.error(`Failed to delete role: ${err.message}`);
          });
      },
    });
  };

  const columns = [
    {
      title: 'Role',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <Space>
          <Avatar 
            style={{ 
              backgroundColor: getAvatarColor(record.name)
            }}
          >
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Read',
      key: 'read',
      align: 'center' as const,
      render: (_: any, record: Role) => <PermissionIcon allowed={hasGeneralReadPermission(record)} />,
    },
    {
      title: 'Write',
      key: 'write',
      align: 'center' as const,
      render: (_: any, record: Role) => <PermissionIcon allowed={hasGeneralWritePermission(record)} />,
    },
    {
      title: 'Delete',
      key: 'delete',
      align: 'center' as const,
      render: (_: any, record: Role) => <PermissionIcon allowed={hasGeneralDeletePermission(record)} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: Role) => (
        <Space>
          {hasPermission('roles_edit') && (
            <Tooltip title={record.name === 'Administrator' ? 'Administrator role cannot be edited' : 'Edit role'}>
              <Button 
                type="primary" 
                shape="circle" 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => handleEditRole(record)}
                disabled={record.name === 'Administrator'} // Prevent editing of Administrator role
              />
            </Tooltip>
          )}
          {hasPermission('roles_delete') && (
            <Tooltip title="Delete role">
              <Button 
                danger 
                shape="circle" 
                icon={<DeleteOutlined />} 
                size="small"
                onClick={() => showDeleteConfirm(record)} 
                disabled={record.name === 'Administrator'} // Prevent deletion of Administrator role
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Helper functions to determine general permissions
  const hasGeneralReadPermission = (role: Role) => {
    return role.permissions.some(perm => perm.endsWith('_view'));
  };
  
  const hasGeneralWritePermission = (role: Role) => {
    return role.permissions.some(perm => perm.endsWith('_create') || perm.endsWith('_edit'));
  };
  
  const hasGeneralDeletePermission = (role: Role) => {
    return role.permissions.some(perm => perm.endsWith('_delete'));
  };
  
  const getAvatarColor = (name: string) => {
    const colors = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredRoles = roles.filter(
    role => role.name.toLowerCase().includes(searchText.toLowerCase()) || 
           role.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Roles & Permissions</Title>
        <Paragraph>Manage role-based access control and permissions for your users.</Paragraph>
      </div>

      <Card 
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
        loading={loading && roles.length === 0}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={16}>
            <Input 
              placeholder="Search roles..." 
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<Text type="secondary" style={{ fontSize: 16 }}>🔍</Text>}
            />
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            {hasPermission('roles_create') && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                style={{ borderRadius: 6 }}
                onClick={handleAddRole}
              >
                Add Role
              </Button>
            )}
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={filteredRoles}
          rowKey="_id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} roles`,
          }}
          style={{ marginTop: 8 }}
          loading={loading && roles.length > 0}
        />
      </Card>

      <Card 
        title={<Title level={4} style={{ margin: 0 }}>Role Management Tips</Title>}
        style={{ marginTop: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Space direction="vertical" style={{ flex: 1, minWidth: 250 }}>
            <Title level={5}>Best Practices</Title>
            <ul style={{ paddingLeft: 20 }}>
              <li><Text>Follow the principle of least privilege</Text></li>
              <li><Text>Regularly audit user roles</Text></li>
              <li><Text>Document role responsibilities</Text></li>
            </ul>
          </Space>
          <Space direction="vertical" style={{ flex: 1, minWidth: 250 }}>
            <Title level={5}>Role Inheritance</Title>
            <Paragraph>
              Higher-level roles automatically include permissions from lower-level roles to ensure consistency.
            </Paragraph>
          </Space>
        </div>
      </Card>
      
      <RoleModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSave={handleSaveRole}
        role={editingRole}
        loading={loading}
      />
    </div>
  );
} 