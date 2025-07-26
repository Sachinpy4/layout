import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, Space, Button, Card, Typography, Divider, Row, Col, Badge, App } from 'antd';
import { ShopOutlined, DeleteOutlined } from '@ant-design/icons';
import { LayoutData, Hall } from '../../types/layout-types';
import { exhibitionService } from '@/services/exhibition.service';
import stallService from '@/services/stall.service';
const { Text } = Typography;
const { Option } = Select;

interface StallModalProps {
  visible: boolean;
  layout: LayoutData | null;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  exhibitionId?: string;
  // Add props for edit mode
  editingStall?: any;
  stallModalMode?: 'create' | 'edit';
  onEditStall?: (stallId: string) => void;
  // Add prop for pre-selected hall
  selectedHallId?: string | null;
  // Add delete functionality
  onDelete?: (stallId: string) => void;
}

const STALL_TYPES = [
  { value: 'standard', label: 'Standard Booth', color: '#52c41a', description: 'Basic exhibition stall' },
  { value: 'premium', label: 'Premium Booth', color: '#1890ff', description: 'Enhanced stall with better positioning' },
  { value: 'corner', label: 'Corner Booth', color: '#fa8c16', description: 'Corner location with more visibility' },
  { value: 'island', label: 'Island Booth', color: '#eb2f96', description: 'Standalone island booth' },
  { value: 'food', label: 'Food & Beverage', color: '#722ed1', description: 'Food service stall' },
  { value: 'meeting', label: 'Meeting Room', color: '#13c2c2', description: 'Private meeting space' }
];

const STALL_STATUSES = [
  { value: 'available', label: 'Available', color: '#52c41a' },
  { value: 'booked', label: 'Booked', color: '#ff4d4f' },
  { value: 'blocked', label: 'Blocked', color: '#8c8c8c' },
  { value: 'maintenance', label: 'Maintenance', color: '#faad14' }
];

