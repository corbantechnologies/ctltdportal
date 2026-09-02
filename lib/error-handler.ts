/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Formats Django REST Framework validation errors into a human-readable string for toasts.
 * Handles field-specific errors and non_field_errors.
 */
export const formatBackendError = (error: any, defaultMessage: string = "An unexpected error occurred"): string => {
  const data = error?.response?.data;

  if (!data) return defaultMessage;

  // Handle case where data is a string (e.g., HTML error response or simple message)
  if (typeof data === "string") {
    // Basic check for HTML
    if (data.includes("<!DOCTYPE html>") || data.includes("<html>")) {
      return defaultMessage;
    }
    return data;
  }

  // Handle standard DRF error object
  if (typeof data === "object") {
    const errorMessages: string[] = [];

    Object.entries(data).forEach(([key, value]) => {
      // Format field name (capitalize and replace underscores)
      const fieldName = key === "non_field_errors" || key === "detail" 
        ? "" 
        : `${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}: `;

      // Format value (can be string or array of strings)
      let message = "";
      if (Array.isArray(value)) {
        message = value.join(", ");
      } else if (typeof value === "string") {
        message = value;
      } else if (typeof value === "object" && value !== null) {
        // Handle nested error objects recursively if needed, 
        // but for now just stringify to avoid [object Object]
        message = JSON.stringify(value);
      }

      if (message) {
        errorMessages.push(`${fieldName}${message}`);
      }
    });

    return errorMessages.length > 0 ? errorMessages.join("\n") : defaultMessage;
  }

  return defaultMessage;
};
