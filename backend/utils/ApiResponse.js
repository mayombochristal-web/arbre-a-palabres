/**
 * Standardized API Response Wrapper
 * Ensures consistent response structure across the entire application.
 */
class ApiResponse {
    /**
     * @param {boolean} success - Operation success status
     * @param {any} data - Payload data
     * @param {string|null} message - Human readable message
     * @param {any|null} error - Error details
     */
    constructor(success, data = null, message = null, error = null) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }

    /**
     * Create a success response
     * @param {any} data 
     * @param {string} message 
     */
    static success(data, message = null) {
        return new ApiResponse(true, data, message, null);
    }

    /**
     * Create an error response
     * @param {string} message 
     * @param {any} error 
     */
    static error(message, error = null) {
        // En production, on évite d'envoyer la stack trace complète
        const errorDetails = process.env.NODE_ENV === 'production'
            ? (error?.message || error)
            : error;

        return new ApiResponse(false, null, message, errorDetails);
    }
}

module.exports = ApiResponse;
