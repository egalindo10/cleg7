export function printExportPages(idPrefix: string, title = "Lesson Packet") {
  const ids = [
    `${idPrefix}-page-0`,
    `${idPrefix}-page-1`,
    `${idPrefix}-page-2`,
    `${idPrefix}-page-3`,
    `${idPrefix}-page-4`,
  ];

  const pagesHtml = ids
    .map((id) => {
      const el = document.getElementById(id);
      return el ? `<div class="page">${el.innerHTML}</div>` : "";
    })
    .join("");

  if (!pagesHtml) {
    alert("Nothing to print yet. Generate a lesson first.");
    return;
  }

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;

  w.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; background: #fff; }
          .page {
            width: 794px;
            height: 1123px;
            padding: 80px;
            box-sizing: border-box;
            page-break-after: always;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            color: #141414;
          }
          img { max-width: 100%; }
        </style>
      </head>
      <body>
        ${pagesHtml}
        <script>
          window.onload = () => { window.focus(); window.print(); };
        </script>
      </body>
    </html>
  `);

  w.document.close();
}

export function printStudentPacket(idPrefix: string, title = "Student Packet") {
  const ids = [
    `${idPrefix}-page-3`,
    `${idPrefix}-page-4`,
  ];

  const pagesHtml = ids
    .map((id) => {
      const el = document.getElementById(id);
      return el ? `<div class="page">${el.innerHTML}</div>` : "";
    })
    .join("");

  if (!pagesHtml) {
    alert("Nothing to print yet. Generate a lesson first.");
    return;
  }

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;

  w.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; background: #fff; }
          .page {
            width: 794px;
            height: 1123px;
            padding: 80px;
            box-sizing: border-box;
            page-break-after: always;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            color: #141414;
          }
          img { max-width: 100%; }
        </style>
      </head>
      <body>
        ${pagesHtml}
        <script>
          window.onload = () => { window.focus(); window.print(); };
        </script>
      </body>
    </html>
  `);

  w.document.close();
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}