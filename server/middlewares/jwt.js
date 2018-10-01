const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (req.method !== 'POST') {
        next();
    } else {
        const token = req.headers.accesstoken | req.body.token | req.query.token;
        if (token) {
            jwt.verify(token, 'mattxu_tomato', (err, decoded) => {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Invalid token'
                    })
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            return res.json({
                success: false,
                message: 'No token provided'
            });
        }
    }
}