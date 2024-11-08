export class BaseError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export class UserExistError extends BaseError {
  constructor() {
    super('Email already signed up', 400);
  }
}
export class UserNotFoundError extends BaseError {
  constructor() {
    super('Email not signed up', 404);
  }
}
export class NoTokenError extends BaseError {
  constructor() {
    super('Client error - No token provided', 401);
  }
}

export class WrongTokenError extends BaseError {
  constructor() {
    super('Client error - Invalid token', 403);
  }
}
export class WrongPasswordError extends BaseError {
  constructor() {
    super('Client error - wrong password', 403);
  }
}

export class InputEmptyError extends BaseError {
  constructor() {
    super('Client error - Input field should not be empty', 400);
  }
}

export class InvalidInputError extends BaseError {
  constructor(message: string) {
    super(`Client error - Invalid input: ${message}`, 400);
  }
}
export class DatabaseError extends BaseError {
  constructor() {
    super('Database Error', 500);
  }
}
