import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format mobile number for display
export function formatMobile(mobile: string): string {
  if (!mobile) return '';
  
  // Remove any non-digit characters except +
  const cleaned = mobile.replace(/[^\d+]/g, '');
  
  // Format Saudi mobile numbers
  if (cleaned.startsWith('+9665')) {
    return cleaned.replace(/(\+966)(5\d{8})/, '$1-$2');
  }
  
  if (cleaned.startsWith('05')) {
    return cleaned.replace(/(05)(\d{8})/, '0$5-$2');
  }
  
  return cleaned;
}

// Validate Saudi mobile number
export function validateSaudiMobile(mobile: string): boolean {
  const cleaned = mobile.replace(/[^\d+]/g, '');
  
  // Accept formats: +9665xxxxxxxx, 05xxxxxxxx, 5xxxxxxxx
  const saudiMobileRegex = /^(\+9665|05|5)\d{8}$/;
  return saudiMobileRegex.test(cleaned);
}

// Generate reference number
export function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const sequence = Math.floor(Math.random() * 900000) + 100000;
  return `REG-${year}-${sequence}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Scroll to element
export function scrollToElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (fallbackErr) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}