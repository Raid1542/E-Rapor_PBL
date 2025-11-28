const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses' });
        }

        // Konversi ke lowercase untuk perbandingan
        const normalizedUserRole = userRole.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses' });
        }

        next();
    };
};

module.exports = authorize;