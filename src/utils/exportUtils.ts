import { BookingRequest, DestinationOffer } from '../types';

/**
 * Exports booking list into a CSV spreadsheet formatted for Excel (with UTF-8 BOM for Arabic support)
 */
export function exportBookingsToCSV(bookings: BookingRequest[]): void {
  const headers = [
    'رقم الطلب',
    'نوع الخدمة',
    'اسم العميل',
    'رقم الهاتف',
    'البريد الإلكتروني',
    'الوجهة',
    'تاريخ السفر',
    'عدد المسافرين',
    'حالة المعاملة',
    'طريقة الدفع',
    'حالة السداد',
    'المبلغ ($)',
    'تاريخ الطلب'
  ];

  const rows = bookings.map((b) => [
    b.orderId,
    b.serviceTitle || b.serviceType,
    b.customerName,
    b.phone,
    b.email || 'غير مدخل',
    b.destination,
    b.travelDate,
    b.passengers,
    b.status,
    b.paymentMethod,
    b.paymentStatus,
    b.totalAmount || 0,
    b.createdAt
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  // UTF-8 BOM (\uFEFF) ensures Excel opens Arabic correctly without garbled symbols
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `تقرير_حجوزات_المحترف_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a complete JSON data backup of all bookings and offers
 */
export function exportBackupJSON(bookings: BookingRequest[], offers: DestinationOffer[]): void {
  const data = {
    agency: 'مكتب المحترف للسفريات والسياحة',
    exportedAt: new Date().toISOString(),
    bookingsCount: bookings.length,
    offersCount: offers.length,
    bookings,
    offers
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `نسخة_احتياطية_المحترف_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
