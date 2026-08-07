import { DestinationOffer } from '../types';
import heroBannerImg from '../assets/images/travel_hero_banner_1784982740709.jpg';
import planeImg from '../assets/images/service_plane_1784982753212.jpg';
import kaabaImg from '../assets/images/service_kaaba_1784982772382.jpg';
import hotelImg from '../assets/images/service_hotel_1784982800981.jpg';

export const DESTINATION_OFFERS: DestinationOffer[] = [
  {
    id: 'offer-dubai-lux',
    title: 'عرض دبي الساحر - طيران وفندق 4 نجوم',
    country: 'الإمارات',
    city: 'دبي',
    price: 450,
    originalPrice: 580,
    discountBadge: 'خصم 22%',
    image: heroBannerImg,
    duration: '5 أيام / 4 ليالي',
    highlights: ['تذكرة طيران ذهاب وإياد', 'إقامة فندقية شاملة الإفطار', 'استقبال وتوديع في المطار', 'تأشيرة دبي السياحية السريعة'],
    rating: 4.9,
    featured: true,
    category: 'package'
  },
  {
    id: 'offer-umrah-vip',
    title: 'برنامج العمرة المتميز - فنادق قريبة من الحرم',
    country: 'المملكة العربية السعودية',
    city: 'مكة المكرمة والمدينة',
    price: 320,
    originalPrice: 400,
    discountBadge: 'شامل الفيزا والمواصلات',
    image: kaabaImg,
    duration: '10 أيام',
    highlights: ['تأشيرة العمرة الرسمية', 'سكن في مكة والمدينة على مقربة من الحرم', 'حافلات حديثة ومكيفة VIP', 'مرشد ديني طوال الرحلة'],
    rating: 5.0,
    featured: true,
    category: 'hajj_umrah'
  },
  {
    id: 'offer-cairo-tour',
    title: 'عرض القاهرة والشرم - سياحة وتذاكر مباشرة',
    country: 'مصر',
    city: 'القاهرة وشرم الشيخ',
    price: 390,
    originalPrice: 470,
    discountBadge: 'عرض العائلات',
    image: planeImg,
    duration: '7 أيام',
    highlights: ['تذاكر طيران مؤكدة', 'جولات سياحية للأهرامات والأزهر', 'فنادق راقية على النيل', 'خدمات الاستقبال والفيزا'],
    rating: 4.8,
    featured: false,
    category: 'package'
  },
  {
    id: 'offer-istanbul-tour',
    title: 'عروض إسطنبول وطرابزون الخضراء',
    country: 'تركيا',
    city: 'إسطنبول وطرابزون',
    price: 520,
    originalPrice: 650,
    discountBadge: 'خصم 20%',
    image: hotelImg,
    duration: '8 أيام',
    highlights: ['تذاكر ومواصلات خاصة', 'رحلات البوسفور وبحيرة أوزنجول', 'إقامة في فنادق 4 و 5 نجوم', 'متابعة الدعم على مدار الساعة'],
    rating: 4.9,
    featured: true,
    category: 'package'
  }
];
