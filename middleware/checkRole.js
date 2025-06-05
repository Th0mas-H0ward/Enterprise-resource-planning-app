module.exports = function(allowedRoles) {
  return function(req, res, next) {
    if (req.isAuthenticated() && allowedRoles.includes(req.user.role)) {
      return next();
    }
    res.status(403).send('Access denied');
  }
}