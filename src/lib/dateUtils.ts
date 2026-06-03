/**
 * Safely formats a date value, handling null, undefined, invalid dates, and Prisma objects
 */
export function formatDate(
  date: string | Date | null | undefined | any,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "N/A";
  
  try {
    let dateObj: Date;

    // Handle plain objects (Prisma sometimes returns dates as objects)
    if (typeof date === 'object' && !(date instanceof Date)) {
      // Try to extract date from object properties
      if (date.$date) {
        dateObj = new Date(date.$date);
      } else if (date.toISOString) {
        dateObj = new Date(date.toISOString());
      } else if (date.toString && date.toString() !== '[object Object]') {
        dateObj = new Date(date.toString());
      } else {
        console.error('[formatDate] Unsupported object format:', date);
        return "N/A";
      }
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      console.error('[formatDate] Unsupported date type:', typeof date, date);
      return "N/A";
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('[formatDate] Invalid date after parsing:', date);
      return "N/A";
    }
    
    return dateObj.toLocaleDateString("en-US", options || {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error('[formatDate] Error:', error, 'Input:', date);
    return "N/A";
  }
}

/**
 * Checks if a date value is valid
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}

/**
 * Formats a date for display in payment contexts
 */
export function formatPaymentDate(
  paidDate: string | Date | null | undefined,
  createdAt?: string | Date | null | undefined
): string {
  if (isValidDate(paidDate)) {
    return formatDate(paidDate);
  }
  
  if (isValidDate(createdAt)) {
    return formatDate(createdAt);
  }
  
  return "N/A";
}
