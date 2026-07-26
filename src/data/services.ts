import { ServiceItem } from '../types';

import heroBannerImg from '../assets/images/travel_hero_banner_1784982740709.jpg';
import logoImg from '../assets/images/logo_almuhtarif_official_1785014621620.jpg';
import planeImg from '../assets/images/service_plane_1784982753212.jpg';
import passportImg from '../assets/images/service_passport_1784982763538.jpg';
import kaabaImg from '../assets/images/service_kaaba_1784982772382.jpg';
import familyImg from '../assets/images/service_family_1784982781332.jpg';
import busImg from '../assets/images/service_bus_1784982790008.jpg';
import hotelImg from '../assets/images/service_hotel_1784982800981.jpg';

export const HERO_BANNER_IMAGE = heroBannerImg;
export const BRAND_LOGO_IMAGE = logoImg;

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'flight',
    title: 'حجز تذاكر طيران',
    subtitle: 'أفضل أسعار الطيران للوجهات الداخلية والدولية',
    image: planeImg,
    description: 'نوفر لكم أفضل عروض تذاكر الطيران على كافة الخطوط الجوية العالمية والمحلية بأسعار تنافسية وحجوزات مرنة.',
    features: [
      'حجوزات طيران ذهاب وإياد أو وجهات متعددة',
      'مقارنة أسعار أكثر من 500 شركة طيران',
      'إمكانية التعديل والإلغاء بسهولة',
      'دعم فني وتأكيد حجز فورياً'
    ]
  },
  {
    id: 'passport',
    title: 'تجديد واستخراج الجوازات المستعجلة',
    subtitle: 'معاملات رسمية سريعة وموثوقة',
    image: passportImg,
    description: 'خدمة سريعة وموثوقة لتجديد واستخراج وثائق السفر والجوازات المستعجلة وتحديث البيانات بأعلى معايير السرعة.',
    features: [
      'استخراج تجديد الجوازات في أوقات قياسية',
      'متابعة المعاملات الرسمية خطوة بخطوة',
      'تدقيق وتجهيز المستندات قبل التقديم',
      'خدمة العملاء على مدار الساعة'
    ]
  },
  {
    id: 'hajj_umrah',
    title: 'خدمات الحج والعمرة',
    subtitle: 'برامج متكاملة لزيارة بيت الله الحرام',
    image: kaabaImg,
    description: 'نقدم أرقام برامج الحج والعمرة المميزة الشاملة للإقامة القريبة من الحرمين الشريفين والتنقلات المريحة والمرشدين.',
    features: [
      'برامج عمرة خماسية واقتصادية',
      'فنادق مطلة على الحرم الشريف',
      'مواصلات حديثة ومكيفة من وإلى المطار',
      'استخراج تصاريح العمرة والزيارة'
    ]
  },
  {
    id: 'visas',
    title: 'تأشيرات وزيارات عائلية',
    subtitle: 'تأشيرات سياحية وتجارية وزيارات عائلية',
    image: familyImg,
    description: 'نساعدكم في التقديم على كافة أنواع التأشيرات السياحية والزيارات العائلية للإمارات، مصر، تركيا، ودول أوروبا والخليج.',
    features: [
      'تأشيرات الإمارات السياحية (30/90 يوم)',
      'تأشيرات مصر وتركيا السريعة',
      'معاملات الزيارات العائلية والشخصية',
      'حجز موعد الشنغن والتأمين الصحي للسفر'
    ]
  },
  {
    id: 'buses',
    title: 'حجز حافلات ونقل جماعي',
    subtitle: 'رحلات برية مريحة وحافلات VIP',
    image: busImg,
    description: 'رحلات برية بين المدن والدول المجاورة عبر حافلات حديثة ومكيفة ومجهزة بأعلى وسائل الراحة والأمان.',
    features: [
      'رحلات يومية منتظمة بين المدن',
      'حافلات VIP حديثة مزودة بشاشات وواي فاي',
      'خدمة حجز المقاعد المسبق',
      'أسعار خاصة للمجموعات والعائلات'
    ]
  },
  {
    id: 'hotels',
    title: 'حجز فنادق',
    subtitle: 'إقامة فاخرة في أفضل الفنادق حول العالم',
    image: hotelImg,
    description: 'حجوزات فندقية في أفخم الفنادق والمنتجعات والشقق الفندقية بأسعار حصريّة وخيارات إفطار وإلغاء مجاني.',
    features: [
      'فنادق 3، 4 و5 نجوم بأسعار مخفضة',
      'شقق فندقية واسعة للعائلات',
      'ضمان أفضل سعر للإقامة',
      'خيارات إلغاء مجاني ودفع عند الوصول'
    ]
  }
];
