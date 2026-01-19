// Centralized error handler to ensure consistent response shape
// Must be the last middleware registered in Express pipeline
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  const payload = {
    message,
    ...(req.traceId ? { traceId: req.traceId } : {}),
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  };

  // Intentionally avoid exposing internal error details in production
  return res.status(statusCode).json(payload);
};

module.exports = errorMiddleware;
