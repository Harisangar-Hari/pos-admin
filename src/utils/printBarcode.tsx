// printBarcode.tsx
// Optimized for XP-356B thermal label printer - 38mm x 25mm labels
//
// Layout is 38mm wide x 25mm tall, matching the printer's confirmed
// paper size (checked in the browser print dialog's paper size dropdown).
// If labels still print sideways on the physical printer despite the
// print PREVIEW looking correct, that is a printer driver / OS paper
// orientation setting, or the physical label roll being loaded rotated -
// not something fixable from this HTML/CSS. Check:
//   - Windows: Printer Properties > Preferences > orientation/rotation
//   - macOS: Printer's own driver preferences
//   - The printer's own settings/DIP switches for label direction

export interface BarcodeLabelData {
  productName: string;
  barcode: string;
  price?: number;
  copies?: number;
}

function buildBarcodeHTML(data: BarcodeLabelData): string {
  const copies = data.copies && data.copies > 0 ? data.copies : 1;

  // IMPORTANT: previously this omitted `unit`, so width=1.8/height=40 were
  // being interpreted as millimeters - producing a barcode image roughly
  // 40mm tall (bigger than the whole 25mm label!), which is why it kept
  // rendering as a tiny cropped sliver and forced content onto a 2nd page.
  // Now we request it in pixels, sized for ~8mm bar height at 203dpi, so
  // the image arrives close to its final on-label size instead of needing
  // huge CSS downscaling.
  const barcodeImageUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
    data.barcode
  )}&code=Code128&dpi=203&unit=Px&modulewidth=2&height=64&showtext=false`;

  const labels = Array.from({ length: copies }).map((_, index) => `
    <div class="page ${index === copies - 1 ? 'last' : ''}">
      <div class="label">
        <p class="shop">KARRALI</p>
        <img class="barcode" src="${barcodeImageUrl}" alt="Barcode" />
        <p class="name">${data.productName}</p>
        ${data.price !== undefined ? `<p class="price">Rs ${data.price.toFixed(2)}</p>` : ""}
      </div>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Barcode Label - ${data.productName}</title>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Confirmed via the print dialog's paper size dropdown: the printer's
     actual configured page is 38mm wide x 25mm tall (landscape). Content
     is laid out to match that directly - no CSS rotation needed. */
  @page {
    size: 38mm 25mm;
    margin: 0 !important;
  }

  html, body {
    font-family: 'Courier New', Courier, monospace;
    color: #000 !important;
    background: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 38mm;
    height: 25mm;
  }

  /* One .page per physical label sheet - matches @page size exactly.
     No rotation - this matches the printer's confirmed 38x25mm paper. */
  .page {
    width: 38mm;
    height: 25mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    page-break-after: always;
    page-break-inside: avoid;
    margin: 0 !important;
    padding: 0.5mm 0.8mm !important;
    box-sizing: border-box;
  }

  .page.last {
    page-break-after: auto;
  }

  .label {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .shop {
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 2px;
    line-height: 1;
    margin: 0;
    padding: 0;
    color: #1a1a1a;
    flex-shrink: 0;
  }

  .barcode {
    /* original size - not stretched */
    width: auto;
    height: auto;
    max-width: 34mm;
    max-height: 13mm;
    display: block;
    margin: 1px 0;
    padding: 0;
    image-rendering: auto;
    flex-shrink: 0;
  }

  .name {
    font-size: 13px;
    font-weight: bold;
    line-height: 1.2;
    max-width: 36mm;
    margin: 1px 0;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #1a1a1a;
    text-align: center;
    flex-shrink: 0;
  }

  .price {
    font-size: 13px;
    font-weight: bold;
    color: #0B6E4F;
    margin: 1px 0 0 0;
    padding: 0;
    flex-shrink: 0;
  }

  @media print {
    @page {
      size: 38mm 25mm;
      margin: 0 !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 38mm;
      height: 25mm !important;
    }

    .page {
      width: 38mm;
      height: 25mm;
      margin: 0 !important;
      padding: 0.5mm 0.8mm !important;
      overflow: hidden;
      page-break-after: always !important;
      page-break-inside: avoid !important;
    }

    .page.last {
      page-break-after: auto !important;
    }

    .barcode {
      max-width: 34mm;
      max-height: 11mm;
    }
  }

  /* Preview on screen: same 38x25mm layout, just with visual chrome
     (background/shadow) added so multiple labels are easy to see */
  @media screen {
    html, body {
      width: auto;
      height: auto;
    }

    body {
      background: #f0f0f0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .page {
      width: 38mm;
      height: 25mm;
      background: #ffffff;
      margin: 5px auto !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 2px;
      border: 1px dashed #ccc;
      page-break-after: avoid;
    }

    .label {
      width: 38mm;
      height: 25mm;
      padding: 0.5mm 0.5mm;
    }
  }
</style>
</head>
<body>

${labels}

<script>
  function waitForImagesAndPrint() {
    const images = document.querySelectorAll('.barcode');
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      doPrint();
      return;
    }

    function checkImageLoaded() {
      loadedCount++;
      if (loadedCount === totalImages) {
        doPrint();
      }
    }

    images.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        checkImageLoaded();
      } else {
        img.onload = checkImageLoaded;
        img.onerror = function() {
          console.warn('Failed to load barcode image');
          checkImageLoaded();
        };
        if (img.complete) {
          img.src = img.src;
        }
      }
    });

    setTimeout(() => {
      if (loadedCount < totalImages) {
        console.warn('Some images failed to load, printing anyway');
        doPrint();
      }
    }, 3000);
  }

  function doPrint() {
    window.focus();
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          window.print();
        });
      });
    });
  }

  if (document.readyState === 'complete') {
    waitForImagesAndPrint();
  } else {
    window.addEventListener('load', waitForImagesAndPrint);
  }
</script>
</body>
</html>`;
}

export async function printBarcode(data: BarcodeLabelData): Promise<void> {
  try {
    if (!data.barcode) {
      throw new Error('Barcode is required');
    }
    if (!data.productName) {
      throw new Error('Product name is required');
    }

    const html = buildBarcodeHTML(data);

    const blob = new Blob([html], {
      type: "text/html;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    const win = window.open(url, "_blank", "width=400,height=600,menubar=yes,toolbar=yes");

    if (win) {
      win.addEventListener("load", () => {
        URL.revokeObjectURL(url);
      });
      win.focus();
    } else {
      const fallbackWin = window.open(url, "_blank");
      if (!fallbackWin) {
        alert('Please allow popups to print barcode labels');
      }
    }
  } catch (error) {
    console.error('Print barcode error:', error);
    alert('Failed to print barcode: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function testPrintBarcode(): Promise<void> {
  await printBarcode({
    productName: "LED Light 10W",
    barcode: "8901234567890",
    price: 150,
    copies: 2,
  });
}