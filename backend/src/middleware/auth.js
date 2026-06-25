import jwt from 'jsonwebtoken';

export const authenticateAdmin = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: "Access Denied. Please log in." });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid Authentication Token." });
    }
};

export const authenticateClient = (req, res, next) => {
    const token = req.cookies.client_token;
    if (!token) return res.status(401).json({ error: "Access Denied. Please log in." });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.client = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid Authentication Token." });
    }
};
