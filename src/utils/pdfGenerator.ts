import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BookingRequest } from '../types';
import { generateQRCodeDataUrl } from './qrUtils';
import { BRAND_LOGO_IMAGE } from '../data/services';

export async function generateBookingPDF(booking: BookingRequest): Promise<void> {
  // Generate QR Code data URL
  const qrText = `مكتب المحترف للسفريات والسياحة\nرقم الطلب: ${booking.orderId}\nالعميل: ${booking.customerName}\nالهاتف: ${booking.phone}\nالحالة: ${booking.status}`;
  const qrDataUrl = await generateQRCodeDataUrl(qrText);

  // Status Arabic Map
  const statusArabic: Record<string, string> = {
    pending: 'قيد الانتظار والمراجعة الأولية',
    documents_review: 'جاري فحص وتدقيق وثائق الجوازات',
    processing: 'جاري المعالجة وإصدار التذكرة/التأشيرة',
    issued: 'جاهز للتسليم والاستلام',
    ready: 'جاهز للتسليم والاستلام',
    completed: 'تم تنفيذ وإكمال الطلب بنجاح',
    cancelled: 'ملغي'
  };

  // Payment Method Arabic Map
  const paymentMethodArabic: Record<string, string> = {
    e_wallet: 'محفظة إلكترونية (جايب / كريمي / ون كاش)',
    office_cash: 'سداد نقدي بمقر المكتب (تعز - الكدمة)',
    bank_transfer: 'تحويل بنكي / مصرفي معتمد',
    card: 'بطاقة ائتمانية / دفع إلكتروني'
  };

  // Payment Status Arabic Map
  const paymentStatusArabic: Record<string, string> = {
    paid: 'مدفوع بالكامل (سداد تام)',
    deposit_paid: 'تم سداد العربون المبدئي',
    pending: 'في انتظار السداد'
  };

  // Service Type Arabic Title Map
  const serviceTypeArabic: Record<string, string> = {
    flight: 'حجز طيران وتذاكر سفر',
    passport: 'تجديد واستخراج جواز سفر',
    hajj_umrah: 'برامج الحج والعمرة VIP',
    visas: 'تأشيرات ودعوات زيارة',
    buses: 'حافلات ونقل بري دولي',
    hotels: 'حجوزات فنادق وإقامة'
  };

  // Build temporary HTML element for print rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = "'Cairo', 'Tajawal', 'Segoe UI', sans-serif";
  container.style.direction = 'rtl';
  container.style.padding = '0';
  container.style.boxSizing = 'border-box';

  const documentsListHtml = (booking.documents && booking.documents.length > 0)
    ? booking.documents.map((doc, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 12px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:6px; font-size:12px;">
          <div>
            <span style="font-weight:bold; color:#0F2C59;">${idx + 1}. ${doc.name}</span>
            <span style="color:#64748b; font-size:11px; margin-right:8px;">(${doc.size})</span>
          </div>
          <span style="color:#059669; font-weight:bold; font-size:11px; background-color:#ecfdf5; padding:2px 8px; border-radius:12px;">مرفق ومفحوص ✓</span>
        </div>
      `).join('')
    : `<div style="font-size:12px; color:#64748b; padding:8px; text-align:center;">لا يوجد ملفات مرفقة (تم التدقيق الإلكتروني بالمكتب)</div>`;

  container.innerHTML = `
    <div style="border: 2px solid #0F2C59; border-radius: 0; background: #ffffff; overflow: hidden; box-shadow: none;">
      
      <!-- Top Navy Header Banner -->
      <div style="background: linear-gradient(135deg, #0F2C59 0%, #16386C 100%); color: #ffffff; padding: 24px 28px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #D4AF37;">
        
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 64px; height: 64px; background: #ffffff; border-radius: 12px; padding: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
            <img src="${BRAND_LOGO_IMAGE}" alt="شعار المحترف" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
          </div>
          <div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; line-height: 1.2;">مكتب المحترف للسفريات والسياحة</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #fef08a; font-weight: bold;">خدمات الطيران، الجوازات المستعجلة، الحج والعمرة والتأشيرات</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #cbd5e1;">تعز - الأقروض - الكدمة - الشارع العام</p>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(212,175,55,0.5); padding: 10px 18px; border-radius: 12px; text-align: center;">
          <span style="display: block; font-size: 10px; color: #fde047; font-weight: bold; text-transform: uppercase;">سند حجز وإيصال معتمد</span>
          <span style="display: block; font-size: 16px; font-weight: 900; color: #ffffff; font-family: monospace; margin-top: 2px;">#${booking.orderId}</span>
          <span style="display: block; font-size: 10px; color: #cbd5e1; margin-top: 2px;">تاريخ الإصدار: ${booking.createdAt}</span>
        </div>

      </div>

      <!-- Main Voucher Body -->
      <div style="padding: 24px 28px;">
        
        <!-- Status Bar -->
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 11px; color: #64748b; font-weight: bold; display: block;">نوع الخدمة المحجوزة:</span>
            <span style="font-size: 15px; font-weight: 900; color: #0F2C59;">${serviceTypeArabic[booking.serviceType] || booking.serviceTitle}</span>
          </div>

          <div style="text-align: left;">
            <span style="font-size: 11px; color: #64748b; font-weight: bold; display: block;">حالة المعاملة الحالية:</span>
            <span style="font-size: 13px; font-weight: 900; color: #047857; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 12px; border-radius: 20px; display: inline-block; margin-top: 2px;">
              ${statusArabic[booking.status] || booking.status}
            </span>
          </div>
        </div>

        <!-- Details Grid (Passenger info & QR) -->
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
          
          <!-- Customer Details Box (Right - 65%) -->
          <div style="flex: 1.8; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: #ffffff;">
            <div style="background-color: #0F2C59; color: #ffffff; padding: 8px 14px; font-size: 12px; font-weight: bold; border-bottom: 2px solid #D4AF37;">
              بيانات العميل وحجز السفر
            </div>
            
            <div style="padding: 14px 16px; font-size: 12px; line-height: 1.8; color: #334155;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                <span style="color: #64748b; font-weight: bold;">اسم المسافر الرئيسي:</span>
                <span style="font-weight: 900; color: #0F2C59;">${booking.customerName}</span>
              </div>

              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                <span style="color: #64748b; font-weight: bold;">رقم الجوال / الواتساب:</span>
                <span style="font-weight: bold; direction: ltr;">${booking.phone}</span>
              </div>

              ${booking.email ? `
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                <span style="color: #64748b; font-weight: bold;">البريد الإلكتروني:</span>
                <span style="font-weight: bold;">${booking.email}</span>
              </div>` : ''}

              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                <span style="color: #64748b; font-weight: bold;">الوجهة والمسار:</span>
                <span style="font-weight: 900; color: #b45309;">${booking.destination}</span>
              </div>

              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                <span style="color: #64748b; font-weight: bold;">تاريخ السفر المجدول:</span>
                <span style="font-weight: bold; color: #0F2C59;">${booking.travelDate}</span>
              </div>

              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b; font-weight: bold;">عدد المسافرين:</span>
                <span style="font-weight: bold;">${booking.passengers} مسافر(ين)</span>
              </div>
            </div>
          </div>

          <!-- QR Verification Box (Left - 35%) -->
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: #fafafa; text-align: center; display: flex; flex-direction: column; justify-content: justify-between;">
            <div style="background-color: #0F2C59; color: #ffffff; padding: 8px 14px; font-size: 12px; font-weight: bold; border-bottom: 2px solid #D4AF37;">
              رمز التحقق الفوري (QR)
            </div>

            <div style="padding: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
              ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR Code" style="width: 110px; height: 110px; border: 2px solid #0F2C59; border-radius: 8px; padding: 4px; background: #ffffff;" />` : ''}
              
              <span style="font-size: 10px; color: #475569; font-weight: bold; margin-top: 8px; line-height: 1.3;">
                امسح الرمز للتأكد الفوري من صحة السند وتتبع حالة المعاملة
              </span>
            </div>

            <div style="background: #fef3c7; border-top: 1px solid #fde68a; padding: 6px; font-size: 10px; font-weight: 900; color: #92400e;">
              ✓ حجز إلكتروني معتمد 100%
            </div>
          </div>

        </div>

        <!-- Documents Section -->
        <div style="border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; margin-bottom: 20px; background: #ffffff;">
          <div style="background-color: #0F2C59; color: #ffffff; padding: 8px 14px; font-size: 12px; font-weight: bold; border-bottom: 2px solid #D4AF37;">
            المستندات والوثائق المرفقة بالطلب
          </div>
          <div style="padding: 12px 16px;">
            ${documentsListHtml}
          </div>
        </div>

        <!-- Payment & Loyalty Summary -->
        <div style="border: 1px solid #f59e0b; border-radius: 12px; overflow: hidden; margin-bottom: 20px; background: #fffbeb;">
          <div style="background: linear-gradient(90deg, #d97706 0%, #b45309 100%); color: #ffffff; padding: 8px 14px; font-size: 12px; font-weight: bold;">
            البيانات المالية وإثبات السداد
          </div>
          
          <div style="padding: 14px 16px; display: flex; justify-content: space-between; items-center; font-size: 12px;">
            <div>
              <div style="margin-bottom: 4px;">
                <span style="color: #78350f; font-weight: bold;">طريقة الدفع:</span>
                <span style="font-weight: 900; color: #1e293b; margin-right: 6px;">${paymentMethodArabic[booking.paymentMethod] || booking.paymentMethod}</span>
              </div>
              <div>
                <span style="color: #78350f; font-weight: bold;">حالة السداد:</span>
                <span style="font-weight: 900; color: #047857; margin-right: 6px;">${paymentStatusArabic[booking.paymentStatus] || booking.paymentStatus}</span>
              </div>
            </div>

            <div style="text-align: left;">
              <div style="margin-bottom: 4px;">
                <span style="color: #78350f; font-weight: bold;">نقاط الولاء المكتسبة:</span>
                <span style="font-weight: 900; color: #d97706; margin-left: 6px;">+${booking.loyaltyPointsEarned} نقطة</span>
              </div>
              <div>
                <span style="color: #78350f; font-weight: bold;">المبلغ التقديري:</span>
                <span style="font-size: 16px; font-weight: 900; color: #0F2C59; margin-left: 6px;">$${booking.totalAmount} USD</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notice & Terms -->
        <div style="background-color: #f1f5f9; border-radius: 10px; padding: 10px 14px; font-size: 10px; color: #475569; line-height: 1.6; margin-bottom: 10px;">
          <strong style="color: #0F2C59; display: block; margin-bottom: 2px;">تنبيهات وتأكيدات هامة للمسافر:</strong>
          • يرجى إبراز هذا السند المعتمد عند مراجعة مقر المكتب في تعز - الكدمة لاستكمال تسليم الوثائق أو استلام التذاكر.<br/>
          • يتوجب التأكد من سريان صلاحية جواز السفر لمدة لا تقل عن 6 أشهر من تاريخ المغادرة المحدد.<br/>
          • للتحقق الفوري والاستفسار، تواصل مع فريق الدعم عبر الهاتف أو الواتساب المعتمد.
        </div>

      </div>

      <!-- Footer Bar -->
      <div style="background-color: #0F2C59; color: #ffffff; padding: 14px 28px; font-size: 10px; border-top: 3px solid #D4AF37; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-weight: 900; color: #fef08a; display: block; font-size: 11px;">مكتب المحترف للسفريات والسياحة وخدمات الحج والعمرة</span>
          <span style="color: #cbd5e1;">العنوان الرئيسي: اليمن - تعز - الأقروض - الكدمة - الشارع العام</span>
        </div>

        <div style="text-align: left; font-family: sans-serif;">
          <div style="color: #fde047; font-weight: bold; direction: ltr;">+967 771234707 / +967 730550440</div>
          <div style="color: #cbd5e1;">info@almuhtarif-travel.com</div>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(container);

  // Brief pause for element rendering and image loads
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));

    pdf.save(`سند_حجز_المحترف_${booking.orderId}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
