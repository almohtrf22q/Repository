import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { OffersSection } from './components/OffersSection';
import { LocationMapSection } from './components/LocationMapSection';
import { ContactBanner } from './components/ContactBanner';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { BookingModal } from './components/BookingModal';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AppointmentModal } from './components/AppointmentModal';
import { LoyaltyModal } from './components/LoyaltyModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { DESTINATION_OFFERS } from './data/offers';
import { ServiceItem, ServiceType, BookingRequest, DestinationOffer, AppNotification } from './types';

const INITIAL_BOOKINGS: BookingRequest[] = [
  {
    orderId: 'MHT-9842',
    serviceType: 'passport',
    serviceTitle: 'تجديد واستخراج جواز سفر مستعجل',
    customerName: 'عبدالله محمد الأقروضي',
    phone: '771234567',
    email: 'abdullah@example.com',
    destination: 'مصلحة الجوازات - تعز',
    travelDate: '2026-08-01',
    passengers: 1,
    paymentMethod: 'e_wallet',
    paymentStatus: 'deposit_paid',
    notes: 'يرجى الإسراع لاستلام التذكرة قبل تاريخ السفر',
    documents: [
      { id: 'd1', name: 'جواز_السفر_القديم.pdf', size: '1.8 MB', type: 'application/pdf', uploadedAt: '2026-07-25' },
      { id: 'd2', name: 'البطاقة_المنشأة_الشخصية.jpg', size: '940 KB', type: 'image/jpeg', uploadedAt: '2026-07-25' }
    ],
    createdAt: '2026-07-25',
    updatedAt: '2026-07-25',
    status: 'documents_review',
    loyaltyPointsEarned: 25,
    totalAmount: 180
  },
  {
    orderId: 'MHT-7710',
    serviceType: 'flight',
    serviceTitle: 'حجز طيران - عدن إلى دبي',
    customerName: 'سارة أحمد الكدمي',
    phone: '730112233',
    destination: 'دبي - الإمارات العربية المتحدة',
    travelDate: '2026-08-10',
    passengers: 2,
    paymentMethod: 'office_cash',
    paymentStatus: 'paid',
    notes: 'طلب مقعد بجانب النافذة',
    documents: [
      { id: 'd3', name: 'صور_الجوازات.pdf', size: '2.4 MB', type: 'application/pdf', uploadedAt: '2026-07-24' }
    ],
    createdAt: '2026-07-24',
    updatedAt: '2026-07-24',
    status: 'processing',
    loyaltyPointsEarned: 50,
    totalAmount: 900
  }
];

