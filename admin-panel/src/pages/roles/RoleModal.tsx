import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Checkbox, Button, Row, Col, Card, Divider, Typography, Space } from 'antd';
import { Role, CreateRoleData } from '../../services/role.service';

const { Text } = Typography;

interface RoleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (roleData: CreateRoleData) => void;
  role?: Role | null;
  loading: boolean;
}

// These would ideally come from an API or a constants file
const AVAILABLE_PERMISSIONS = [
  { key: 'dashboard_view', label: 'View Dashboard', group: 'Dashboard' },
  { key: 'dashboard_manage', label: 'Manage Dashboard', group: 'Dashboard' },
  
  { key: 'users_view', label: 'View Users', group: 'Users' },
  { key: 'users_create', label: 'Create Users', group: 'Users' },
  { key: 'users_edit', label: 'Edit Users', group: 'Users' },
  { key: 'users_delete', label: 'Delete Users', group: 'Users' },
  
  { key: 'roles_view', label: 'View Roles', group: 'Roles' },
  { key: 'roles_create', label: 'Create Roles', group: 'Roles' },
  { key: 'roles_edit', label: 'Edit Roles', group: 'Roles' },
  { key: 'roles_delete', label: 'Delete Roles', group: 'Roles' },
  
  { key: 'exhibitions_view', label: 'View Exhibitions', group: 'Exhibitions' },
  { key: 'exhibitions_create', label: 'Create Exhibitions', group: 'Exhibitions' },
  { key: 'exhibitions_edit', label: 'Edit Exhibitions', group: 'Exhibitions' },
  { key: 'exhibitions_delete', label: 'Delete Exhibitions', group: 'Exhibitions' },
  
  { key: 'amenities_view', label: 'View Amenities', group: 'Amenities' },
  { key: 'amenities_create', label: 'Create Amenities', group: 'Amenities' },
  { key: 'amenities_edit', label: 'Edit Amenities', group: 'Amenities' },
  { key: 'amenities_delete', label: 'Delete Amenities', group: 'Amenities' },
  
  { key: 'bookings_view', label: 'View Bookings', group: 'Bookings' },
  { key: 'bookings_create', label: 'Create Bookings', group: 'Bookings' },
  { key: 'bookings_edit', label: 'Edit Bookings', group: 'Bookings' },
  { key: 'bookings_delete', label: 'Delete Bookings', group: 'Bookings' },
  
  { key: 'invoices_view', label: 'View Invoices', group: 'Invoices' },
  { key: 'invoices_create', label: 'Create Invoices', group: 'Invoices' },
  { key: 'invoices_edit', label: 'Edit Invoices', group: 'Invoices' },
  { key: 'invoices_delete', label: 'Delete Invoices', group: 'Invoices' },
  
  { key: 'exhibitors_view', label: 'View Exhibitors', group: 'Exhibitors' },
  { key: 'exhibitors_create', label: 'Create Exhibitors', group: 'Exhibitors' },
  { key: 'exhibitors_edit', label: 'Edit Exhibitors', group: 'Exhibitors' },
  { key: 'exhibitors_delete', label: 'Delete Exhibitors', group: 'Exhibitors' },
  
  { key: 'settings_view', label: 'View Settings', group: 'Settings' },
  { key: 'settings_edit', label: 'Edit Settings', group: 'Settings' },
];

// Group permissions by their category
const groupedPermissions = AVAILABLE_PERMISSIONS.reduce<Record<string, Array<{key: string, label: string}>>>(
  (groups, permission) => {
    if (!groups[permission.group]) {
      groups[permission.group] = [];
    }
    groups[permission.group].push({ key: permission.key, label: permission.label });
    return groups;
  },
  {}
);

