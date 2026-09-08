import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

// Safe resolver for html2canvas-pro whether imported as default or module
const toCanvas: typeof html2canvas = 
  typeof html2canvas === 'function' 
    ? html2canvas 
    : ((html2canvas as any).default || (html2canvas as any).html2canvas || html2canvas);

export interface ExportResult {
  success: boolean;
  error?: string;
}

/**
 * Direct Print option: opens the browser's native print preview dialog
 * formatted cleanly for A4 paper.
 */
export function directPrintReport(printableElementId: string): void {
  const element = document.getElementById(printableElementId);
  if (!element) {
    window.print();
    return;
  }

  // Add print-ready class to body
  document.body.classList.add('printing-active');

  const cleanup = () => {
    document.body.classList.remove('printing-active');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Trigger standard browser print
  window.print();

  // Safety cleanup in case afterprint doesn't fire (e.g. user closes dialog rapidly)
  setTimeout(cleanup, 1500);
}

/**
 * Downloads the specified HTML element as a high-quality PDF document.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string = 'AfyaLishe_Ushauri_Wa_Lishe.pdf'
): Promise<ExportResult> {
  try {
    // Render the DOM node to canvas at high resolution
    const canvas = await toCanvas(element, {
      scale: 2, // 2x resolution for crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10; // 10mm margin
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    // Multi-page handling if content is longer than one page
    let heightLeft = contentHeight;
    let position = margin;

    // First page
    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, Math.min(contentHeight, pageHeight - margin * 2), undefined, 'FAST');
    heightLeft -= (pageHeight - margin * 2);

    // Subsequent pages if needed
    while (heightLeft > 0) {
      position = -(pageHeight - margin * 2) + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, -((pageHeight - margin * 2) - heightLeft), contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - margin * 2);
    }

    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
    return { success: true };
  } catch (err: any) {
    console.error('Error generating PDF:', err);
    return {
      success: false,
      error: err?.message || 'Imeshindikana kutengeneza PDF. Tafadhali jaribu tena.',
    };
  }
}

/**
 * Downloads the specified HTML element as a high-resolution PNG image.
 */
export async function downloadElementAsImage(
  element: HTMLElement,
  filename: string = 'AfyaLishe_Ushauri_Wa_Lishe.png'
): Promise<ExportResult> {
  try {
    const canvas = await toCanvas(element, {
      scale: 2.5, // Crisp HD image for mobile and sharing
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    const safeFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.download = safeFilename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (err: any) {
    console.error('Error generating Image:', err);
    return {
      success: false,
      error: err?.message || 'Imeshindikana kutengeneza Picha. Tafadhali jaribu tena.',
    };
  }
}
