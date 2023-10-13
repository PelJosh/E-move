"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET;
const authenticateToken = function (req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            name: 'MissingTokenError',
            message: 'No token was provided'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = decoded._id;
        if (!user) {
            return res.status(400).json({ error: "Invalid token" });
        }
        req.user = user;
        next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                name: 'ExpiredTokenError'
            });
        }
        res.status(400).json({
            name: 'Provide a Valid Token',
            message: err.message
        });
    }
};
exports.authenticateToken = authenticateToken;
