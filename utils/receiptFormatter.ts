import { Order } from '@/types/receipt';

export class ReceiptFormatter {
  private static readonly LINE_WIDTH = 32;
  private static readonly SEPARATOR = '-'.repeat(25);

  static formatReceiptWithAlignment(order: Order): string {
    const lines: string[] = [];
    
    // Header - centered
    lines.push(this.centerText('AlfaPickup'));
    lines.push('');
    
    // Order details
    lines.push(`Order #: ${order.id}`);
    lines.push(`Customer: ${this.truncateText(order.customerName, 20)}`);
    lines.push(`Phone: ${order.customerPhone}`);
    
    // Date
    const date = order.timestamp || (order.created_at ? new Date(order.created_at) : new Date());
    lines.push(`Date: ${date.toLocaleString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}`);
    
    lines.push(this.SEPARATOR);
    
    // Items with price alignment
    order.items.forEach(item => {
      const itemName = `${item.name} x${item.quantity}`;
      const price = `₱${item.price}`;
      const line = this.alignTextRight(itemName, price);
      lines.push(line);
    });
    
    lines.push(this.SEPARATOR);
    
    // Total - right aligned
    const totalLine = this.alignTextRight('TOTAL:', `₱${order.total}`);
    lines.push(totalLine);
    lines.push('');
    lines.push(this.centerText('Thank you!'));
    lines.push('');
    
    return lines.join('\n');
  }

  private static centerText(text: string): string {
    const padding = Math.max(0, Math.floor((this.LINE_WIDTH - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  private static alignTextRight(leftText: string, rightText: string): string {
    const totalLength = leftText.length + rightText.length;
    if (totalLength >= this.LINE_WIDTH) {
      return `${leftText} ${rightText}`;
    }
    const spaces = this.LINE_WIDTH - totalLength;
    return `${leftText}${' '.repeat(spaces)}${rightText}`;
  }

  private static truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }
}