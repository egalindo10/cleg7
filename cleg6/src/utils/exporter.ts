import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export async function exportLesson(
  idPrefix: string, 
  title: string, 
  format: "pdf" | "png",
  pageCount: number = 5
) {
  const container = document.getElementById(`${idPrefix}-container`);
  if (!container) return;

  // Temporarily move container to a visible but off-screen area to ensure rendering
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.zIndex = "-1";

  try {
    const canvases: HTMLCanvasElement[] = [];

    for (let i = 0; i < pageCount; i++) {
      const pageElement = document.getElementById(`${idPrefix}-page-${i}`);
      if (pageElement) {
        // Ensure element is visible for capture
        const originalDisplay = pageElement.style.display;
        pageElement.style.display = "block";
        
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 794,
          windowHeight: 1123,
          onclone: (clonedDoc) => {
            // Additional safety: remove any oklab/oklch colors in the clone if they exist
            const allElements = clonedDoc.getElementsByTagName("*");
            for (let j = 0; j < allElements.length; j++) {
              const el = allElements[j] as HTMLElement;
              if (el.style && el.style.color && (el.style.color.includes("oklab") || el.style.color.includes("oklch"))) {
                el.style.color = "#1a1a1a";
              }
            }
          }
        });
        
        pageElement.style.display = originalDisplay;
        canvases.push(canvas);
      }
    }

    if (format === "pdf") {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      canvases.forEach((canvas, index) => {
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (index > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      });

      pdf.save(`${title.replace(/\s+/g, "_")}.pdf`);
    } else {
      // Download each page as PNG
      canvases.forEach((canvas, index) => {
        const link = document.createElement("a");
        link.download = `${title.replace(/\s+/g, "_")}_Page_${index + 1}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    // Reset container
    container.style.position = "absolute";
    container.style.left = "-9999px";
  }
}
