'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExhibitionService } from '@/services/exhibition.service';
import { Exhibition, ExhibitionWithLayout } from '@/types/exhibition';
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
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ShareIcon,
  StarIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  BuildingIcon,
  MailIcon,
  PhoneIcon,

  TrendingUpIcon,
  HeartIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { getExhibitionUrl } from '../../../utils/format'; // Added for slug-based URLs

export default function ExhibitionDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <ExhibitionDetail />
      </main>
      <Footer />
    </div>
  );
}

function ExhibitionDetail() {
  const { id } = useParams();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadExhibitionData();
  }, [id]);

  const loadExhibitionData = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load exhibition details using slug-aware method
      const exhibitionData = await ExhibitionService.getExhibition(id);
      
      setExhibition(exhibitionData);
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

  const handleShare = async () => {
    if (navigator.share && exhibition) {
      try {
        await navigator.share({
          title: exhibition.name,
          text: `Check out this exhibition: ${exhibition.name} at ${exhibition.venue}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied!",
          description: "Exhibition link has been copied to clipboard",
        });
      }
    } else if (exhibition) {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Exhibition link has been copied to clipboard",
      });
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Exhibition removed from your favorites" : "Exhibition saved to your favorites",
    });
  };

  if (loading) {
    return <ExhibitionDetailSkeleton />;
  }

  if (error || !exhibition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center py-12 px-6">
          <div className="text-red-400 mb-6">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Exhibition not found</h3>
          <p className="text-gray-300 mb-6 max-w-md">
            {error || 'The exhibition you are looking for does not exist or has been removed.'}
          </p>
          <Link href={"/exhibitions" as any}>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              Back to Exhibitions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getTimingBadge = () => {
    if (isOngoing(exhibition.startDate, exhibition.endDate)) {
      return <Badge className="bg-green-500 text-white border-0 shadow-lg">🟢 Live Now</Badge>;
    } else if (isUpcoming(exhibition.startDate)) {
      return <Badge className="bg-blue-500 text-white border-0 shadow-lg">🔵 Upcoming</Badge>;
    } else {
      return <Badge className="bg-gray-500 text-white border-0 shadow-lg">⚫ Past Event</Badge>;
    }
  };

  const canBook = exhibition.status === 'published' && exhibition.isActive && !isExpired(exhibition.endDate);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-gray-500 flex items-center">
            <Link href={"/exhibitions" as any} className="hover:text-blue-600 transition-colors">
              Exhibitions
            </Link>
            <ArrowRightIcon className="mx-2 h-3 w-3" />
            <span className="text-gray-900 font-medium">{exhibition.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                {getTimingBadge()}
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                  <StarIcon className="h-3 w-3 mr-1" />
                  Featured Exhibition
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                {exhibition.name}
              </h1>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-blue-100">
                  <MapPinIcon className="h-5 w-5 text-blue-300" />
                  <span className="text-lg">{exhibition.venue}</span>
                </div>
                
                <div className="flex items-center gap-3 text-blue-100">
                  <CalendarIcon className="h-5 w-5 text-blue-300" />
                  <span className="text-lg">{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-blue-100">
                  <ClockIcon className="h-5 w-5 text-blue-300" />
                  <span className="text-lg">Registration deadline: {formatDate(exhibition.registrationDeadline)}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {canBook ? (
                  <Link href={`${getExhibitionUrl(exhibition)}/layout` as any}>
                    <Button 
                      size="lg" 
                      className="px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <BuildingIcon className="mr-2 h-5 w-5" />
                      View Layout & Book Stalls
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="lg" 
                    disabled 
                    className="px-8 py-4 font-semibold text-lg"
                  >
                    {!(exhibition.status === 'published' && exhibition.isActive) ? 'Exhibition Closed' : 'Booking Closed'}
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-700 bg-transparent"
                    onClick={handleLike}
                  >
                    <HeartIcon className={`h-5 w-5 ${isLiked ? 'fill-current text-red-400' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-700 bg-transparent"
                    onClick={handleShare}
                  >
                    <ShareIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 text-blue-100">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-sm">Verified Organizer</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-sm">Secure Booking</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-sm">Instant Confirmation</span>
                </div>
              </div>
            </div>
            
            {/* Right Column - Visual */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="bg-gradient-to-br from-white to-gray-100 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                      <div className="text-xs text-gray-500">Exhibition Layout</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-8 rounded ${
                            i % 3 === 0 ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                            i % 3 === 1 ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
                            'bg-gradient-to-br from-green-100 to-green-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  About This Exhibition
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-700 leading-relaxed text-lg">{exhibition.description}</p>
              </CardContent>
            </Card>


          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <UsersIcon className="h-5 w-5 mr-2" />
                  Organizer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="font-bold text-gray-900 text-lg">{exhibition.companyName || exhibition.organizerName || 'Exhibition Organizer'}</div>
                </div>
                {(exhibition.companyEmail || exhibition.organizerEmail) && (
                  <div className="flex items-center text-gray-600">
                    <MailIcon className="h-4 w-4 mr-3 text-blue-500" />
                    <span>{exhibition.companyEmail || exhibition.organizerEmail}</span>
                  </div>
                )}
                {(exhibition.companyContactNo || exhibition.organizerPhone) && (
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-3 text-blue-500" />
                    <span>{exhibition.companyContactNo || exhibition.organizerPhone}</span>
                  </div>
                )}
                {exhibition.companyWebsite && (
                  <div className="flex items-center text-gray-600">
                    <ExternalLinkIcon className="h-4 w-4 mr-3 text-blue-500" />
                    <a 
                      href={exhibition.companyWebsite.startsWith('http') ? exhibition.companyWebsite : `https://${exhibition.companyWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Company Website
                    </a>
                  </div>
                )}
                {exhibition.companyAddress && (
                  <div className="flex items-start text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{exhibition.companyAddress}</span>
                  </div>
                )}
                {(exhibition.companyEmail || exhibition.organizerEmail) && (
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => window.open(`mailto:${exhibition.companyEmail || exhibition.organizerEmail}`, '_blank')}
                  >
                    <MailIcon className="mr-2 h-4 w-4" />
                    Contact Organizer
                    <ExternalLinkIcon className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <TrendingUpIcon className="h-5 w-5 mr-2" />
                  Exhibition Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Exhibitors</span>
                  <span className="font-bold text-xl text-gray-900">{exhibition.maxExhibitors || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Registered</span>
                  <span className="font-bold text-xl text-blue-600">{exhibition.currentExhibitors || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Available</span>
                  <span className="font-bold text-xl text-green-600">
                    {(typeof exhibition.maxExhibitors === 'number' && typeof exhibition.currentExhibitors === 'number') 
                      ? exhibition.maxExhibitors - exhibition.currentExhibitors 
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Booking Status</span>
                  <Badge className={`${exhibition.status === 'published' && exhibition.isActive ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                    {exhibition.status === 'published' && exhibition.isActive ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              </CardContent>
            </Card>



            {/* Social Proof */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">
                  "Excellent exhibition with great organization and facilities!"
                </p>
                <div className="text-sm text-gray-600">
                  - Previous Exhibitor Review
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExhibitionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      <Footer />
    </div>
  );
} 