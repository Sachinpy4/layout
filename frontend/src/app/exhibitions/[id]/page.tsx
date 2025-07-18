'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExhibitionService } from '@/services/exhibition.service';
import { Exhibition, ExhibitionWithLayout, StallType } from '@/types/exhibition';
import { useToast } from '@/hooks/use-toast';
import { 
  formatDate, 
  formatDateRange, 
  getExhibitionStatusColor, 
  getExhibitionStatusText, 
  formatPrice,
  isUpcoming,
  isOngoing,
  isExpired
} from '@/lib/utils';

export default function ExhibitionDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ExhibitionDetail />
      </main>
    </div>
  );
}

function ExhibitionDetail() {
  const { id } = useParams();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [stallTypes, setStallTypes] = useState<StallType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadExhibitionData();
  }, [id]);

  const loadExhibitionData = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load exhibition details and stall types in parallel
      const [exhibitionData, stallTypesData] = await Promise.all([
        ExhibitionService.getExhibitionById(id),
        ExhibitionService.getStallTypes(id)
      ]);
      
      setExhibition(exhibitionData);
      setStallTypes(stallTypesData);
    } catch (error: any) {
      setError(error.message || 'Failed to load exhibition details');
      toast({
        title: "Error",
        description: error.message || "Failed to load exhibition details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ExhibitionDetailSkeleton />;
  }

  if (error || !exhibition) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Exhibition not found</h3>
        <p className="text-gray-600 mb-4">
          {error || 'The exhibition you are looking for does not exist or has been removed.'}
        </p>
        <Link href={"/exhibitions" as any}>
          <Button>Back to Exhibitions</Button>
        </Link>
      </div>
    );
  }

  const getTimingBadge = () => {
    if (isOngoing(exhibition.startDate, exhibition.endDate)) {
      return <Badge className="bg-green-100 text-green-800">Ongoing</Badge>;
    } else if (isUpcoming(exhibition.startDate)) {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Past</Badge>;
    }
  };

  const canBook = exhibition.status === 'published' && exhibition.isActive && !isExpired(exhibition.endDate);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href={"/exhibitions" as any} className="hover:text-gray-700">Exhibitions</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{exhibition.name}</span>
      </nav>

      {/* Exhibition Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{exhibition.name}</h1>
              <div className="flex flex-col gap-1">
                <Badge className={getExhibitionStatusColor(exhibition.status, exhibition.isActive)}>
                  {getExhibitionStatusText(exhibition.status, exhibition.isActive)}
                </Badge>
                {getTimingBadge()}
              </div>
            </div>
            
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{exhibition.venue}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Registration deadline: {formatDate(exhibition.registrationDeadline)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center lg:text-right">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {getTimingBadge()}
            </div>
            <div className="text-sm text-gray-600 mb-4">Exhibition Status</div>
            
            {canBook ? (
              <Link href={`/exhibitions/${exhibition._id}/layout` as any}>
                <Button size="lg" className="w-full lg:w-auto">
                  View Layout & Book Stalls
                </Button>
              </Link>
            ) : (
              <Button size="lg" disabled className="w-full lg:w-auto">
                {!(exhibition.status === 'published' && exhibition.isActive) ? 'Exhibition Closed' : 'Booking Closed'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Exhibition Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Exhibition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{exhibition.description}</p>
            </CardContent>
          </Card>

          {/* Stall Types */}
          {stallTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Stall Types</CardTitle>
                <CardDescription>
                  Different stall configurations available for booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stallTypes.map((stallType) => (
                    <div key={stallType._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{stallType.name}</h4>
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: stallType.color }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{stallType.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {/* Handle both backend data structures */}
                          {stallType.dimensions?.width || stallType.defaultSize?.width || 'N/A'} × {stallType.dimensions?.height || stallType.defaultSize?.height || 'N/A'} ft
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(stallType.basePrice || stallType.defaultRate || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organizer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium text-gray-900">{exhibition.organizerName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="text-sm">{exhibition.organizerEmail}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="text-sm">{exhibition.organizerPhone}</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Exhibition Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Exhibitors</span>
                <span className="font-medium">{exhibition.maxExhibitors || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Registered</span>
                <span className="font-medium">{exhibition.currentExhibitors || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-green-600">
                  {(typeof exhibition.maxExhibitors === 'number' && typeof exhibition.currentExhibitors === 'number') 
                    ? exhibition.maxExhibitors - exhibition.currentExhibitors 
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Status</span>
                <span className={`font-medium ${exhibition.status === 'published' && exhibition.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {exhibition.status === 'published' && exhibition.isActive ? 'Open' : 'Closed'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Exhibition Starts</div>
                <div className="font-medium">{formatDate(exhibition.startDate)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Exhibition Ends</div>
                <div className="font-medium">{formatDate(exhibition.endDate)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Registration Deadline</div>
                <div className="font-medium">{formatDate(exhibition.registrationDeadline)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ExhibitionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-64" />
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton className="h-8 w-96 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-52" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 