const StallModal: React.FC<StallModalProps> = ({
  visible,
  layout,
  onCancel,
  onSubmit,
  exhibitionId,
  editingStall,
  stallModalMode,
  selectedHallId: propSelectedHallId,
  onDelete
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [selectedHallId, setSelectedHallId] = useState<string | null>(propSelectedHallId || null);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [selectedStallType, setSelectedStallType] = useState<any>(null);
  const [exhibitionStallTypes, setExhibitionStallTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Add state for real-time stall number validation feedback
  const [stallNumberStatus, setStallNumberStatus] = useState<'success' | 'warning' | 'error' | ''>('');
  
  // Add ref to track mounted state and prevent infinite loops
  const isMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => { 
      isMountedRef.current = false; 
    };
  }, []);

  // Fetch exhibition stall types when modal opens
  useEffect(() => {
    if (visible && exhibitionId) {
      fetchExhibitionStallTypes();
    }
    
    // Clear status indicators when modal opens
    if (visible) {
      setStallNumberStatus('');
    }
  }, [visible, exhibitionId]);

  // Populate form when editing a stall (fixed dependency array)
  useEffect(() => {
    if (visible && stallModalMode === 'edit' && editingStall) {
      console.log('=== EDIT MODE DEBUG ===');
      console.log('editingStall ID:', editingStall.id, 'number:', editingStall.number);
      console.log('editingStall.stallType:', editingStall.stallType);
      
      // Use stallType field from database, fallback to type for compatibility
      const stallTypeValue = editingStall.stallType || editingStall.type;
      
      if (form) { // Add safety check
        try {
          form.setFieldsValue({
            number: editingStall.number,
            width: editingStall.widthSqm || Math.round(editingStall.width / (layout?.pixelsPerSqm || 50) * 10) / 10,
            height: editingStall.heightSqm || Math.round(editingStall.height / (layout?.pixelsPerSqm || 50) * 10) / 10,
            type: stallTypeValue, // Map stallType from DB to type field in form
            status: editingStall.status || 'available'
          });
        } catch (error) {
          console.error('Error setting form fields:', error);
        }
      }
      
      // Set selected stall type for rate display if types are loaded
      if (exhibitionStallTypes.length > 0 && stallTypeValue) {
        const stallType = exhibitionStallTypes.find(t => String(t.value) === String(stallTypeValue));
        
        if (stallType) {
          console.log('Found stallType for edit mode:', stallType.label, 'rate:', stallType.rate);
          setSelectedStallType(stallType);
        } else {
          console.warn('Could not find matching stall type for:', stallTypeValue);
          // Try to find a fallback match
          const fallbackStallType = exhibitionStallTypes.find(t => 
            t.label.toLowerCase().includes('standard') || 
            t.label.toLowerCase().includes('open')
          );
          if (fallbackStallType) {
            console.log('Using fallback stall type:', fallbackStallType.label);
            setSelectedStallType(fallbackStallType);
          }
        }
      } else if (exhibitionStallTypes.length === 0) {
        console.log('Exhibition stall types not loaded yet, will retry when loaded');
      }
            
        setSelectedHallId(editingStall.hallId);
      } else if (visible && stallModalMode === 'create') {
        if (form) { // Add safety check
          form.resetFields();
        }
        setSelectedHallId(propSelectedHallId || null);
        setSelectedStallType(null);
        // Clear stall number status indicators
        setStallNumberStatus('');
      }
  }, [visible, stallModalMode, editingStall, propSelectedHallId, exhibitionStallTypes.length, layout?.pixelsPerSqm]); // Use primitive values instead of complex objects

  // Handle stall type selection when editing and types load (fixed to prevent infinite loops)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && 
          visible && 
          stallModalMode === 'edit' && 
          editingStall && 
          exhibitionStallTypes.length > 0 && 
          !selectedStallType &&
          !hasInitializedRef.current) {
        
        const stallTypeValue = editingStall.stallType || editingStall.type;
        console.log('=== TYPE SELECTION RETRY ===');
        console.log('Looking for stallType:', stallTypeValue);
        console.log('Available types:', exhibitionStallTypes.map(t => ({ value: t.value, label: t.label })));
        
        const stallType = exhibitionStallTypes.find(t => String(t.value) === String(stallTypeValue));
        
        if (stallType) {
          console.log('Found stallType on retry:', stallType.label, 'rate:', stallType.rate);
          setSelectedStallType(stallType);
          
          if (form) { // Add safety check
            form.setFieldValue('type', stallType.value);
          }
        } else {
          console.warn('Still could not find matching stall type for:', stallTypeValue);
        }
        
        hasInitializedRef.current = true;
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [visible, stallModalMode, editingStall?.id, exhibitionStallTypes.length]); // Use primitive values

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!visible) {
      hasInitializedRef.current = false;
    }
  }, [visible]);

  // Update selected hall when hall selection changes
  useEffect(() => {
    if (selectedHallId && layout?.space?.halls) {
      const hall = layout.space.halls.find(h => h.id === selectedHallId);
      setSelectedHall(hall || null);
    } else {
      setSelectedHall(null);
    }
  }, [selectedHallId, layout?.space?.halls]);
  useEffect(() => {
    if (selectedHallId && layout?.space?.halls) {
      const hall = layout.space.halls.find(h => h.id === selectedHallId);
      setSelectedHall(hall || null);
    } else {
      setSelectedHall(null);
    }
  }, [selectedHallId, layout?.space?.halls]);

  const fetchExhibitionStallTypes = async () => {
    if (!exhibitionId) {
      // Use default types if no exhibition ID
      setExhibitionStallTypes(STALL_TYPES.map(type => ({
        ...type,
        rate: 100,
        rateType: 'per_sqm'
      })));
      return;
    }
    
    try {
      setLoading(true);
      
      // CRITICAL FIX: Fetch both exhibition data AND stall types from backend
      const [exhibition, stallTypesResponse] = await Promise.all([
        exhibitionService.getById(exhibitionId),
        stallService.getStallTypes({ isActive: true })
      ]);
      
      const availableStallTypes = stallTypesResponse.data || [];
      console.log('Fetched stall types from backend:', availableStallTypes);
      
      if (exhibition.stallRates && exhibition.stallRates.length > 0) {
        // Map exhibition stall rates with full stall type data
        const stallTypesWithRates = exhibition.stallRates.map((stallRate: any) => {
          // Extract stallTypeId (handle both string and object formats)
          const stallTypeId = typeof stallRate.stallTypeId === 'string' 
            ? stallRate.stallTypeId 
            : stallRate.stallTypeId?._id;
            
          if (!stallTypeId) {
            console.warn('Invalid stallTypeId in stallRate:', stallRate);
            return null;
          }
          
          // Find the full stall type data from backend
          const stallTypeData = availableStallTypes.find((st: any) => 
            (st._id || st.id) === stallTypeId
          );
          
          if (!stallTypeData) {
            console.warn('Stall type not found for ID:', stallTypeId);
            return {
              value: stallTypeId,
              label: 'Unknown Type',
              description: 'Stall type not found',
              color: '#ff4d4f',
              rate: stallRate.rate,
              rateType: 'per_sqm'
            };
          }
          
          // Find matching hardcoded type for fallback color
          const hardcodedType = STALL_TYPES.find(t => 
            t.value === stallTypeData.category || 
            t.label.toLowerCase().includes(stallTypeData.name?.toLowerCase())
          );
          
          return {
            value: stallTypeId,
            label: stallTypeData.name,
            description: stallTypeData.description || '',
            color: stallTypeData.color || hardcodedType?.color || '#52c41a',
            rate: stallRate.rate,
            rateType: stallTypeData.rateType || 'per_sqm',
            stallTypeData: stallTypeData
          };
        }).filter(Boolean); // Remove any null entries
        
        console.log('Mapped stall types with rates:', stallTypesWithRates);
        setExhibitionStallTypes(stallTypesWithRates);
      } else {
        // No stall rates configured, use all available stall types with default rates
        const defaultStallTypes = availableStallTypes.map((stallType: any) => ({
          value: stallType._id || stallType.id,
          label: stallType.name,
          description: stallType.description || '',
          color: stallType.color || '#52c41a',
          rate: stallType.defaultRate || 100,
          rateType: stallType.rateType || 'per_sqm',
          stallTypeData: stallType
        }));
        
        console.log('Using all available stall types with default rates:', defaultStallTypes);
        setExhibitionStallTypes(defaultStallTypes);
      }
    } catch (error: any) {
      console.error('Failed to fetch exhibition stall types:', error);
      message.error('Failed to load stall types. Using default types.');
      // Fallback to hardcoded types
      setExhibitionStallTypes(STALL_TYPES.map(type => ({
        ...type,
        rate: 100,
        rateType: 'per_sqm'
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values when submitting:', values);
      
      if (!selectedHall || !layout) {
        message.error('No hall selected!');
        return;
      }
      
      // Convert meter dimensions to pixels for internal storage
      const stallData = {
        ...values,
        widthSqm: values.width,  // Store meter dimensions
        heightSqm: values.height,
        width: values.width * layout.pixelsPerSqm,   // Convert to pixels
        height: values.height * layout.pixelsPerSqm,
        hallId: selectedHallId,
        stallType: values.type, // Map frontend 'type' to backend 'stallType'
        type: values.type, // Keep both for compatibility during transition
        status: values.status || 'available',
        color: getStallTypeColor(values.type),
        price: 0, // Default price to 0 since we removed price input
        description: '', // Default description since we removed description input
        // Include ID and mode for edit operations
        ...(stallModalMode === 'edit' && editingStall && { 
          id: editingStall.id,
          isEdit: true 
        })
      };
      
      console.log('Stall data being submitted:', stallData);
      console.log('stallData.stallType:', stallData.stallType);
      console.log('stallData.type:', stallData.type);
      onSubmit(stallData);
      
      // Only reset form for create mode
      if (stallModalMode === 'create') {
        form.resetFields();
        setSelectedStallType(null);
        // Clear stall number status indicators
        setStallNumberStatus('');
        // Don't reset selectedHallId in create mode as it's managed by parent
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const getStallTypeColor = (type: string) => {
    // First check exhibition stall types
    const exhibitionStallType = exhibitionStallTypes.find(t => t.value === type);
    if (exhibitionStallType) {
      return exhibitionStallType.color;
    }
    
    // Fallback to hardcoded types
    const stallType = STALL_TYPES.find(t => t.value === type);
    return stallType?.color || '#52c41a';
  };

  // Handle stall type selection change
  const handleStallTypeChange = (value: string) => {
    console.log('Stall type changed to:', value);
    const stallType = exhibitionStallTypes.find(t => t.value === value);
    console.log('Found stall type for rate display:', stallType);
    setSelectedStallType(stallType);
  };

  // Calculate maximum stall dimensions based on selected hall
  const getMaxDimensions = () => {
    if (!selectedHall || !layout) {
      return { maxWidth: 10, maxHeight: 10 };
    }
    
    const hallWidthSqm = selectedHall.widthSqm || Math.floor(selectedHall.width / layout.pixelsPerSqm);
    const hallHeightSqm = selectedHall.heightSqm || Math.floor(selectedHall.height / layout.pixelsPerSqm);
    
    // Allow stalls up to 80% of hall dimensions
    return {
      maxWidth: Math.floor(hallWidthSqm * 0.8),
      maxHeight: Math.floor(hallHeightSqm * 0.8)
    };
  };

  // Check if stall number already exists across all halls
  const checkStallNumberExists = (stallNumber: string): boolean => {
    if (!layout?.space?.halls || !stallNumber) return false;
    
    // Get all existing stall numbers across all halls
    const existingStallNumbers = layout.space.halls.flatMap(hall => 
      hall.stalls.map(stall => stall.number?.toString().toLowerCase())
    );
    
    // In edit mode, exclude the current stall being edited
    if (stallModalMode === 'edit' && editingStall) {
      const currentStallNumber = editingStall.number?.toString().toLowerCase();
      const filteredNumbers = existingStallNumbers.filter(num => num !== currentStallNumber);
      return filteredNumbers.includes(stallNumber.toLowerCase());
    }
    
    // In create mode, check against all existing numbers
    return existingStallNumbers.includes(stallNumber.toLowerCase());
  };

  // Custom validator for duplicate stall numbers
  const validateStallNumber = (_: any, value: string) => {
    if (!value) {
      return Promise.resolve(); // Let required validation handle empty values
    }
    
    if (checkStallNumberExists(value)) {
      return Promise.reject(new Error(`Stall number "${value}" already exists! Please choose a different number.`));
    }
    
    return Promise.resolve();
  };

  const { maxWidth, maxHeight } = getMaxDimensions();

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShopOutlined style={{ color: '#52c41a' }} />
          <span>{stallModalMode === 'edit' ? 'Edit Stall' : 'Create Exhibition Stall'}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Card style={{ marginBottom: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <Text type="secondary">
          <strong>Stall Guidelines:</strong> Create individual stalls within halls for exhibitors. 
          Each stall represents a bookable space with specific dimensions and pricing.
        </Text>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          width: 3,
          height: 3,
          status: 'available'
        }}
      >
        {/* Display selected hall info */}
        {selectedHall && (
          <Card size="small" style={{ marginBottom: 16, background: '#f0f8ff', border: '2px solid #1890ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: '#1890ff' }}>
                  {stallModalMode === 'create' ? 'Adding stall to: ' : 'Editing stall in: '}
                  {selectedHall.name}
                </Text>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  Hall Size: {selectedHall.widthSqm || Math.floor(selectedHall.width / (layout?.pixelsPerSqm || 50))}m × {selectedHall.heightSqm || Math.floor(selectedHall.height / (layout?.pixelsPerSqm || 50))}m
                  {selectedHall.stalls && ` • ${selectedHall.stalls.length} existing stalls`}
                </div>
              </div>
              <div style={{
                width: 20,
                height: 20,
                backgroundColor: selectedHall.color,
                border: '1px solid #1890ff',
                borderRadius: 4
              }} />
            </div>
          </Card>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="number"
              label="Stall Number/ID"
              rules={[
                { required: true, message: 'Please enter a stall number' },
                { min: 1, message: 'Stall number must be at least 1 character' },
                { max: 20, message: 'Stall number cannot exceed 20 characters' },
                { validator: validateStallNumber }
              ]}
              hasFeedback
              validateStatus={stallNumberStatus}
            >
              <Input 
                placeholder="e.g., A01, B-12, S001"
                size="large"
                onChange={(e) => {
                  // Trigger real-time validation check
                  const value = e.target.value;
                  
                  if (value && value.length > 0) {
                    if (checkStallNumberExists(value)) {
                      setStallNumberStatus('error');
                    } else {
                      setStallNumberStatus('success');
                    }
                  } else {
                    setStallNumberStatus('');
                  }
                }}
                suffix={
                  stallNumberStatus === 'success' ? (
                    <span style={{ color: '#52c41a', fontSize: 12 }}>✓ Available</span>
                  ) : stallNumberStatus === 'error' ? (
                    <span style={{ color: '#ff4d4f', fontSize: 12 }}>✗ Already exists</span>
                  ) : null
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Stall Type"
              rules={[{ required: true, message: 'Please select stall type' }]}
            >
              <Select 
                placeholder="Choose stall type"
                size="large"
                loading={loading}
                onChange={handleStallTypeChange}
              >
                {exhibitionStallTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        backgroundColor: type.color,
                        borderRadius: 2
                      }} />
                      <span>{type.label}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="width"
              label={`Width (meters)`}
              rules={[
                { required: true, message: 'Please enter stall width' },
                { type: 'number', min: 1, max: maxWidth, message: `Width must be 1-${maxWidth}m` }
              ]}
            >
              <InputNumber 
                min={1} 
                max={maxWidth} 
                step={0.5}
                placeholder="Width"
                style={{ width: '100%' }}
                addonAfter="m"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="height"
              label={`Height (meters)`}
              rules={[
                { required: true, message: 'Please enter stall height' },
                { type: 'number', min: 1, max: maxHeight, message: `Height must be 1-${maxHeight}m` }
              ]}
            >
              <InputNumber 
                min={1} 
                max={maxHeight} 
                step={0.5}
                placeholder="Height"
                style={{ width: '100%' }}
                addonAfter="m"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="status"
              label="Initial Status"
              rules={[{ required: true, message: 'Please select initial status' }]}
            >
              <Select placeholder="Status" size="large">
                {STALL_STATUSES.map(status => (
                  <Option key={status.value} value={status.value}>
                    <Badge color={status.color} text={status.label} />
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>



        {/* Selected Stall Type Rate Information */}
        {selectedStallType && (
          <Card size="small" style={{ marginBottom: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 12,
                height: 12,
                backgroundColor: selectedStallType.color,
                borderRadius: 2
              }} />
              <Text strong style={{ color: '#52c41a' }}>
                {selectedStallType.label} - Rate Information
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Rate per sq.m:</Text>
                <br />
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                  ₹{selectedStallType.rate ? selectedStallType.rate.toLocaleString() : 'Not set'}
                </Text>
              </div>
              {selectedStallType.description && (
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Description:</Text>
                  <br />
                  <Text style={{ fontSize: 12 }}>
                    {selectedStallType.description}
                  </Text>
                </div>
              )}
            </div>
          </Card>
        )}

        <Divider />
        
        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Delete button on the left - only show in edit mode */}
            <div>
              {stallModalMode === 'edit' && onDelete && editingStall && (
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  size="large"
                  onClick={() => onDelete(editingStall.id)}
                >
                  Delete Stall
                </Button>
              )}
            </div>
            
            {/* Action buttons on the right */}
            <Space>
              <Button onClick={onCancel} size="large">
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                style={{ minWidth: 120 }}
                disabled={!selectedHallId}
              >
                {stallModalMode === 'edit' ? 'Update Stall' : 'Create Stall'}
              </Button>
            </Space>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StallModal; 