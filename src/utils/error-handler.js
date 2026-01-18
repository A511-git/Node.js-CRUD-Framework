import { AppError } from './app-errors.js'

const ErrorHandler = async (err, req, res, next) => {

    let statusCode = err.statusCode || 500;
    let message = err.description || "Internal Server Error";

    if (err instanceof AppError && err.isOperational) {
        console.error("OPERATIONAL ERROR", {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
            cause: err?.cause,
        });

        return res.status(statusCode).json({
            success: false,
            error: {
                name: err.name,
                message,
                stack: err?.errorStack,
            },
        });
    }


    console.error("NON-OPERATIONAL ERROR", {
        message: err.message,
        stack: err.stack,
        cause: err.cause,
    });

    return res.status(500).json({
        success: false,
        error: {
            name: "INTERNAL_ERROR",
            message: "Something went wrong",
        },
    });
}
export { ErrorHandler }