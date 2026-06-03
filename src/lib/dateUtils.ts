/**
 * Safely formats a date value, handling null, undefined, and invalid dates
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  // Debug: Log what we're receiving
  if (process.env.NODE_ENV === 'development') {
    if (date === null) console.log('[formatDate] Received null');
    else if (date === undefined) console.log('[formatDate] Received undefined');
    else console.log('[formatDate] Received:', date, 'Type:', typeof date, 'Constructor:', date?.constructor?.name);
  }

  if (!date) return "N/A";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
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
