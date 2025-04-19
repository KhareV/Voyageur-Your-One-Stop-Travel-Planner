/**
 * Handles API errors for travel services
 *
 * @param {Error} error - The error from the API call
 * @returns {Object} - Error information with appropriate user messages
 */
export const handleTravelApiError = (error) => {
  console.error("Travel API error:", error);

  // Default error info
  let errorInfo = {
    message: "An unexpected error occurred. Please try again later.",
    isCritical: false,
    statusCode: null,
    useCached: true,
  };

  // Handle specific HTTP error codes
  if (error?.response?.status) {
    const status = error.response.status;
    errorInfo.statusCode = status;

    switch (status) {
      case 403:
        errorInfo.message =
          "Access to travel data is currently restricted. Please try again later.";
        break;
      case 429:
        errorInfo.message =
          "We've reached our limit with the travel API. Please try again in a few minutes.";
        break;
      case 404:
        errorInfo.message =
          "The requested travel information could not be found.";
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorInfo.message =
          "Our travel data service is currently unavailable. Please try again later.";
        errorInfo.isCritical = true;
        break;
    }
  } else if (error.message && error.message.includes("ERR_NAME_NOT_RESOLVED")) {
    errorInfo.message =
      "Network error: Could not connect to travel data provider.";
    errorInfo.isCritical = true;
  }

  return errorInfo;
};

/**
 * Formats a transport option to include error info when needed
 *
 * @param {Object} option - The transport option data
 * @param {Boolean} hasError - Whether there was an API error
 * @returns {Object} - Transport option with error flag if needed
 */
export const prepareTransportOption = (option, hasError = false) => {
  return {
    ...option,
    apiError: hasError,
  };
};
