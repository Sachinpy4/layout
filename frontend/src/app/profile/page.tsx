'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Building2, Mail, Phone, MapPin, Calendar, Save, Edit, Globe, CreditCard } from 'lucide-react';
import { ExhibitorService, UpdateProfileData } from '@/services/exhibitor.service';

export default function ProfilePage() {
  const { user, isAuthenticated, setUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    companyName: user?.companyName || '',
    email: user?.email || '',
    contactNumber: user?.contactNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pinCode: user?.pinCode || '',
    website: user?.website || '',
    panNumber: user?.panNumber || '',
    gstNumber: user?.gstNumber || '',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        companyName: user.companyName || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pinCode: user.pinCode || '',
        website: user.website || '',
        panNumber: user.panNumber || '',
        gstNumber: user.gstNumber || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    // Format validations
    if (formData.pinCode && !/^[0-9]{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'PIN code must be 6 digits';
    }
    if (formData.website && formData.website.trim() && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = 'PAN number format: ABCDE1234F';
    }
    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber.toUpperCase())) {
      newErrors.gstNumber = 'Invalid GST number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateProfileData = {
        contactPerson: formData.name,
        companyName: formData.companyName,
        phone: formData.contactNumber,
        address: formData.address,
        city: formData.city || undefined,
        state: formData.state || undefined,
        pinCode: formData.pinCode || undefined,
        website: formData.website || undefined,
        panNumber: formData.panNumber.toUpperCase() || undefined,
        gstNumber: formData.gstNumber.toUpperCase() || undefined,
      };

      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateProfileData] === '') {
          delete updateData[key as keyof UpdateProfileData];
        }
      });

      const updatedUser = await ExhibitorService.updateProfile(updateData);
      
      // Update user in auth context
      if (setUser) {
        setUser(updatedUser);
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      companyName: user?.companyName || '',
      email: user?.email || '',
      contactNumber: user?.contactNumber || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pinCode: user?.pinCode || '',
      website: user?.website || '',
      panNumber: user?.panNumber || '',
      gstNumber: user?.gstNumber || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const getStatusBadge = () => {
    if (!user?.isApproved) {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <CardDescription>{user?.companyName}</CardDescription>
                <div className="mt-3">
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {user?.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {user?.contactNumber || 'Not provided'}
                  </div>
                  {user?.website && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline text-sm">
                        Website
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    Exhibitor Account
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Member since {new Date(user?.createdAt || '').toLocaleDateString('en-IN', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Update your personal and company details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={handleCancel} disabled={loading}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={true} // Email should not be editable
                        placeholder="Enter your email"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your contact number"
                      />
                      {errors.contactNumber && <p className="text-xs text-red-500 mt-1">{errors.contactNumber}</p>}
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your company name"
                      />
                      {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
                                          </div>
                      <div>
                        <Label htmlFor="address">Company Address</Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter your company address"
                          rows={3}
                        />
                      </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your city"
                      />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your state"
                      />
                      {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <Label htmlFor="pinCode">PIN Code</Label>
                      <Input
                        id="pinCode"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your PIN code"
                      />
                      {errors.pinCode && <p className="text-xs text-red-500 mt-1">{errors.pinCode}</p>}
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Business Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your website URL"
                      />
                      {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website}</p>}
                    </div>
                  </div>
                </div>

                {/* Tax Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Tax Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input
                        id="panNumber"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your PAN number (e.g., ABCDE1234F)"
                        style={{ textTransform: 'uppercase' }}
                      />
                      {errors.panNumber && <p className="text-xs text-red-500 mt-1">{errors.panNumber}</p>}
                      <p className="text-xs text-gray-500 mt-1">Format: ABCDE1234F</p>
                    </div>
                    <div>
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your GST number"
                        style={{ textTransform: 'uppercase' }}
                      />
                      {errors.gstNumber && <p className="text-xs text-red-500 mt-1">{errors.gstNumber}</p>}
                      <p className="text-xs text-gray-500 mt-1">15-digit GST number</p>
                    </div>
                  </div>
                </div>

                {/* Account Status Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Status</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">
                        Your account status: {getStatusBadge()}
                      </div>
                      {!user?.isApproved && (
                        <p className="text-xs text-gray-500 mt-1">
                          Your account is pending admin approval. You'll be notified once approved.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 