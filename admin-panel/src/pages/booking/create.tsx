import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Steps,
  Row,
  Col,
  Typography,
  message,
  Space,
  InputNumber,
  Checkbox,
  Divider,
  Tag,
  Alert,
  Tooltip,
  Spin
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  ShopOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { exhibitionService } from '../../services/exhibition.service';
import exhibitorService from '../../services/exhibitor.service';
import bookingService from '../../services/booking.service';
import { layoutService } from '../../services/layout.service';
import { Exhibition, Stall, StallType } from '../../types';
import { ExhibitorProfile } from '../../services/exhibitor.service';
import { calculateStallArea, calculateBaseAmount, formatStallDimensions } from '../../utils/stallUtils';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Types for booking creation
interface BookingFormData {
  exhibitionId: string;
  exhibitorId: string;
  stallIds: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGSTIN?: string;
  customerPAN?: string;
  companyName: string;
  discount?: {
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
  };
  amount: number;
  extraAmenities?: Array<{
    id: string;
    name: string;
    rate: number;
    quantity: number;
  }>;
}

interface StallWithDetails extends Stall {
  stallNumber: string;
  stallTypeName: string;
  dimensions: {
    width: number;
    height: number;
    shapeType?: 'rectangle' | 'l-shape';
  };
  ratePerSqm: number;
  isBooked: boolean;
  stallType: StallType;
  baseAmount: number;
  area: number;
  status: string;
}

const CreateBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [exhibitors, setExhibitors] = useState<ExhibitorProfile[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [selectedExhibitor, setSelectedExhibitor] = useState<ExhibitorProfile | null>(null);
  const [availableStalls, setAvailableStalls] = useState<StallWithDetails[]>([]);
  const [selectedStalls, setSelectedStalls] = useState<string[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | undefined>();
  const [extraAmenities, setExtraAmenities] = useState<Array<{
    id: string;
    name: string;
    rate: number;
    quantity: number;
  }>>([]);

  // Loading states
  const [loadingExhibitions, setLoadingExhibitions] = useState(false);
  const [loadingExhibitors, setLoadingExhibitors] = useState(false);
  const [loadingStalls, setLoadingStalls] = useState(false);

  // Load exhibitions on component mount
  useEffect(() => {
    fetchExhibitions();
    // Don't fetch exhibitors initially - they'll be fetched when exhibition is selected
  }, []);

  // Fetch exhibitions
  const fetchExhibitions = async () => {
    try {
      setLoadingExhibitions(true);
      const response = await exhibitionService.getExhibitions();
      setExhibitions(response.data || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch exhibitions');
    } finally {
      setLoadingExhibitions(false);
    }
  };

  // Fetch exhibitors
  const fetchExhibitors = async () => {
    try {
      setLoadingExhibitors(true);
      const response = await exhibitorService.getExhibitors();
      setExhibitors(response.data || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch exhibitors');
    } finally {
      setLoadingExhibitors(false);
    }
  };

  // Fetch exhibitors for selected exhibition
  const fetchExhibitorsForExhibition = async (exhibitionId: string) => {
    try {
      setLoadingExhibitors(true);
      // Filter exhibitors who are approved and potentially registered for this exhibition
      // For now, we'll show all approved exhibitors
      const response = await exhibitorService.getExhibitors();
      setExhibitors(response.data || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch exhibitors');
    } finally {
      setLoadingExhibitors(false);
    }
  };

  // Fetch stalls for selected exhibition
  const fetchStalls = async (exhibitionId: string) => {
    try {
      setLoadingStalls(true);
      
      // Fetch real stalls data from layout service
      const stallsData = await layoutService.getAvailableStalls(exhibitionId);
      
      // Transform stalls to include calculated details using frontend pattern
      const stallsWithDetails: StallWithDetails[] = stallsData.map((stall: any) => {
        const area = calculateStallArea(stall.dimensions);
        const baseAmount = calculateBaseAmount(stall);
        
        return {
          ...stall,
          area,
          baseAmount
        };
      });

      setAvailableStalls(stallsWithDetails);
      
      if (stallsWithDetails.length === 0) {
        message.info('No available stalls found for this exhibition. Please ensure the exhibition has a layout with available stalls.');
      }
    } catch (error: any) {
      console.error('Error fetching stalls:', error);
      message.error(error.message || 'Failed to fetch stalls');
      setAvailableStalls([]);
    } finally {
      setLoadingStalls(false);
    }
  };

  // Calculate total amounts using frontend pattern
  const calculateTotalAmounts = () => {
    const selectedStallsData = availableStalls.filter(stall => 
      selectedStalls.includes(stall.id)
    );
    
    // Calculate base amount using frontend pattern
    const baseAmount = selectedStallsData.reduce((sum, stall) => {
      const area = calculateStallArea(stall.dimensions);
      const stallBaseAmount = area * stall.ratePerSqm;
      return sum + stallBaseAmount;
      }, 0);

    // Apply discount
    let discountAmount = 0;
    if (selectedDiscountId && selectedDiscountId !== '' && selectedExhibition?.discountConfig) {
      const discount = selectedExhibition.discountConfig.find(d => {
        const compositeKey = `${d.name}-${d.value}-${d.type}`;
        return compositeKey === selectedDiscountId;
      });
      
      if (discount) {
        if (discount.type === 'percentage') {
          discountAmount = (baseAmount * discount.value) / 100;
        } else {
          discountAmount = discount.value;
        }
      }
    }
    
    const amountAfterDiscount = baseAmount - discountAmount;
    
    // Calculate taxes on discounted amount (following frontend pattern)
    const taxes = selectedExhibition?.taxConfig?.filter(tax => tax.isActive) || [];
    const taxCalculations = taxes.map(tax => ({
      name: tax.name,
      rate: tax.rate,
      amount: (amountAfterDiscount * tax.rate) / 100
    }));
    
    const totalTaxAmount = taxCalculations.reduce((sum, tax) => sum + tax.amount, 0);
    const totalAmount = amountAfterDiscount + totalTaxAmount;
    
    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      amountAfterDiscount: Math.round(amountAfterDiscount * 100) / 100,
      taxes: taxCalculations,
      totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  };

  // Handle exhibition selection
  const handleExhibitionChange = async (exhibitionId: string) => {
    const exhibition = exhibitions.find(e => e.id === exhibitionId);
    setSelectedExhibition(exhibition || null);
    
    // Reset dependent selections
    setSelectedExhibitor(null);
    setSelectedStalls([]);
    setAvailableStalls([]);
    form.setFieldsValue({ 
      exhibitorId: undefined,
      stallIds: undefined 
    });
    
    if (exhibition) {
      // Fetch exhibitors for this exhibition
      await fetchExhibitorsForExhibition(exhibitionId);
    } else {
      setExhibitors([]);
    }
  };

  // Handle exhibitor selection
  const handleExhibitorChange = async (exhibitorId: string) => {
    const exhibitor = exhibitors.find(e => e.id === exhibitorId);
    setSelectedExhibitor(exhibitor || null);
    
    // Reset stall selection
    setSelectedStalls([]);
    form.setFieldsValue({ stallIds: undefined });
    
    if (exhibitor && selectedExhibition) {
      // Fetch stalls for the selected exhibition
      await fetchStalls(selectedExhibition.id);
      
             // Auto-populate customer information from selected exhibitor
       form.setFieldsValue({
         companyName: exhibitor.companyName,
         customerName: exhibitor.contactPerson,
         customerEmail: exhibitor.email,
         customerPhone: exhibitor.phone,
         customerAddress: exhibitor.address,
         customerGSTIN: exhibitor.gstNumber,
         customerPAN: exhibitor.panNumber
       });
    } else {
      setAvailableStalls([]);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      
      if (!selectedExhibition || !selectedExhibitor) {
        message.error('Please select exhibition and exhibitor');
        return;
      }
      
      if (selectedStalls.length === 0) {
        message.error('Please select at least one stall');
        return;
      }
      
      const calculations = calculateTotalAmounts();
      
      // Create individual stall calculations for backend
      const selectedStallsData = availableStalls.filter(stall => selectedStalls.includes(stall.id));
      
      // Get selected discount details for reuse
      const selectedDiscountConfig = selectedDiscountId && selectedDiscountId !== '' 
        ? selectedExhibition?.discountConfig?.find(d => {
            const compositeKey = `${d.name}-${d.value}-${d.type}`;
            return compositeKey === selectedDiscountId;
          })
        : null;
      
      const stallCalculations = selectedStallsData.map(stall => {
        const stallArea = calculateStallArea(stall.dimensions);
        const stallBaseAmount = stallArea * stall.ratePerSqm;
        
        // Calculate discount for this stall if any
        let stallDiscountAmount = 0;
        if (calculations.discountAmount > 0) {
          // Proportionally distribute discount across stalls based on base amount
          const discountRatio = calculations.discountAmount / calculations.baseAmount;
          stallDiscountAmount = stallBaseAmount * discountRatio;
        }
        
        const stallCalculation: any = {
          stallId: stall.id,
          number: stall.stallNumber,
          baseAmount: Math.round(stallBaseAmount * 100) / 100,
          amountAfterDiscount: Math.round((stallBaseAmount - stallDiscountAmount) * 100) / 100
        };
        
        // Add discount details if discount is applied
        if (stallDiscountAmount > 0 && selectedDiscountConfig) {
          stallCalculation.discount = {
            name: selectedDiscountConfig.name,
            type: selectedDiscountConfig.type,
            value: selectedDiscountConfig.value,
            amount: Math.round(stallDiscountAmount * 100) / 100
          };
        }
        
        return stallCalculation;
      });

      const bookingData = {
        exhibitionId: selectedExhibition.id,
        exhibitorId: selectedExhibitor.id,
        stallIds: selectedStalls,
        customerName: values.customerName || selectedExhibitor.contactPerson,
        customerEmail: values.customerEmail || selectedExhibitor.email,
        customerPhone: values.customerPhone || selectedExhibitor.phone,
        customerAddress: values.customerAddress || selectedExhibitor.address,
        customerGSTIN: values.customerGSTIN || selectedExhibitor.gstNumber,
        customerPAN: values.customerPAN || selectedExhibitor.panNumber,
        companyName: values.companyName || selectedExhibitor.companyName,
        amount: calculations.totalAmount,
        bookingSource: 'admin',
        calculations: {
          stalls: stallCalculations,
          totalBaseAmount: calculations.baseAmount,
          totalDiscountAmount: calculations.discountAmount,
          totalAmountAfterDiscount: calculations.amountAfterDiscount,
          taxes: calculations.taxes,
          totalTaxAmount: calculations.totalTaxAmount,
          totalAmount: calculations.totalAmount
        }
      };
      
      await bookingService.createBooking(bookingData);
      
      message.success('Booking created successfully!');
      navigate('/bookings');
    } catch (error: any) {
      message.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: 'Exhibition & Stalls',
      icon: <ShopOutlined />,
      description: 'Select exhibition and stalls'
    },
    {
      title: 'Review & Submit',
      icon: <CheckCircleOutlined />,
      description: 'Review booking and submit'
    }
  ];



  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="Exhibition & Stall Selection">
            <Row gutter={[24, 24]}>
              {/* Step 1: Exhibition Selection */}
              <Col span={24}>
                <Form.Item
                  label="Step 1: Select Exhibition"
                  name="exhibitionId"
                  rules={[{ required: true, message: 'Please select an exhibition' }]}
                >
                  <Select
                    placeholder="Choose an exhibition"
                    onChange={handleExhibitionChange}
                    loading={loadingExhibitions}
                    size="large"
                    optionLabelProp="label"
                  >
                    {exhibitions.map(exhibition => (
                      <Option key={exhibition.id} value={exhibition.id} label={exhibition.name}>
                        <div>
                          <div><strong>{exhibition.name}</strong></div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {exhibition.venue} • {new Date(exhibition.startDate).toLocaleDateString()} to {new Date(exhibition.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              {/* Step 2: Exhibitor Selection - Only show if exhibition is selected */}
              {selectedExhibition && (
                <Col span={24}>
                  <Form.Item
                    label="Step 2: Select Exhibitor"
                    name="exhibitorId"
                    rules={[{ required: true, message: 'Please select an exhibitor' }]}
                  >
                    <Select
                      placeholder="Choose an exhibitor"
                      onChange={handleExhibitorChange}
                      loading={loadingExhibitors}
                      size="large"
                      showSearch
                      optionLabelProp="label"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children as any)?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {exhibitors.filter(exhibitor => exhibitor.status === 'approved').map(exhibitor => (
                        <Option key={exhibitor.id} value={exhibitor.id} label={exhibitor.companyName}>
                          <div>
                            <div><strong>{exhibitor.companyName}</strong></div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {exhibitor.contactPerson} • {exhibitor.email}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
              
              {/* Step 3: Stall Selection - Only show if both exhibition and exhibitor are selected */}
              {selectedExhibition && selectedExhibitor && (
                <Col span={24}>
                  <div style={{ marginBottom: '16px' }}>
                    <Title level={4}>Step 3: Select Stalls</Title>
                    <Text type="secondary">Choose one or more stalls for {selectedExhibitor.companyName}</Text>
                  </div>
                  
                  <Form.Item
                    label="Available Stalls"
                    name="stallIds"
                    rules={[{ required: true, message: 'Please select at least one stall' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Search and select stalls"
                      showSearch
                      allowClear
                      loading={loadingStalls}
                      size="large"
                      style={{ width: '100%' }}
                      optionFilterProp="children"
                      filterOption={(input, option) => {
                        if (!option) return false;
                        const children = option.children?.toString().toLowerCase() || '';
                        const value = option.value?.toString().toLowerCase() || '';
                        return children.includes(input.toLowerCase()) || value.includes(input.toLowerCase());
                      }}
                      value={selectedStalls}
                      onChange={(values: string[]) => {
                        setSelectedStalls(values);
                        form.setFieldsValue({ stallIds: values });
                      }}
                    >
                      {availableStalls.filter(stall => !stall.isBooked).map(stall => (
                        <Option key={stall.id} value={stall.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>{stall.stallNumber}</strong> - {stall.stallType?.name || stall.stallTypeName}
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {formatStallDimensions(stall.dimensions)} • {calculateStallArea(stall.dimensions).toFixed(2)} sq m • ₹{stall.ratePerSqm}/sq m
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                              <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                ₹{(calculateStallArea(stall.dimensions) * stall.ratePerSqm).toLocaleString()}
                              </div>
                              <div style={{ fontSize: '10px', color: '#52c41a' }}>
                                Available
                              </div>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  {selectedStalls.length > 0 && (
                    <Alert
                      message={`${selectedStalls.length} stall(s) selected for ${selectedExhibitor.companyName}`}
                      type="success"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  )}

                  {/* Selected Stalls Summary Table - Following Frontend Pattern */}
                  {selectedStalls.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                      <Title level={5}>Selected Stalls Summary</Title>
                      <div style={{ 
                        border: '1px solid #d9d9d9', 
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginTop: '16px'
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #d9d9d9' }}>
                              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Stall Number</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Stall Type</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Dimensions</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Area (sqm)</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Rate/sq.m</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Base Amount</th>
                              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {availableStalls.filter(stall => selectedStalls.includes(stall.id)).map((stall, index) => {
                              const area = calculateStallArea(stall.dimensions);
                              const baseAmount = area * stall.ratePerSqm;
                              const stallTypeName = stall.stallType?.name || stall.stallTypeName || 'Standard Stall';
                              
                              return (
                                <tr key={stall.id} style={{ 
                                  borderBottom: index < selectedStalls.length - 1 ? '1px solid #f0f0f0' : 'none',
                                  backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                                }}>
                                  <td style={{ padding: '12px', fontWeight: 500 }}>{stall.stallNumber}</td>
                                  <td style={{ padding: '12px' }}>{stallTypeName}</td>
                                  <td style={{ padding: '12px' }}>{formatStallDimensions(stall.dimensions)}</td>
                                  <td style={{ padding: '12px' }}>{area.toFixed(2)}</td>
                                  <td style={{ padding: '12px' }}>₹{stall.ratePerSqm.toLocaleString()}</td>
                                  <td style={{ padding: '12px', fontWeight: 600 }}>₹{baseAmount.toLocaleString()}</td>
                                  <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <Button
                                      type="link"
                                      danger
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      onClick={() => {
                                        const newSelectedStalls = selectedStalls.filter(id => id !== stall.id);
                                        setSelectedStalls(newSelectedStalls);
                                        form.setFieldsValue({ stallIds: newSelectedStalls });
                                      }}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr style={{ 
                              borderTop: '2px solid #1890ff', 
                              backgroundColor: '#f6f8fa',
                              fontWeight: 600
                            }}>
                              <td colSpan={5} style={{ padding: '12px', textAlign: 'right' }}>
                                Total Base Amount
                              </td>
                              <td style={{ padding: '12px', color: '#1890ff' }}>
                                ₹{availableStalls
                                  .filter(stall => selectedStalls.includes(stall.id))
                                  .reduce((sum, stall) => {
                                    const area = calculateStallArea(stall.dimensions);
                                    return sum + (area * stall.ratePerSqm);
                                  }, 0)
                                  .toLocaleString()}
                              </td>
                              <td style={{ padding: '12px' }}></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </Col>
              )}
            </Row>
          </Card>
        );

      case 1:
        const calculations = calculateTotalAmounts();
        const selectedStallsData = availableStalls.filter(stall => 
          selectedStalls.includes(stall.id)
        );
        
        return (
          <Card title="Review & Submit">
            {/* Hidden fields for customer information - auto-populated from selected exhibitor */}
            <Form.Item name="customerName" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="customerEmail" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="customerPhone" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="customerAddress" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="customerGSTIN" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="customerPAN" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="companyName" hidden>
              <Input />
            </Form.Item>
            
          <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Exhibition Details">
                  <p><strong>Exhibition:</strong> {selectedExhibition?.name}</p>
                  <p><strong>Venue:</strong> {selectedExhibition?.venue}</p>
                  <p><strong>Duration:</strong> {selectedExhibition && `${new Date(selectedExhibition.startDate).toLocaleDateString()} to ${new Date(selectedExhibition.endDate).toLocaleDateString()}`}</p>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card size="small" title="Exhibitor Details">
                  <p><strong>Company:</strong> {selectedExhibitor?.companyName}</p>
                  <p><strong>Contact:</strong> {selectedExhibitor?.contactPerson}</p>
                  <p><strong>Email:</strong> {selectedExhibitor?.email}</p>
                  <p><strong>Phone:</strong> {selectedExhibitor?.phone}</p>
                  <p><strong>Status:</strong> <Tag color="green">Approved</Tag></p>
                </Card>
              </Col>

              <Col xs={24}>
                <Card size="small" title="Selected Stalls">
                  <div style={{ 
                    background: '#f6f8fa', 
                    padding: '12px', 
                    borderRadius: '8px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {selectedStallsData.map(stall => (
                      <div key={stall.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #e8e8e8'
                      }}>
                  <div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            {stall.stallNumber} - {stall.stallTypeName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {stall.dimensions.width}×{stall.dimensions.height}m • {stall.area.toFixed(1)} sq m • ₹{stall.ratePerSqm}/sq m
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                            ₹{stall.baseAmount.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '10px', color: '#52c41a' }}>
                            Available
                          </div>
                              </div>
                      </div>
                    ))}
                    <div style={{ 
                      marginTop: '12px', 
                      paddingTop: '12px', 
                      borderTop: '2px solid #1890ff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>Total ({selectedStallsData.length} stalls)</strong>
                      </div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: '#1890ff' 
                      }}>
                        ₹{selectedStallsData.reduce((sum, stall) => sum + stall.baseAmount, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
              </Card>
            </Col>

              <Col xs={24}>
                <Card size="small" title="Price Calculation">
                  <Row gutter={[16, 16]}>
                    {/* Discount Selection */}
                    <Col xs={24}>
                      <Form.Item label="Select Discount (Optional)">
                        <Select
                          placeholder="Choose a discount to apply"
                          allowClear
                          value={selectedDiscountId}
                          onChange={(value) => setSelectedDiscountId(value)}
                          style={{ width: '100%' }}
                        >
                          <Option value="">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>No Discount</span>
                              <span style={{ color: '#999', fontSize: '12px' }}>Full Price</span>
                            </div>
                          </Option>
                          {selectedExhibition?.discountConfig?.filter(discount => discount.isActive).map(discount => {
                            const compositeKey = `${discount.name}-${discount.value}-${discount.type}`;
                            return (
                              <Option key={compositeKey} value={compositeKey}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{discount.name}</span>
                                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                                    {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`} OFF
                                  </span>
                                </div>
                              </Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </Col>

                    {/* Calculation Summary */}
                    <Col xs={24}>
                      <div style={{ 
                        background: '#f9f9f9', 
                        padding: '16px', 
                        borderRadius: '8px',
                        border: '1px solid #e8e8e8'
                      }}>
                        <Row gutter={[16, 8]}>
                          <Col span={12}>
                            <Text>Base Amount:</Text>
                          </Col>
                          <Col span={12} style={{ textAlign: 'right' }}>
                            <Text>₹{calculations.baseAmount.toLocaleString()}</Text>
                          </Col>
                          
                          {calculations.discountAmount > 0 && (
                            <>
                              <Col span={12}>
                                <Text>Discount Applied:</Text>
                              </Col>
                              <Col span={12} style={{ textAlign: 'right' }}>
                                <Text type="danger">-₹{calculations.discountAmount.toLocaleString()}</Text>
                              </Col>
                            </>
                          )}
                          
                          <Col span={12}>
                            <Text>Amount after discount:</Text>
                          </Col>
                          <Col span={12} style={{ textAlign: 'right' }}>
                            <Text>₹{calculations.amountAfterDiscount.toLocaleString()}</Text>
                          </Col>
                              
                          {calculations.taxes.map(tax => (
                            <React.Fragment key={tax.name}>
                              <Col span={12}>
                                <Text>{tax.name} ({tax.rate}%):</Text>
                              </Col>
                              <Col span={12} style={{ textAlign: 'right' }}>
                                <Text>₹{tax.amount.toLocaleString()}</Text>
                              </Col>
                            </React.Fragment>
                          ))}
                              
                          <Divider style={{ margin: '12px 0' }} />
                              
                          <Col span={12}>
                            <Text strong style={{ fontSize: '16px' }}>Total Amount:</Text>
                          </Col>
                          <Col span={12} style={{ textAlign: 'right' }}>
                            <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                              ₹{calculations.totalAmount.toLocaleString()}
                            </Text>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
                </Row>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ background: 'white', padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/bookings')}>
          Back to Bookings
        </Button>
            <Title level={2} style={{ margin: 0 }}>Create New Booking</Title>
          </Space>
      </div>

      {/* Steps */}
      <Steps current={currentStep} style={{ marginBottom: '32px' }}>
        {steps.map((step, index) => (
          <Steps.Step
            key={index}
            title={step.title}
            description={step.description}
            icon={step.icon}
          />
        ))}
      </Steps>

      {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
        {renderStepContent()}

      {/* Navigation */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Space>
          {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button 
              type="primary" 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    currentStep === 0 && (selectedStalls.length === 0 || !selectedExhibition || !selectedExhibitor)
                  }
            >
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button 
              type="primary" 
                  htmlType="submit"
                  loading={submitting}
                  disabled={selectedStalls.length === 0 || !selectedExhibition || !selectedExhibitor}
            >
              Create Booking
            </Button>
          )}
        </Space>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CreateBookingPage; 