const RoleModal: React.FC<RoleModalProps> = ({ visible, onCancel, onSave, role, loading }) => {
  const [form] = Form.useForm();
  const isEditing = !!role;
  // Store all selected permissions
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  useEffect(() => {
    if (visible) {
      if (role) {
        const permissions = role.permissions || [];
        form.setFieldsValue({
          name: role.name,
          description: role.description,
          permissions: permissions,
        });
        setSelectedPermissions(permissions);
      } else {
        form.resetFields();
        setSelectedPermissions([]);
      }
    }
  }, [visible, role, form]);
  
  const handleSubmit = () => {
    // Update form with current selected permissions before submit
    form.setFieldsValue({ permissions: selectedPermissions });
    
    form.validateFields().then(values => {
      onSave(values);
    });
  };
  
  // Function to check if all permissions in a group are selected
  const areAllGroupPermissionsSelected = (group: string) => {
    const groupPermissionKeys = groupedPermissions[group].map(p => p.key);
    // Return true only if EVERY permission in this group is selected
    return groupPermissionKeys.length > 0 && groupPermissionKeys.every(key => 
      selectedPermissions.includes(key)
    );
  };
  
  // Function to toggle a single permission
  const togglePermission = (permissionKey: string, checked: boolean) => {
    let newPermissions;
    if (checked) {
      // Add the permission if it's not already included
      newPermissions = [...selectedPermissions, permissionKey];
    } else {
      // Remove the permission
      newPermissions = selectedPermissions.filter(key => key !== permissionKey);
    }
    setSelectedPermissions(newPermissions);
    // No need to update form here, we'll do that on submit
  };
  
  // Function to toggle all permissions in a specific group
  const toggleGroupPermissions = (group: string, checked: boolean) => {
    const groupPermissionKeys = groupedPermissions[group].map(p => p.key);
    let newPermissions;
    
    if (checked) {
      // Add all group permissions if they're not already included
      const permissionsToAdd = groupPermissionKeys.filter(
        key => !selectedPermissions.includes(key)
      );
      newPermissions = [...selectedPermissions, ...permissionsToAdd];
    } else {
      // Remove all permissions from this specific group
      newPermissions = selectedPermissions.filter(
        key => !groupPermissionKeys.includes(key)
      );
    }
    
    setSelectedPermissions(newPermissions);
    // No need to update form here, we'll do that on submit
  };
  
  // Check if a specific permission is selected
  const isPermissionSelected = (permissionKey: string) => {
    return selectedPermissions.includes(permissionKey);
  };
  
  return (
    <Modal
      title={isEditing ? 'Edit Role' : 'Add New Role'}
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ 
          name: '',
          description: '',
          permissions: [] 
        }}
      >
        <Form.Item
          name="name"
          label="Role Name"
          rules={[{ required: true, message: 'Please enter a role name' }]}
        >
          <Input placeholder="e.g., Administrator, Editor, Viewer" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please provide a description' }]}
        >
          <Input.TextArea 
            placeholder="Describe the purpose of this role" 
            rows={3}
          />
        </Form.Item>
        
        <Divider plain>Permissions</Divider>
        
        {/* Hidden form item to store permissions */}
        <Form.Item name="permissions" hidden={true}>
          <Input />
        </Form.Item>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '0 8px' }}>
          {Object.entries(groupedPermissions).map(([group, permissions]) => (
            <Card
              key={group}
              size="small"
              title={
                <Space>
                  <Text strong>{group}</Text>
                  <Checkbox
                    checked={areAllGroupPermissionsSelected(group)}
                    onChange={(e) => toggleGroupPermissions(group, e.target.checked)}
                  >
                    Select All
                  </Checkbox>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 12]}>
                {permissions.map(permission => (
                  <Col span={12} key={permission.key}>
                    <Checkbox 
                      checked={isPermissionSelected(permission.key)}
                      onChange={(e) => togglePermission(permission.key, e.target.checked)}
                    >
                      <Text>{permission.label}</Text>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Card>
          ))}
        </div>
      </Form>
    </Modal>
  );
};

export default RoleModal; 