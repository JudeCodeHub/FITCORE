import PDFDocument from 'pdfkit';

export interface InvoicePaymentData {
  id: string;
  invoiceNumber?: string | null;
  amount: any;
  currency: string;
  status: string;
  method: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  membership?: {
    id: string;
    startDate: Date;
    endDate: Date;
    plan?: {
      name: string;
      duration: string;
    } | null;
  } | null;
}

export function buildPaymentInvoicePdf(payment: InvoicePaymentData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 45, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const invoiceNumber =
      payment.invoiceNumber || `INV-${payment.id.slice(-8).toUpperCase()}`;
    const formattedDate = new Date(payment.createdAt).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );

    // --- Header / Brand ---
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(24)
      .text('FITCORE GYM', 45, 45);
    doc
      .fillColor('#64748b')
      .font('Helvetica')
      .fontSize(9)
      .text('FITNESS & HEALTH CLUB', 45, 74);
    doc.text('123 Fitness Boulevard, Downtown', 45, 87);
    doc.text('contact@fitcore.io | www.fitcore.io', 45, 100);

    // Invoice title block on right
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('INVOICE / RECEIPT', 330, 45, { align: 'right' });
    doc.fillColor('#64748b').font('Helvetica').fontSize(10);
    doc.text(`Invoice #: ${invoiceNumber}`, 330, 72, { align: 'right' });
    doc.text(`Date: ${formattedDate}`, 330, 87, { align: 'right' });
    doc.text(`Status: ${payment.status}`, 330, 102, { align: 'right' });

    // Horizontal divider
    doc.moveTo(45, 125).lineTo(550, 125).strokeColor('#e2e8f0').stroke();

    // --- Bill To & Payment Method ---
    doc
      .fillColor('#475569')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('BILL TO:', 45, 140);
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(payment.user.name, 45, 155);
    doc
      .fillColor('#64748b')
      .font('Helvetica')
      .fontSize(10)
      .text(payment.user.email, 45, 172);
    doc.text(`Member ID: ${payment.user.id}`, 45, 187);

    doc
      .fillColor('#475569')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('PAYMENT DETAILS:', 330, 140, { align: 'right' });
    doc.fillColor('#0f172a').font('Helvetica').fontSize(10);
    doc.text(
      `Method: ${String(payment.method).replace('_', ' ')}`,
      330,
      155,
      { align: 'right' },
    );
    doc.text(
      `Currency: ${(payment.currency || 'USD').toUpperCase()}`,
      330,
      172,
      { align: 'right' },
    );

    // --- Line Items Table Header ---
    const tableTop = 220;
    doc.rect(45, tableTop, 505, 26).fill('#f8fafc');
    doc.fillColor('#334155').font('Helvetica-Bold').fontSize(10);
    doc.text('DESCRIPTION', 55, tableTop + 8);
    doc.text('PERIOD / DATES', 280, tableTop + 8);
    doc.text('AMOUNT', 460, tableTop + 8, { align: 'right', width: 80 });

    // Line item content
    const itemY = tableTop + 36;
    const planName = payment.membership?.plan?.name
      ? `FitCore ${payment.membership.plan.name} Membership (${payment.membership.plan.duration})`
      : 'FitCore Gym Membership Payment';

    const periodStr =
      payment.membership?.startDate && payment.membership?.endDate
        ? `${new Date(payment.membership.startDate).toLocaleDateString()} - ${new Date(payment.membership.endDate).toLocaleDateString()}`
        : formattedDate;

    const amountFormatted = `$${Number(payment.amount).toFixed(2)}`;

    doc.fillColor('#0f172a').font('Helvetica').fontSize(10);
    doc.text(planName, 55, itemY, { width: 215 });
    doc.fillColor('#64748b').text(periodStr, 280, itemY);
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .text(amountFormatted, 460, itemY, { align: 'right', width: 80 });

    // Table bottom border
    doc
      .moveTo(45, itemY + 30)
      .lineTo(550, itemY + 30)
      .strokeColor('#e2e8f0')
      .stroke();

    // --- Totals ---
    const totalY = itemY + 45;
    doc.fillColor('#64748b').font('Helvetica').fontSize(10);
    doc.text('Subtotal:', 350, totalY, { align: 'right', width: 100 });
    doc
      .fillColor('#0f172a')
      .text(amountFormatted, 460, totalY, { align: 'right', width: 80 });

    doc
      .fillColor('#64748b')
      .text('Tax (0%):', 350, totalY + 18, { align: 'right', width: 100 });
    doc.fillColor('#0f172a').text('$0.00', 460, totalY + 18, {
      align: 'right',
      width: 80,
    });

    doc.rect(340, totalY + 38, 210, 30).fill('#f1f5f9');
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12);
    doc.text('Total Paid:', 350, totalY + 46, { align: 'right', width: 100 });
    doc.text(amountFormatted, 460, totalY + 46, { align: 'right', width: 80 });

    // --- Footer ---
    const footerY = 680;
    doc
      .moveTo(45, footerY)
      .lineTo(550, footerY)
      .strokeColor('#e2e8f0')
      .stroke();
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(8);
    doc.text(
      'Thank you for being a valued member of FitCore Gym!',
      45,
      footerY + 12,
      { align: 'center', width: 505 },
    );
    doc.text(
      'This document serves as an official receipt. For any questions regarding billing, contact billing@fitcore.io.',
      45,
      footerY + 26,
      { align: 'center', width: 505 },
    );

    doc.end();
  });
}
