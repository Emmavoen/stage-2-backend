class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details: any;

  /**
   * @param statusCode The HTTP status code
   * @param message The error message
   * @param details Optional details or validation errors
   */
  constructor(statusCode: number, message: string, details: any = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // --- Static Methods for Common Errors ---

  /**
   * Creates a 400 Bad Request error.
   * @param message Error message
   * @param details Optional validation details
   */
  public static badRequest(message = "Bad Request", details?: any): ApiError {
    return new ApiError(400, message, details);
  }

  /**
   * Creates a 401 Unauthorized error.
   * @param message Error message
   */
  public static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  /**
   * Creates a 403 Forbidden error.
   * @param message Error message
   */
  public static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  /**
   * Creates a 404 Not Found error.
   * @param message Error message
   */
  public static notFound(message = "Not Found"): ApiError {
    return new ApiError(404, message);
  }

  /**
   * Creates a 500 Internal Server Error.
   * @param message Error message
   */
  public static internal(message = "Internal Server Error"): ApiError {
    return new ApiError(500, message);
  }
}

export default ApiError;
