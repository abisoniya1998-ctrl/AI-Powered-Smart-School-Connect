export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? "Server error" : err.message,
  });
  if (status === 500) console.error(err);
};