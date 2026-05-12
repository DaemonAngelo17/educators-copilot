import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
// In a real Next.js app, you might need to set the workerSrc
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'txt':
      return await file.text();
    case 'pdf':
      return await extractTextFromPDF(file);
    case 'epub':
      // EPUB extraction is more complex, for MVP we might just support TXT/PDF or 
      // return a placeholder if we don't want to bring in a heavy library like epubjs yet.
      return "EPUB support coming soon. Please use PDF or TXT.";
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: { str: string }) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}
