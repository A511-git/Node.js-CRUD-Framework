import { STATUS_CODES, DatabaseError } from "./app-errors.js";

export const MapMongoError = (error) => {

    if (error?.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0];
        return new DatabaseError({
            name: "DUPLICATE_KEY",
            statusCode: STATUS_CODES.BAD_REQUEST,
            description: `${field} already exists`,
            cause: error,
            metadata: {
                field,
                value: error.keyValue?.[field],
            },
        });
    }

    if (error?.name === "CastError") {
        return new DatabaseError({
            name: "INVALID_ID",
            statusCode: STATUS_CODES.BAD_REQUEST,
            description: `Invalid ${error.path}`,
            cause: error,
            metadata: {
                path: error.path,
                value: error.value,
            },
        });
    }

    if (error?.name === "ValidationError") {
        const errors = Object.values(error.errors || {}).map(err => ({
            field: err.path,
            message: err.message,
        }));

        return new DatabaseError({
            name: "DB_VALIDATION_ERROR",
            statusCode: STATUS_CODES.BAD_REQUEST,
            description: "Invalid data for database schema",
            cause: error,
            metadata: errors,
        });
    }

    if (
        error?.codeName === "WriteConflict" ||
        error?.labels?.includes("TransientTransactionError")
    ) {
        return new DatabaseError({
            name: "WRITE_CONFLICT",
            statusCode: 409,
            description: "Database write conflict, retry operation",
            cause: error,
        });
    }

    if (
        error?.name === "MongoNetworkError" ||
        error?.name === "MongoTimeoutError" ||
        error?.labels?.includes("RetryableWriteError")
    ) {
        return new DatabaseError({
            name: "DATABASE_UNAVAILABLE",
            statusCode: STATUS_CODES.INTERNAL_ERROR,
            description: "Database temporarily unavailable",
            isOperational: false,
            cause: error,
        });
    }

    return new DatabaseError({
        cause: error,
    });
}
