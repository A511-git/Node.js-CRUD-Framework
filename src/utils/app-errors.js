const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UN_AUTHORISED: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

class AppError extends Error {
  constructor(name, statusCode, description, isOperational = true, errorStack) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorStack = errorStack;

    Error.captureStackTrace(this);
  }
}


class APIError extends AppError {
  constructor(
    name = "API_ERROR",
    statusCode = STATUS_CODES.INTERNAL_ERROR,
    description = "Internal Server Error"
  ) {
    super(name, statusCode, description, true);
  }
}

class BadRequestError extends AppError {
  constructor(description = "Bad Request") {
    super(
      "BAD_REQUEST",
      STATUS_CODES.BAD_REQUEST,
      description,
      true
    );
  }
}

class ValidationError extends AppError {
  constructor(description = "Validation Error", errorStack) {
    super(
      "VALIDATION_ERROR",
      STATUS_CODES.BAD_REQUEST,
      description,
      true,
      errorStack
    );
  }
}


class DatabaseError extends AppError {
  constructor({
    name = "DATABASE_ERROR",
    statusCode = STATUS_CODES.INTERNAL_ERROR,
    description = "Database operation failed",
    cause = null,
    metadata = null,
    isOperational = true,
  }) {
    super(name, statusCode, description, isOperational);
    this.cause = cause;
    this.metadata = metadata;
    this.description = description;
  
  }
}

class UnauthorizedError extends AppError {
  constructor(statusCode,description = "Unauthorized") {
    super(
      "UNAUTHORIZED",
      STATUS_CODES.UN_AUTHORISED,
      description,
      true
    );
    this.statusCode = statusCode || STATUS_CODES.UN_AUTHORISED;
    this.description = description;
  }
}

class NotFoundError extends AppError {
  constructor(description = "Not Found") {
    super(
      "NOT_FOUND",
      STATUS_CODES.NOT_FOUND,
      description,
      true
    );
  }
}






export {
  AppError,
  APIError,
  BadRequestError,
  ValidationError,
  DatabaseError,
  UnauthorizedError,
  NotFoundError,
  STATUS_CODES,
};