export default function App() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  
  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingServiceType, setBookingServiceType] = useState<ServiceType>('flight');
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [trackOrderModalOpen, setTrackOrderModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [loyaltyModalOpen, setLoyaltyModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Dynamic Offers state with LocalStorage persistence
  const [offers, setOffers] = useState<DestinationOffer[]>(() => {
    try {
      const saved = localStorage.getItem('almuhtarif_offers');
      return saved ? JSON.parse(saved) : DESTINATION_OFFERS;
    } catch {
      return DESTINATION_OFFERS;
    }
  });

  // User Bookings state with LocalStorage persistence
  const [userBookings, setUserBookings] = useState<BookingRequest[]>(() => {
    try {
      const saved = localStorage.getItem('almuhtarif_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  // Save Bookings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('almuhtarif_bookings', JSON.stringify(userBookings));
    } catch (e) {
      console.error('Error saving bookings:', e);
    }
  }, [userBookings]);

  // Save Offers to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('almuhtarif_offers', JSON.stringify(offers));
    } catch (e) {
      console.error('Error saving offers:', e);
    }
  }, [offers]);

  // Route/Hash listener for secret Admin access (#admin or ?admin=true)
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#admin' || hash === '#manager' || hash === '#dashboard' || search.includes('admin=true')) {
        setAdminModalOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'n1',
      title: 'لوحة تحكم مدير المكتب متوفرة الآن',
      message: 'يمكن للمدير الدخول باسم المستخدم admin وكلمة المرور 123456 لتحديث الأسعار ومتابعة الطلبات.',
      date: 'اليوم',
      read: false,
      type: 'system'
    },
    {
      id: 'n2',
      title: 'عرض خصم 22% على باقات دبي والعمرة',
      message: 'احجز رحلتك القادمة واستفد من خصومات حصرية تشمل الفندق والتأشيرات.',
      date: 'أمس',
      read: false,
      type: 'offer'
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenBooking = (type: ServiceType = 'flight') => {
    setBookingServiceType(type);
    setBookingModalOpen(true);
  };

  const handleBookingCreated = (newBooking: BookingRequest) => {
    setUserBookings((prev) => [newBooking, ...prev]);

    // Save the booking to the server too, so it appears in the admin
    // dashboard regardless of which device/browser the customer used.
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    }).catch(() => {
      // Non-fatal: the booking still exists locally for this customer via
      // localStorage even if the network request fails.
    });

    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      title: `تم إنشاء الطلب #${newBooking.orderId}`,
      message: `تم استلام طلب ${newBooking.serviceTitle} بنجاح. حالة الطلب: ${newBooking.status}`,
      date: 'الآن',
      read: false,
      type: 'order'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleSelectOffer = (offer: DestinationOffer) => {
    handleOpenBooking(offer.category === 'hajj_umrah' ? 'hajj_umrah' : 'flight');
  };

  // Admin booking status/payment updates now go straight to the server from
  // inside AdminDashboardModal (see onUpdateBookingStatus/onUpdatePaymentStatus
  // there), since the admin view is fed by the shared database, not this
  // browser's local state.

  const handleUpdateOfferPrice = (offerId: string, newPrice: number, newOriginalPrice?: number) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              price: newPrice,
              originalPrice: newOriginalPrice !== undefined ? newOriginalPrice : o.originalPrice
            }
          : o
      )
    );
  };

  const handleAddOffer = (newOffer: DestinationOffer) => {
    setOffers((prev) => [newOffer, ...prev]);
  };

  const handleDeleteOffer = (offerId: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const scrollToServices = () => {
    const el = document.getElementById('services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToOffers = () => {
    const el = document.getElementById('offers-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMap = () => {
    const el = document.getElementById('location-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-cairo flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        onOpenBooking={() => handleOpenBooking('flight')}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onScrollToServices={scrollToServices}
        onOpenTrackOrder={() => setTrackOrderModalOpen(true)}
        onOpenAppointment={() => setAppointmentModalOpen(true)}
        onOpenLoyalty={() => setLoyaltyModalOpen(true)}
        onOpenNotifications={() => setNotificationsDrawerOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onScrollToOffers={scrollToOffers}
        onScrollToMap={scrollToMap}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Main Hero Banner with Panorama travel imagery */}
        <Hero
          onDiscoverClick={scrollToServices}
        />

        {/* 6 Core Services Section */}
        <ServicesSection
          onSelectService={(service) => setSelectedService(service)}
        />

        {/* Deals & Tourist Destinations Section */}
        <OffersSection
          onSelectOffer={handleSelectOffer}
          offers={offers}
        />

        {/* Interactive Office Location Map Section */}
        <LocationMapSection />
      </main>

      {/* Bottom WhatsApp & Contact Footer Banner */}
      <ContactBanner
        onOpenContact={() => setContactModalOpen(true)}
        onOpenBooking={() => handleOpenBooking('flight')}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* Modals & Drawers */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onOpenBookingForService={(serviceType) => handleOpenBooking(serviceType)}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        initialService={bookingServiceType}
        onClose={() => setBookingModalOpen(false)}
        onBookingCreated={handleBookingCreated}
      />

      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        onOpenBooking={() => handleOpenBooking('flight')}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      <TrackOrderModal
        isOpen={trackOrderModalOpen}
        onClose={() => setTrackOrderModalOpen(false)}
        userBookings={userBookings}
      />

      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
      />

      <LoyaltyModal
        isOpen={loyaltyModalOpen}
        onClose={() => setLoyaltyModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={notificationsDrawerOpen}
        onClose={() => setNotificationsDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      />

      <AdminDashboardModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        offers={offers}
        onUpdateOfferPrice={handleUpdateOfferPrice}
        onAddOffer={handleAddOffer}
        onDeleteOffer={handleDeleteOffer}
      />
    </div>
  );
}

