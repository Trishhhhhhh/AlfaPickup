// lib/printService.js

export class PrintService {
  static detectPDAType() {
    // Check for different PDA types
    if (typeof window !== 'undefined') {
      // Check for Android WebView interface
      if (window.Android && typeof window.Android.printText === 'function') {
        return 'android_webview';
      }
      
      // Check for other common PDA interfaces
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.printer) {
        return 'webkit_printer';
      }
      
      // Check for printer object in window
      if (window.printer && typeof window.printer.print === 'function') {
        return 'window_printer';
      }
      
      // Check for thermal printer in window
      if (window.thermalPrinter && typeof window.thermalPrinter.print === 'function') {
        return 'thermal_printer';
      }
      
      // Check if running on mobile device
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('mobile') || userAgent.includes('android')) {
        return 'mobile_browser';
      }
    }
    
    return 'development';
  }

  static formatReceipt(orderData) {
    const lines = [];
    const SEPARATOR = '-'.repeat(32);
    
    // Header
    lines.push('         AlfaPickup');
    lines.push('      Order Receipt');
    lines.push(`Order #: ${orderData.id}`);
    lines.push(`Customer: ${orderData.customerName}`);
    lines.push(`Phone: ${orderData.customerPhone}`);
    lines.push(`Date: ${new Date().toLocaleString('en-PH')}`);
    lines.push(SEPARATOR);
    
    // Items
    orderData.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      lines.push(`${item.name}`);
      lines.push(`  ${item.quantity}x @ ₱${item.price} = ₱${itemTotal}`);
    });
    
    lines.push(SEPARATOR);
    lines.push(`TOTAL: ₱${orderData.total}`);
    lines.push(SEPARATOR);
    lines.push('    Thank you for your order!');
    lines.push('       Please come again!');
    
    return lines.join('\n');
  }

  static async printReceipt(orderData) {
    try {
      const receiptText = this.formatReceipt(orderData);
      const pdaType = this.detectPDAType();
      
      console.log('🔍 Detected PDA Type:', pdaType);
      console.log('🖨️ Attempting to print receipt...');
      
      switch (pdaType) {
        case 'android_webview':
          window.Android.printText(receiptText);
          console.log('✅ Printed via Android WebView');
          return true;
          
        case 'webkit_printer':
          window.webkit.messageHandlers.printer.postMessage({
            action: 'print',
            content: receiptText
          });
          console.log('✅ Printed via WebKit interface');
          return true;
          
        case 'window_printer':
          window.printer.print(receiptText);
          console.log('✅ Printed via window.printer');
          return true;
          
        case 'thermal_printer':
          window.thermalPrinter.print(receiptText);
          console.log('✅ Printed via thermal printer');
          return true;
          
        case 'mobile_browser':
          // Try to trigger native print dialog
          const printWindow = window.open('', '_blank');
          printWindow.document.write(`
            <html>
              <head><title>Receipt</title></head>
              <body>
                <pre style="font-family: monospace; font-size: 12px; white-space: pre-wrap;">
                  ${receiptText}
                </pre>
                <script>
                  window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
          console.log('✅ Opened print dialog');
          return true;
          
        default:
          // Development/fallback mode
          console.log('🖨️ === RECEIPT PRINT SIMULATION ===');
          console.log(`📍 Access from PDA: ${window.location.href}`);
          console.log('📄 Receipt Content:');
          console.log(receiptText);
          console.log('=== END RECEIPT ===');
          
          // Also try to show a popup with print option
          if (confirm('Receipt ready to print. Open print dialog?')) {
            const printContent = `
              <div style="font-family: monospace; font-size: 12px; white-space: pre-wrap; padding: 20px;">
                ${receiptText}
              </div>
            `;
            const printWindow = window.open('', '_blank', 'width=400,height=600');
            printWindow.document.write(`
              <html>
                <head>
                  <title>AlfaPickup Receipt</title>
                  <style>
                    body { margin: 0; padding: 20px; font-family: monospace; }
                    .receipt { font-size: 12px; white-space: pre-wrap; }
                  </style>
                </head>
                <body>
                  <div class="receipt">${receiptText}</div>
                  <script>
                    window.onload = function() {
                      window.print();
                    }
                  </script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
          return true;
      }
      
    } catch (error) {
      console.error('❌ Print failed:', error);
      console.log('🔧 Available window objects:', Object.keys(window).filter(key => 
        key.toLowerCase().includes('print') || 
        key.toLowerCase().includes('android') || 
        key.toLowerCase().includes('thermal')
      ));
      return false;
    }
  }

  // Debug function to help identify printer interfaces
  static debugPrinterInterfaces() {
    if (typeof window === 'undefined') {
      console.log('❌ Window object not available');
      return;
    }
    
    console.log('🔍 === PRINTER INTERFACE DEBUG ===');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🌍 Location:', window.location.href);
    console.log('🔧 Available window properties containing "print":', 
      Object.keys(window).filter(key => key.toLowerCase().includes('print'))
    );
    console.log('📱 Available window properties containing "android":', 
      Object.keys(window).filter(key => key.toLowerCase().includes('android'))
    );
    console.log('🖨️ Available window properties containing "thermal":', 
      Object.keys(window).filter(key => key.toLowerCase().includes('thermal'))
    );
    console.log('=== END DEBUG ===');
  }
}