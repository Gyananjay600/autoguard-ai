/**
 * Global centralized error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
}
