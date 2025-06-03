// Index file for API routes
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Barbachli API proxy is running',
    timestamp: new Date().toISOString()
  });
}; 