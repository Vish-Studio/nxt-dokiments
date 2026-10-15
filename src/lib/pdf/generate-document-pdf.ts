export interface GenerateDocumentPdfOptions {
  footer?: HTMLElement | null;
}

const captureOptions = {
  backgroundColor: "white",
  cacheBust: true,
  pixelRatio: 2,
};

// Look this far up from a full page for a blank row before falling back to a hard cut.
const maxBreakSearchRatio = 0.25;

// Returns the slice height that ends on the lowest fully white row, so page breaks fall between lines of text.
const findBreakHeight = (canvas: HTMLCanvasElement, offset: number, maxHeight: number) => {
  const context = canvas.getContext("2d");
  const searchHeight = Math.floor(maxHeight * maxBreakSearchRatio);

  if (!context || searchHeight <= 0) {
    return maxHeight;
  }

  const searchTop = offset + maxHeight - searchHeight;
  const { data } = context.getImageData(0, searchTop, canvas.width, searchHeight);
  const rowLength = canvas.width * 4;

  for (let row = searchHeight - 1; row >= 0; row -= 1) {
    let blank = true;

    for (let index = row * rowLength; index < (row + 1) * rowLength; index += 4) {
      if (data[index] < 250 || data[index + 1] < 250 || data[index + 2] < 250) {
        blank = false;
        break;
      }
    }

    if (blank) {
      return maxHeight - searchHeight + row + 1;
    }
  }

  return maxHeight;
};

export const generateDocumentPdf = async (
  element: HTMLElement,
  { footer }: GenerateDocumentPdfOptions = {},
) => {
  const [{ toCanvas }, { jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  await document.fonts.ready;

  const canvas = await toCanvas(element, captureOptions);
  const footerCanvas = footer ? await toCanvas(footer, captureOptions) : null;
  const pdf = new jsPDF({ compress: true, format: "a4", orientation: "portrait", unit: "mm" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const footerHeight = footerCanvas
    ? (footerCanvas.height * contentWidth) / footerCanvas.width
    : 0;
  // Keep content off the footer rule, and give continuation pages the same breathing room at the top.
  const footerGap = footerCanvas ? 6 : 0;
  const continuationInset = 8;
  const bodyBottom = pageHeight - margin - footerHeight - footerGap;
  const pxPerMm = canvas.width / contentWidth;
  const pageCanvas = document.createElement("canvas");
  const pageContext = pageCanvas.getContext("2d");

  if (!pageContext) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  pageCanvas.width = canvas.width;

  // Slice the capture per page so content never bleeds into the margins or footer.
  for (let offset = 0, pageIndex = 0; offset < canvas.height; offset += pageCanvas.height, pageIndex += 1) {
    const bodyTop = pageIndex === 0 ? margin : margin + continuationInset;
    const slicePxHeight = Math.floor((bodyBottom - bodyTop) * pxPerMm);
    const remaining = canvas.height - offset;
    const sliceHeight = remaining <= slicePxHeight
      ? remaining
      : findBreakHeight(canvas, offset, slicePxHeight);

    if (pageIndex > 0) {
      pdf.addPage();
    }

    pageCanvas.height = sliceHeight;
    pageContext.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
    pdf.addImage(pageCanvas, "PNG", margin, bodyTop, contentWidth, sliceHeight / pxPerMm, undefined, "FAST");

    if (footerCanvas) {
      pdf.addImage(footerCanvas, "PNG", margin, pageHeight - margin - footerHeight, contentWidth, footerHeight, undefined, "FAST");
    }
  }

  return pdf.output("blob");
};
