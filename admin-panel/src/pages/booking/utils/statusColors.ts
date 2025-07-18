export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed': return 'success';
    case 'pending': return 'warning';
    case 'approved': return 'blue';
    case 'cancelled': return 'default';
    case 'rejected': return 'error';
    default: return 'default';
  }
};

export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid': return 'success';
    case 'pending': return 'warning';
    case 'partial': return 'blue';
    case 'refunded': return 'default';
    default: return 'default';
  }
};

export const getSourceColor = (source: string): string => {
  switch (source) {
    case 'admin': return 'purple';
    case 'exhibitor': return 'orange';
    case 'public': return 'green';
    default: return 'blue';
  }
}; 