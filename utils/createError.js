/**
 * Utility function to create error objects with status codes
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @returns {Error} - Error object with status and message
 */
exports.createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};