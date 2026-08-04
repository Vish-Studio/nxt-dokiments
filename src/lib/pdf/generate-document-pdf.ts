export const generateDocumentPdf = async (element: HTMLElement) => {
  const [{ toCanvas }, { jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  await document.fonts.ready;

  const canvas = await toCanvas(element, {
    backgroundColor: "white",
    cacheBust: true,
    pixelRatio: 2,
  });
  const pdf = new jsPDF({ compress: true, format: "a4", orientation: "portrait", unit: "mm" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;
  const imageHeight = (canvas.height * contentWidth) / canvas.width;
  let renderedHeight = 0;
  let pageIndex = 0;

  while (renderedHeight < imageHeight) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      canvas,
      "PNG",
      margin,
      margin - renderedHeight,
      contentWidth,
      imageHeight,
      undefined,
      "FAST",
    );

    renderedHeight += contentHeight;
    pageIndex += 1;
  }

  return pdf.output("blob");
};
