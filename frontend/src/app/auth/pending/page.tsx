'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/auth.context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Clock, CheckCircle, Mail, Phone, Building, User } from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <Clock className="h-10 w-10 text-white" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900">
              Account Pending Approval
            </CardTitle>
            
            <CardDescription className="text-gray-600">
              Your exhibitor account has been created and is waiting for admin approval
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Account Status */}
            <div className="text-center">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                Pending Approval
              </Badge>
            </div>

            {/* User Info */}
            {user && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Account Details</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Contact Person:</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{user.companyName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    
                    {user.contactNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{user.contactNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                What's Next?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Our admin team will review your application</li>
                <li>• You'll receive an email notification once approved</li>
                <li>• After approval, you can log in and start booking stalls</li>
                <li>• This process usually takes 1-2 business days</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={logout}
              >
                Sign Out
              </Button>
              
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@exhibitbook.com" className="text-blue-600 hover:underline">
                  support@exhibitbook.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 