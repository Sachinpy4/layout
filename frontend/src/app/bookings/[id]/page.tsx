'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  Download, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  Building2,
  CreditCard
} from 'lucide-react';
import { Booking } from '@/types/booking';
import { bookingService } from '@/services/booking.service';
import { formatCurrency, formatDate } from '@/utils/format';
import { toast } from '@/hooks/use-toast';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = params.id as string;

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getBooking(bookingId);
        setBooking(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'refunded':
        return 'outline';
      case 'partial':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleDownloadInvoice = () => {
    // TODO: Implement invoice download
    toast({
      title: 'Coming Soon',
      description: 'Invoice download will be available soon.',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Booking not found'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push('/dashboard')} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Booking Confirmation</h1>
              <p className="text-muted-foreground">
                Booking ID: {booking.invoiceNumber || booking.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(booking.status)}
              <Badge variant={getStatusColor(booking.status) as any}>
                {bookingService.formatBookingStatus(booking.status).label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {booking.status === 'pending' && 
              'Your booking has been submitted and is pending admin approval. You will receive an email notification once approved.'
            }
            {booking.status === 'approved' && 
              'Your booking has been approved! Payment instructions will be provided via email.'
            }
            {booking.status === 'confirmed' && 
              'Your booking is confirmed. Thank you for choosing our exhibition!'
            }
            {booking.status === 'rejected' && 
              `Your booking was rejected. Reason: ${booking.rejectionReason || 'Not specified'}`
            }
            {booking.status === 'cancelled' && 
              `This booking has been cancelled. Reason: ${booking.cancellationReason || 'Not specified'}`
            }
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{booking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{booking.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{booking.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{booking.customerPhone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{booking.customerAddress}</p>
                </div>
                {(booking.customerGSTIN || booking.customerPAN) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {booking.customerGSTIN && (
                      <div>
                        <p className="text-sm text-muted-foreground">GSTIN</p>
                        <p className="font-medium">{booking.customerGSTIN}</p>
                      </div>
                    )}
                    {booking.customerPAN && (
                      <div>
                        <p className="text-sm text-muted-foreground">PAN</p>
                        <p className="font-medium">{booking.customerPAN}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stall Details */}
            <Card>
              <CardHeader>
                <CardTitle>Booked Stalls ({booking.stallIds.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.calculations.stalls.map((stall, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Stall {stall.number}</p>
                        <p className="text-sm text-muted-foreground">
                          Base Amount: {formatCurrency(stall.baseAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(stall.amountAfterDiscount)}</p>
                        {stall.discount && (
                          <p className="text-sm text-green-600">
                            Discount: -{formatCurrency(stall.discount.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(booking.notes || booking.specialRequirements) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="font-medium">{booking.notes}</p>
                    </div>
                  )}
                  {booking.specialRequirements && (
                    <div>
                      <p className="text-sm text-muted-foreground">Special Requirements</p>
                      <p className="font-medium">{booking.specialRequirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(booking.calculations.totalBaseAmount)}</span>
                  </div>
                  {booking.calculations.totalDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(booking.calculations.totalDiscountAmount)}</span>
                    </div>
                  )}
                  {booking.calculations.taxes.map((tax, index) => (
                    <div key={index} className="flex justify-between text-muted-foreground">
                      <span>{tax.name} ({tax.rate}%):</span>
                      <span>{formatCurrency(tax.amount)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(booking.calculations.totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Payment Status:</span>
                    <Badge variant={getPaymentStatusColor(booking.paymentStatus) as any}>
                      {bookingService.formatPaymentStatus(booking.paymentStatus).label}
                    </Badge>
                  </div>
                  {booking.paymentDetails && (
                    <div className="text-sm text-muted-foreground">
                      <p>Method: {booking.paymentDetails.method}</p>
                      {booking.paymentDetails.transactionId && (
                        <p>Transaction ID: {booking.paymentDetails.transactionId}</p>
                      )}
                      <p>Paid: {formatDate(booking.paymentDetails.paidAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDownloadInvoice}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`mailto:${booking.customerEmail}`)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </CardContent>
            </Card>

            {/* Booking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDate(booking.createdAt)}</span>
                  </div>
                  {booking.approvedAt && (
                    <div className="flex items-center gap-2 text-green-600 mt-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approved: {formatDate(booking.approvedAt)}</span>
                    </div>
                  )}
                  {booking.cancelledAt && (
                    <div className="flex items-center gap-2 text-red-600 mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Cancelled: {formatDate(booking.cancelledAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 