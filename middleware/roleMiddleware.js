// Middleware untuk cek role admin
function adminOnly(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Akses khusus admin' });
}

// Middleware untuk cek role user (bukan admin)
function userOnly(req, res, next) {
    if (req.user && req.user.role === 'user') {
        return next();
    }
    return res.status(403).json({ message: 'Akses khusus user' });
}

// Middleware untuk admin atau user (default)
function adminOrUser(req, res, next) {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'user')) {
        return next();
    }
    return res.status(403).json({ message: 'Akses ditolak' });
}

module.exports = { adminOnly, userOnly, adminOrUser };
