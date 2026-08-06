// printBarcode.tsx
// Prints individual barcode labels - one label per page/sticker
// Sized for 38mm × 25mm (3.8×2.5cm) sticker labels

export interface BarcodeLabelData {
  productName: string;
  barcode: string;
  price?: number;
  copies?: number;
}

function buildBarcodeHTML(data: BarcodeLabelData): string {
  const copies = data.copies && data.copies > 0 ? data.copies : 1;

  // Generate barcode image URL
  const barcodeImageUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
    data.barcode
  )}&code=Code128&dpi=96&height=30`;

  // Create individual pages for each label
  const labels = Array.from({ length: copies }).map(() => `
    <div class="page">
      <div class="label">
        <p class="shop">Karrali</p>
        <img class="barcode" src="${barcodeImageUrl}" alt="Barcode: ${data.barcode}" />
        <p class="name">${data.productName}</p>
        ${data.price !== undefined ? `<p class="price">Rs ${data.price.toFixed(2)}</p>` : ""}
        <p class="barcode-text">${data.barcode}</p>
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

  /* ── Page settings: exactly 38mm × 25mm ── */
  @page { 
    size: 38mm 25mm;
    margin: 0;
  }

  html, body {
    font-family: 'Courier New', Courier, monospace;
    color: #000 !important;
    background: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  /* ── Each page contains one label ── */
  .page {
    width: 38mm;
    height: 25mm;
    page-break-after: always;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
  }

  .page:last-child {
    page-break-after: auto;
  }

  /* ── Label content ── */
  .label {
    width: 38mm;
    height: 25mm;
    padding: 1.5mm 1mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-sizing: border-box;
    overflow: hidden;
  }

  .shop {
    font-size: 8px;
    font-weight: bold;
    letter-spacing: 0.5px;
    line-height: 1.2;
    margin-bottom: 1px;
    color: #1a1a1a;
  }

  .barcode {
    width: auto;
    height: 11mm;
    max-width: 34mm;
    display: block;
    margin: 1px 0;
    image-rendering: pixelated;
  }

  .name {
    font-size: 8px;
    font-weight: bold;
    line-height: 1.1;
    max-width: 36mm;
    word-break: break-word;
    margin: 1px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #1a1a1a;
  }

  .price {
    font-size: 8px;
    font-weight: bold;
    margin-top: 1px;
    color: #0B6E4F;
  }

  .barcode-text {
    font-size: 6px;
    font-weight: normal;
    margin-top: 0.5px;
    color: #666;
    letter-spacing: 0.3px;
  }

  /* ── Print-specific fixes ── */
  @media print {
    @page {
      size: 38mm 25mm;
      margin: 0;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }

    .page {
      page-break-after: always;
      page-break-inside: avoid;
    }

    .page:last-child {
      page-break-after: auto;
    }

    .label {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }

  /* ── Screen preview styling (optional) ── */
  @media screen {
    body {
      background: #f0f0f0;
      padding: 20px;
    }

    .page {
      background: #ffffff;
      margin: 10px auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 2px;
    }

    .label {
      border: 1px dashed #ccc;
    }
  }
</style>
</head>
<body>

${labels}

<script>
  // ── Wait for barcode images to load before printing ──
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
          console.warn('Failed to load barcode image:', img.src);
          checkImageLoaded();
        };
        // Force reload if cached
        if (img.complete) {
          img.src = img.src;
        }
      }
    });

    // Fallback: print anyway after timeout
    setTimeout(() => {
      if (loadedCount < totalImages) {
        console.warn('Some barcode images failed to load, printing anyway');
        doPrint();
      }
    }, 3000);
  }

  function doPrint() {
    // Ensure window is focused
    window.focus();
    
    // Use requestAnimationFrame to ensure rendering is complete
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          window.print();
          // Close window after printing (give time for print dialog)
          setTimeout(function() { 
            window.close(); 
          }, 3000);
        });
      });
    });
  }

  // ── Start the print process ──
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
    // Validate input
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

    // Open in new window
    const win = window.open(url, "_blank", "width=400,height=500");

    if (win) {
      win.addEventListener("load", () => {
        URL.revokeObjectURL(url);
      });
      win.focus();
    } else {
      // Popup blocked - try fallback
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

// ── Utility: Test print function ──
export async function testPrintBarcode(): Promise<void> {
  await printBarcode({
    productName: "LED Light 10W",
    barcode: "8901234567890",
    price: 150,
    copies: 2,
  });
}