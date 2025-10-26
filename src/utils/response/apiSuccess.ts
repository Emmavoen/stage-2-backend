import type { Response } from "express";

/**
 * A helper class to send standardized success responses.
 * This ensures all success responses follow the same structure.
 */
class ApiResponse {
  /**
   * Sends a 200 OK response.
   * @param res Express Response object
   * @param data The payload to send
   */
  public static ok(res: Response, data: any) {
    return res.status(200).json(data);
  }

  /**
   * Sends a 201 Created response.
   * @param res Express Response object
   * @param data The payload to send (often the created object)
   */
  public static created(res: Response, data: any) {
    return res.status(201).json(data);
  }

  /**
   * Sends a 204 No Content response.
   * Used for successful requests that don't return a body (like DELETE).
   * @param res Express Response object
   */
  public static noContent(res: Response) {
    return res.status(204).send();
  }
}

export default ApiResponse;
