export function confirmLogin(req, res, next) {
if (!req.session.user) {
  return res.status(401).json({ error: locale.NOT_AUTHENTICATED });
    }
    req.user = req.session.user;
    next();
}