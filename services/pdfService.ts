/**
 * Extracts text from a PDF file purely on the client side using PDF.js.
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);

        // Load the PDF document
        const loadingTask = window.pdfjsLib.getDocument(typedarray);
        const pdf = await loadingTask.promise;

        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 15); // Limit to first 15 pages to save tokens/time for long specs

        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(' ');
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        resolve(fullText);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        reject(new Error('Failed to extract text from PDF. The file might be corrupted or password protected.'));
      }
    };

    fileReader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    fileReader.readAsArrayBuffer(file);
  });
};