export type ServiceType = 
  | 'flight' 
  | 'passport' 
  | 'hajj_umrah' 
  | 'visas' 
  | 'buses' 
  | 'hotels';

export interface ServiceItem {
  id: ServiceType;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  features: string[];
}

export type OrderStatus = 'pending' | 'documents_review' | 'processing' | 'issued' | 'ready' | 'completed' | 'cancelled';

export interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  previewUrl?: string;
  uploadedAt: string;
}

export interface BookingRequest {
  orderId: string;
  serviceType: ServiceType;
  serviceTitle: string;
  customerName: string;
  phone: string;
  email?: string;
  destination: string;
  travelDate: string;
  returnDate?: string;
  passengers: number;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  documents: UploadedDocument[];
  paymentMethod: 'e_wallet' | 'card' | 'bank_transfer' | 'office_cash';
  paymentStatus: 'pending' | 'paid' | 'deposit_paid';
  totalAmount: number;
  qrCodeUrl?: string;
  loyaltyPointsEarned: number;
}

export interface AppointmentSlot {
  id: string;
  customerName: string;
  phone: string;
  serviceType: ServiceType;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface DestinationOffer {
  id: string;
  title: string;
  country: string;
  city: string;
  price: number;
  originalPrice: number;
  discountBadge?: string;
  image: string;
  duration: string;
  highlights: string[];
  rating: number;
  featured?: boolean;
  category: 'flight' | 'package' | 'hajj_umrah' | 'visa';
}

export interface LoyaltyProfile {
  phone: string;
  customerName: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  completedBookingsCount: number;
  rewards: {
    id: string;
    title: string;
    pointsRequired: number;
    discountAmount: number;
    unlocked: boolean;
  }[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'order' | 'offer' | 'loyalty' | 'system';
  linkTarget?: string;
}

