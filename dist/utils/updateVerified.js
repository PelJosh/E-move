"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVerified = void 0;
const userModel_1 = __importDefault(require("../DBmodels/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET;
const updateVerified = async (req, res) => {
    try {
        const user = await userModel_1.default.findOne({
            _id: req.params.id
        });
        if (user?.isVerified === true) {
            return res.status(400).redirect('http://localhost:5173/#/login');
        }
        const token = req.params.token;
        const decoded = await jsonwebtoken_1.default.verify(token, secret);
        if (!decoded) {
            return res.status(400).send('Invalid or Expired Token');
        }
        if (!user) {
            return res.status(400).send('Invalid link');
        }
        await userModel_1.default.findByIdAndUpdate(user._id, { isVerified: true });
        // res.status(201).send({
        // 	status: 'success',
        // 	path: req.url,
        // 	message: `Email verified successfully`
        // });
        res.redirect('http://localhost:5173/#/login');
    }
    catch (error) {
        res.status(500).send({
            status: 'error',
            path: req.url,
            message: 'Something went wrong',
            success: false
        });
    }
};
exports.updateVerified = updateVerified;
