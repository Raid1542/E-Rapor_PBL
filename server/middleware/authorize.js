const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses' });
        }

        // 🔁 Normalisasi: flatten array jika perlu
        let rolesArray = [];
        for (const role of allowedRoles) {
            if (Array.isArray(role)) {
                rolesArray.push(...role);
            } else {
                rolesArray.push(role);
            }
        }

        const normalizedUserRole = userRole.toLowerCase();
        const normalizedAllowedRoles = rolesArray.map(r => r.toLowerCase());

        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses' });
        }

        next();
    };
};

module.exports = authorize;