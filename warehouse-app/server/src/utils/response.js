exports.success = (res, data, status = 200) => {
  res.status(status).json(data)
}

exports.error = (res, status, error_code, message, field_errors = []) => {
  res.status(status).json({
    error_code,
    message,
    ...(field_errors.length > 0 ? { field_errors } : {})
  })
}
