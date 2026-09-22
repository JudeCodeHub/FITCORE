import PDFDocument from 'pdfkit';
import type { ReportColumn } from './csv.util.js';

export interface PdfReportOptions<T> {
  title: string;
  subtitle?: string;
  columns: ReportColumn<T>[];
  rows: T[];
  generatedAt?: Date;
}

const ROW_HEIGHT = 18;

export function buildPdfReport<T>(opts: PdfReportOptions<T>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(18).text(opts.title);
    if (opts.subtitle) {
      doc.font('Helvetica').fontSize(11).fillColor('#555').text(opts.subtitle);
    }
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#888')
      .text(`Generated ${(opts.generatedAt ?? new Date()).toISOString()}`);
    doc.fillColor('#000').moveDown(1);

    const startX = doc.page.margins.left;
    const usableWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = usableWidth / opts.columns.length;

    function drawRow(values: (string | number)[], y: number, bold: boolean) {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);
      values.forEach((v, i) => {
        // `height` (not `lineBreak: false`) is what makes pdfkit truncate
        // to a single line with an ellipsis instead of wrapping — without
        // it, a long value wraps onto multiple lines and overlaps the row
        // below.
        doc.text(String(v), startX + i * colWidth, y, {
          width: colWidth - 4,
          height: ROW_HEIGHT - 6,
          ellipsis: true,
        });
      });
    }

    let y = doc.y;
    drawRow(
      opts.columns.map((c) => c.header),
      y,
      true,
    );
    y += ROW_HEIGHT;
    doc
      .moveTo(startX, y - 4)
      .lineTo(startX + usableWidth, y - 4)
      .strokeColor('#ccc')
      .stroke();

    for (const row of opts.rows) {
      if (y > doc.page.height - doc.page.margins.bottom - ROW_HEIGHT) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      drawRow(
        opts.columns.map((c) => c.value(row)),
        y,
        false,
      );
      y += ROW_HEIGHT;
    }

    if (opts.rows.length === 0) {
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#888')
        .text('No data in this window.', startX, y);
    }

    doc.end();
  });
}
