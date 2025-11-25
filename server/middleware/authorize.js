const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses' });
        }
        next();
    };
};

module.exports = authorize;