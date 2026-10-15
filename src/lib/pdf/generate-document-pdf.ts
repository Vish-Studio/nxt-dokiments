export interface GenerateDocumentPdfOptions {
  footer?: HTMLElement | null;
}

type Range = { bottom: number; top: number };

const captureOptions = {
  backgroundColor: "white",
  cacheBust: true,
  pixelRatio: 2,
};

// Page layout in mm.
const margin = 6;
// Minimum space between content and the footer rule; content that would come closer moves to the next page.
const footerGap = 6;
// Extra top space on continuation pages so they don't start flush with the page edge.
const continuationInset = 4;

// Blocks a page break must never cut through.
const keepTogetherSelector = "header, dl > div, tr, li, [data-pdf-keep]";
// Headings that must stay on the same page as the start of what follows them.
const keepWithNextSelector = "h3";
// How much of the following content (CSS px, roughly two lines) a heading keeps with it.
const keepWithNextPx = 48;

// Measures the protected ranges in canvas pixels; [data-pdf-keep] elements sharing a value merge into one range.
const measureKeepRanges = (element: HTMLElement, scale: number) => {
  const origin = element.getBoundingClientRect().top;
  const toRange = (node: Element, extra = 0): Range => {
    const rect = node.getBoundingClientRect();

    // Snap outward to whole rows so anti-aliased borders on a block's edge stay with the block.
    return {
      bottom: Math.ceil((rect.bottom - origin + extra) * scale),
      top: Math.floor((rect.top - origin) * scale),
    };
  };
  const groups = new Map<string, Range>();
  const ranges: Range[] = [];

  element.querySelectorAll(keepTogetherSelector).forEach((node) => {
    const range = toRange(node);
    const group = node.getAttribute("data-pdf-keep");
    const existing = group ? groups.get(group) : undefined;

    if (!group) {
      ranges.push(range);
    } else if (existing) {
      existing.top = Math.min(existing.top, range.top);
      existing.bottom = Math.max(existing.bottom, range.bottom);
    } else {
      groups.set(group, range);
    }
  });
  element.querySelectorAll(keepWithNextSelector).forEach((node) => {
    ranges.push(toRange(node, keepWithNextPx));
  });

  return [...ranges, ...groups.values()];
};

// Picks the lowest row that is outside every protected block and either ends a block or is blank (between text lines).
const findBreakHeight = (
  canvas: HTMLCanvasElement,
  ranges: Range[],
  offset: number,
  maxHeight: number,
) => {
  const context = canvas.getContext("2d");

  if (!context) {
    return maxHeight;
  }

  const { data } = context.getImageData(0, offset, canvas.width, maxHeight);
  const rowLength = canvas.width * 4;
  const isBlankRow = (row: number) => {
    for (let index = row * rowLength; index < (row + 1) * rowLength; index += 4) {
      if (data[index] < 250 || data[index + 1] < 250 || data[index + 2] < 250) {
        return false;
      }
    }

    return true;
  };

  for (let height = maxHeight; height > 0; height -= 1) {
    const y = offset + height;
    const insideBlock = ranges.some((range) => y > range.top && y < range.bottom);

    if (insideBlock) {
      continue;
    }

    const endsBlock = ranges.some((range) => y === range.bottom || y === range.top);

    if (endsBlock || isBlankRow(height - 1)) {
      return height;
    }
  }

  // A single block taller than a page: fall back to a hard cut.
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
  const pdf = new jsPDF({ compress: true, format: "a4", orientation: "portrait", unit: "mm" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  const pxPerMm = canvas.width / contentWidth;
  const ranges = measureKeepRanges(element, canvas.width / element.getBoundingClientRect().width);
  const footerHeight = footer
    ? (footer.getBoundingClientRect().height * contentWidth) / footer.getBoundingClientRect().width
    : 0;
  const bodyBottom = pageHeight - margin - (footer ? footerHeight + footerGap : 0);
  const bodyTopFor = (pageIndex: number) => (pageIndex === 0 ? margin : margin + continuationInset);

  // Plan every page first so the footer can show "Page x of y".
  const slices: Array<{ height: number; offset: number }> = [];

  for (let offset = 0; offset < canvas.height; offset += slices[slices.length - 1].height) {
    const maxHeight = Math.floor((bodyBottom - bodyTopFor(slices.length)) * pxPerMm);
    const remaining = canvas.height - offset;

    slices.push({
      height: remaining <= maxHeight ? remaining : findBreakHeight(canvas, ranges, offset, maxHeight),
      offset,
    });
  }

  const pageCanvas = document.createElement("canvas");
  const pageContext = pageCanvas.getContext("2d");

  if (!pageContext) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  pageCanvas.width = canvas.width;

  for (const [pageIndex, { height, offset }] of slices.entries()) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    pageCanvas.height = height;
    pageContext.drawImage(canvas, 0, offset, canvas.width, height, 0, 0, canvas.width, height);
    pdf.addImage(pageCanvas, "PNG", margin, bodyTopFor(pageIndex), contentWidth, height / pxPerMm, undefined, "FAST");

    if (footer) {
      const footerCanvas = await captureFooter(
        footer,
        slices.length > 1 ? `Page ${pageIndex + 1} of ${slices.length}` : "",
        toCanvas,
      );

      pdf.addImage(footerCanvas, "PNG", margin, pageHeight - margin - footerHeight, contentWidth, footerHeight, undefined, "FAST");
    }
  }

  return pdf.output("blob");
};

// Captures a detached copy of the footer so the page label never touches React-managed DOM.
const captureFooter = async (
  footer: HTMLElement,
  pageLabel: string,
  toCanvas: (typeof import("html-to-image"))["toCanvas"],
) => {
  const copy = footer.cloneNode(true) as HTMLElement;
  const label = copy.querySelector("[data-pdf-page-label]");

  if (label) {
    label.textContent = pageLabel;
  }

  footer.after(copy);

  try {
    return await toCanvas(copy, captureOptions);
  } finally {
    copy.remove();
  }
};
