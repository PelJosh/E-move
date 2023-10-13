"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userId = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET;
const userId = (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            name: 'MissingTokenError',
            message: 'No token was provided'
        });
    }
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    return decoded._id;
};
exports.userId = userId;
