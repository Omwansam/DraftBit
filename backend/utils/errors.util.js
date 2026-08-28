/**
 * One error type for every deliberate failure.
 *
 * Throwing these from a controller is what lets the async wrapper and the
 * error middleware turn a business rule into a correct status code without
 * every handler hand-rolling a res.status(...).json(...) of its own.
 */
class ApiError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        if (details) this.details = details;
    }

    static badRequest(message = 'That request was not valid.', details) {
        return new ApiError(400, message, details);
    }

    static unauthorized(message = 'Please sign in to continue.') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'You do not have permission to do that.') {
        return new ApiError(403, message);
    }

    static notFound(message = 'That record no longer exists.') {
        return new ApiError(404, message);
    }

    static conflict(message = 'That conflicts with something that already exists.') {
        return new ApiError(409, message);
    }
}

/**
 * Wraps an async handler so a rejected promise reaches the error middleware.
 *
 * Express 5 forwards rejections on its own, but wrapping keeps the behaviour
 * explicit and identical for the sync handlers mixed in alongside them.
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ApiError, asyncHandler };
