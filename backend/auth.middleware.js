const jwt = require('jsonwebtoken');
const User = require('./auth/auth.dao');
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = {
    ensureAuthenticated: async function (req, res, next) {

        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ msg: 'Please log in to view that resource' });
        }

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = await User.findById(decoded.id);
            next();
        } catch (err) {
            return res.status(403).json({ msg: 'Invalid token' });
        }
    },

    authorizeRoles: function (...allowedRoles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ msg: 'Please log in to view that resource' });
            }

            const { cargo } = req.user;

            if (allowedRoles.includes(cargo)) {
                return next();
            } else {
                return res.status(403).json({ msg: 'You do not have permission to access this resource' });
            }
        };
    }
};