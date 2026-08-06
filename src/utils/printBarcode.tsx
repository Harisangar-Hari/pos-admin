interface BarcodeLabelData {
  barcode: string;
  productName: string;
  price?: string;
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'UPC' | 'ITF';
  companyName?: string;
  width?: number;
  height?: number;
  copies?: number;
}

function buildBarcodeHTML(data: BarcodeLabelData): string {
  const companyName = data.companyName || 'Karrali';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Barcode Label - ${companyName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f0f0;
          font-family: Arial, Helvetica, sans-serif;
          margin: 0;
          padding: 0;
        }
        
        /* Page size: 38mm x 25mm */
        @page {
          size: 38mm 25mm;
          margin: 0;
        }
        
        .label-container {
          width: 38mm;
          height: 25mm;
          padding: 1.5mm 2mm;
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.8mm;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border: 0.5mm solid #e0e0e0;
          border-radius: 0.5mm;
          overflow: hidden;
        }
        
        /* Company Name - Top */
        .company-name {
          font-size: 2.2mm;
          font-weight: bold;
          color: #1a1a1a;
          letter-spacing: 0.5mm;
          text-transform: uppercase;
          width: 100%;
          text-align: center;
          border-bottom: 0.4mm solid #333;
          padding-bottom: 0.5mm;
          flex-shrink: 0;
        }
        
        /* Barcode Section - Middle */
        .barcode-section {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 0.5mm 0;
          flex-shrink: 0;
        }
        
        #barcode {
          width: 100%;
          height: auto;
          max-height: 8mm;
        }
        
        /* Barcode Text (numbers below barcode) */
        .barcode-text {
          font-size: 1.2mm;
          font-family: 'Courier New', monospace;
          color: #333;
          text-align: center;
          letter-spacing: 0.3mm;
          margin-top: -0.3mm;
          flex-shrink: 0;
        }
        
        /* Price - Below Barcode */
        .price {
          font-size: 2.5mm;
          font-weight: bold;
          color: #c0392b;
          background: #fdf2f2;
          padding: 0.3mm 1.5mm;
          border-radius: 0.5mm;
          border: 0.3mm solid #f5c6cb;
          text-align: center;
          flex-shrink: 0;
          min-width: 8mm;
        }
        
        /* Product Name - Bottom */
        .product-name {
          font-size: 1.6mm;
          font-weight: 600;
          color: #2c3e50;
          text-align: center;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0.3mm 0;
          border-top: 0.3mm solid #eee;
          margin-top: 0.3mm;
          flex-shrink: 0;
        }
        
        /* Print styles */
        @media print {
          html, body {
            margin: 0;
            padding: 0;
            min-height: auto;
            background: white;
          }
          
          body {
            display: block;
            background: white;
          }
          
          .label-container {
            box-shadow: none;
            border: 0.3mm solid #ccc;
            border-radius: 0;
            width: 38mm;
            height: 25mm;
            padding: 1.5mm 2mm;
            margin: 0;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          
          .no-print {
            display: none !important;
          }
        }
        
        /* Screen styles */
        .no-print {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          background: white;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          z-index: 999;
        }
        
        .no-print button {
          padding: 10px 24px;
          font-size: 14px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
          font-weight: bold;
        }
        
        .no-print .print-btn {
          background: #2c3e50;
          color: white;
        }
        
        .no-print .close-btn {
          background: #95a5a6;
          color: white;
        }
        
        .no-print .info-text {
          margin-top: 6px;
          font-size: 11px;
          color: #7f8c8d;
        }
        
        /* Handle very small screens */
        @media screen and (max-width: 100px) {
          .label-container {
            transform: scale(0.8);
          }
        }
      </style>
    </head>
    <body>
      <div class="label-container">
        <!-- Company Name at Top -->
        <div class="company-name">${escapeHtml(companyName)}</div>
        
        <!-- Barcode in Middle -->
        <div class="barcode-section">
          <svg id="barcode"></svg>
        </div>
        
        <!-- Barcode Number Below -->
        <div class="barcode-text">${escapeHtml(data.barcode)}</div>
        
        <!-- Price Below Barcode -->
        ${data.price ? `<div class="price">${escapeHtml(data.price)}</div>` : ''}
        
        <!-- Product Name at Bottom -->
        <div class="product-name">${escapeHtml(data.productName)}</div>
      </div>
      
      <!-- Print Controls -->
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Print Label</button>
        <button class="close-btn" onclick="window.close()">Close</button>
        <p class="info-text">Label Size: 38mm × 25mm</p>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
      <script>
        (function() {
          try {
            const barcodeValue = "${escapeHtml(data.barcode)}";
            const format = "${data.format || 'CODE128'}";
            
            // Calculate optimal barcode size for 38x25mm label
            const barcodeLength = barcodeValue.length;
            let barWidth = 0.2;
            let barHeight = 6;
            let fontSize = 0.9;
            
            if (barcodeLength > 12) {
              barWidth = 0.15;
              barHeight = 5.5;
              fontSize = 0.7;
            } else if (barcodeLength < 8) {
              barWidth = 0.28;
              barHeight = 7;
              fontSize = 1.1;
            }
            
            JsBarcode("#barcode", barcodeValue, {
              format: format,
              width: barWidth,
              height: barHeight,
              displayValue: false, // We show text separately
              fontSize: fontSize,
              font: "monospace",
              textMargin: 0,
              margin: 0,
              background: "#ffffff",
              lineColor: "#000000",
              valid: function(valid) {
                if (!valid) {
                  console.warn('Invalid barcode format');
                }
              }
            });
            
            // Auto-print after delay
            setTimeout(() => {
              window.print();
            }, 800);
          } catch (error) {
            console.error('Barcode generation error:', error);
            document.querySelector('.barcode-section').innerHTML = 
              '<p style="color:red;font-size:1.5mm;text-align:center;">⚠️ Error</p>';
          }
        })();
      </script>
    </body>
    </html>
  `;
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export async function printBarcode(data: BarcodeLabelData): Promise<void> {
  try {
    if (!data.barcode) {
      throw new Error('Barcode is required');
    }
    if (!data.productName) {
      throw new Error('Product name is required');
    }

    // Validate barcode format
    const cleanedBarcode = data.barcode.replace(/\s/g, '');
    if (!/^[0-9A-Za-z\-_]+$/.test(cleanedBarcode)) {
      throw new Error('Barcode contains invalid characters');
    }

    const html = buildBarcodeHTML(data);

    const blob = new Blob([html], {
      type: "text/html;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    // Open in a new window with print-optimized settings
    const win = window.open(
      url,
      "_blank",
      "width=400,height=700,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes"
    );

    if (win) {
      win.addEventListener("load", () => {
        URL.revokeObjectURL(url);
        win.focus();

        // Trigger print after full load
        setTimeout(() => {
          try {
            win.print();
          } catch (printError) {
            console.error('Print error:', printError);
          }
        }, 1200);
      });

      win.addEventListener("beforeunload", () => {
        URL.revokeObjectURL(url);
      });

    } else {
      // Fallback if popup is blocked
      const fallbackWin = window.open(url, "_blank");
      if (!fallbackWin) {
        alert('Please allow popups to print barcode labels');
        downloadAsHTML(html, `barcode-${data.barcode}.html`);
      }
    }
  } catch (error) {
    console.error('Print barcode error:', error);
    alert('Failed to print barcode: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Fallback download function
function downloadAsHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}