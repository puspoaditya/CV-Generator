export const extractTextFromPdf = async (file: File): Promise<string> => {
  // Use dynamic import to avoid evaluation crashes during SSR or page load
  const pdfjsLib = await import("pdfjs-dist");

  // Initialize worker
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => (item as any).str)
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
};
