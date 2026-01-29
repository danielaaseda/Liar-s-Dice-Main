export function confirmLogin(req, res, next) {
    if(!req.session?.user) {
        return res.status(401).json("login required!");
    }
    req.user = req.session.user;
    next();
}