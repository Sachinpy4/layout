'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ExhibitionService } from '@/services/exhibition.service';
import { Exhibition, ExhibitionListParams } from '@/types/exhibition';
import { useToast } from '@/hooks/use-toast';
import { 
  formatDateRange, 
  getExhibitionStatusColor, 
  getExhibitionStatusText, 
  truncateText,
  isUpcoming,
  isOngoing,
  isExpired
} from '@/lib/utils';

export default function ExhibitionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ExhibitionsList />
      </main>
    </div>
  );
}

function ExhibitionsList() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Load exhibitions
  const loadExhibitions = async () => {
    try {
      setLoading(true);
      
      // Map frontend status filter to backend query
      let backendStatusFilter: any = {};
      if (statusFilter === 'active') {
        backendStatusFilter = { status: 'published', isActive: true };
      } else if (statusFilter === 'inactive') {
        backendStatusFilter = { status: 'published', isActive: false };
      } else if (statusFilter === 'completed') {
        backendStatusFilter = { status: 'completed' };
      } else if (statusFilter === 'draft') {
        backendStatusFilter = { status: 'draft' };
      }
      // For 'all' - no status filter
      
      const params: ExhibitionListParams = {
        page,
        limit: 12,
        search: searchQuery || undefined,
        sortBy,
        sortOrder: 'asc',
        ...backendStatusFilter
      };

      const response = await ExhibitionService.getExhibitions(params);
      
      // Ensure we always have valid data
      setExhibitions(response.exhibitions || []);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('❌ Failed to load exhibitions:', error);
      
      // Reset to safe defaults on error
      setExhibitions([]);
      setTotalPages(1);
      setTotal(0);
      
      toast({
        title: "Error",
        description: error.message || "Failed to load exhibitions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load exhibitions on mount and when filters change
  useEffect(() => {
    loadExhibitions();
  }, [page, searchQuery, statusFilter, sortBy]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadExhibitions();
  };

  // Handle filter changes
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exhibitions</h1>
        <p className="text-gray-600 mt-2">
          Browse and book stalls at upcoming exhibitions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            type="text"
            placeholder="Search exhibitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Published & Active</SelectItem>
              <SelectItem value="inactive">Published & Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startDate">Start Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="venue">Venue</SelectItem>
              <SelectItem value="createdAt">Recently Added</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="text-sm text-gray-600">
          Showing {exhibitions?.length || 0} of {total} exhibitions
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Exhibition Cards */}
      {!loading && exhibitions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exhibitions.map((exhibition) => (
            <ExhibitionCard key={exhibition._id} exhibition={exhibition} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && exhibitions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exhibitions found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or check back later for new exhibitions.
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function ExhibitionCard({ exhibition }: { exhibition: Exhibition }) {
  const getTimingBadge = () => {
    if (isOngoing(exhibition.startDate, exhibition.endDate)) {
      return <Badge className="bg-green-100 text-green-800">Ongoing</Badge>;
    } else if (isUpcoming(exhibition.startDate)) {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Past</Badge>;
    }
  };

  // Check if exhibition is effectively active (published + isActive)
  const isEffectivelyActive = exhibition.status === 'published' && exhibition.isActive;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {exhibition.name}
          </CardTitle>
          <div className="flex flex-col gap-1">
            <Badge className={getExhibitionStatusColor(exhibition.status, exhibition.isActive)}>
              {getExhibitionStatusText(exhibition.status, exhibition.isActive)}
            </Badge>
            {getTimingBadge()}
          </div>
        </div>
        <CardDescription className="text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {exhibition.venue}
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3">
            {truncateText(exhibition.description, 120)}
          </p>

          {/* Date Range */}
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateRange(exhibition.startDate, exhibition.endDate)}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {isEffectivelyActive && !isExpired(exhibition.endDate) ? (
              <Link href={`/exhibitions/${exhibition._id}` as any}>
                <Button className="w-full">
                  View Stalls
                </Button>
              </Link>
            ) : (
              <Button disabled className="w-full">
                {!isEffectivelyActive ? 'Not Available' : 'Booking Closed'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 