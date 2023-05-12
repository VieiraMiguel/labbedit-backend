import { BaseError } from "./BaseError";

export class NotFoundError extends BaseError {

  constructor(message: string = "Requested resource not found") {

    super(404, message)
  }
}