import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startFormatted = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  const endFormatted = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${startFormatted} - ${endFormatted}`;
}

export function isUpcoming(dateString: string): boolean {
  return new Date(dateString) > new Date();
}

export function isOngoing(startDate: string, endDate: string): boolean {
  const now = new Date();
  return new Date(startDate) <= now && new Date(endDate) >= now;
}

export function isExpired(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

// Exhibition status utilities
export function getExhibitionStatusColor(status: string, isActive?: boolean): string {
  // Map backend status to display status
  const displayStatus = getDisplayStatus(status, isActive);
  
  switch (displayStatus) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getExhibitionStatusText(status: string, isActive?: boolean): string {
  // Map backend status to display status
  const displayStatus = getDisplayStatus(status, isActive);
  
  switch (displayStatus) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'completed':
      return 'Completed';
    case 'draft':
      return 'Draft';
    default:
      return 'Unknown';
  }
}

// Helper function to map backend status to frontend display status
export function getDisplayStatus(status: string, isActive?: boolean): string {
  if (status === 'published' && isActive) {
    return 'active';
  } else if (status === 'published' && !isActive) {
    return 'inactive';
  } else if (status === 'completed') {
    return 'completed';
  } else if (status === 'draft') {
    return 'draft';
  } else {
    return status;
  }
}

// Price formatting
export function formatPrice(amount: number): string {
  // Handle edge cases
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return '₹0';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
} 