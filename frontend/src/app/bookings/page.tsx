'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/services/booking.service';
import Link from 'next/link';
import { Calendar, MapPin, Package, Eye, FileText } from 'lucide-react';

// Interface for backend response with populated exhibition
interface BookingWithExhibition {
  _id: string;
  exhibitionId: {
    _id: string;
    name: string;
    venue: string;
    startDate: string;
    endDate: string;
  };
  stallIds: string[];
  calculations?: {
    stalls: Array<{
      stallId: string;
      number: string;
      baseAmount: number;
      area: number;
      ratePerSqm: number;
      dimensions?: any;
      stallType?: {
        _id: string;
        name: string;
      };
      stallTypeName?: string;
    }>;
    totalBaseAmount: number;
    totalAmount: number;
  };
  customerName: string;
  companyName: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'approved' | 'rejected';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partial';
  createdAt: string;
  invoiceNumber?: string;
  notes?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'refunded':
      return 'bg-blue-100 text-blue-800';
    case 'partial':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithExhibition[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle invoice download
  const handleDownloadInvoice = async (booking: any) => {
    if (!booking.invoiceNumber) {
      toast({
        title: "Invoice Not Available",
        description: 'Invoice has not been generated for this booking yet.',
        variant: "destructive"
      });
      return;
    }

    try {
      // Download invoice as PDF
      const blob = await bookingService.downloadInvoice(booking.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${booking.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: 'Invoice downloaded successfully.',
      });
    } catch (error: any) {
      console.error('Invoice download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || 'Failed to download invoice.',
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.isApproved) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await bookingService.getMyBookings();
        setBookings(response.bookings as unknown as BookingWithExhibition[]);
      } catch (error: any) {
        toast({
          title: 'Error fetching bookings',
          description: error.message || 'Failed to fetch your bookings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view your bookings.</p>
        </div>
      </div>
    );
  }

  if (!user?.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h1>
          <p className="text-gray-600">Your account is pending approval. Please wait for admin approval to view your bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage and track all your exhibition stall bookings</p>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start by exploring available exhibitions.</p>
              <Link href="/exhibitions">
                <Button>Browse Exhibitions</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking._id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{booking.exhibitionId.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Booked on {formatDate(booking.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                        {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Stall Numbers */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Stall Numbers</p>
                      <div className="flex flex-wrap gap-1">
                        {booking.calculations?.stalls && booking.calculations.stalls.length > 0 ? (
                          // Use stall numbers from calculations if available
                          booking.calculations.stalls.map((stall) => (
                            <Badge key={stall.stallId} variant="outline">
                              {stall.number}
                            </Badge>
                          ))
                        ) : (
                          // Fallback to stallIds if calculations not available
                          booking.stallIds.map((stallId, index) => (
                            <Badge key={stallId} variant="outline">
                              Stall {index + 1}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">{formatPrice(booking.amount)}</p>
                    </div>

                    {/* Invoice Number */}
                    {booking.invoiceNumber && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Invoice Number</p>
                        <p className="text-sm text-gray-900">{booking.invoiceNumber}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Link href={`/bookings/${booking._id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      {booking.invoiceNumber && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleDownloadInvoice(booking)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 