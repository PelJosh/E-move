"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordController = exports.getPasswordController = exports.requestPasswordResetController = void 0;
const email_service_1 = require("../service/email.service");
const userZod_1 = require("../utils/zod/userZod");
const requestPasswordResetController = async (req, res) => {
    try {
        const requestPasswordReset = await (0, email_service_1.requestPasswordResetService)(req.body.email);
        res.send(requestPasswordReset);
    }
    catch (error) {
        res.send({
            success: false,
            status: 'error',
            message: 'User not registered'
        });
    }
};
exports.requestPasswordResetController = requestPasswordResetController;
const getPasswordController = async (req, res) => {
    try {
        const getPasswordReset = await (0, email_service_1.getPasswordResetService)(req.params.userId, req.params.token);
        res
            .status(302)
            .redirect(`http://localhost:5173/#/resetpassword?userId=${req.params.userId}`);
        // res.send(getPasswordReset);
    }
    catch (error) {
        res.send({
            status: 'error',
            message: 'Invalid password reset link'
        });
    }
};
exports.getPasswordController = getPasswordController;
const resetPasswordController = async (req, res) => {
    const error = userZod_1.resetPasswordZod.safeParse(req.body);
    try {
        if (error.success === false) {
            return res.status(400).send({
                success: false,
                path: req.url,
                message: error.error.issues[0].message
            });
        }
        await (0, email_service_1.resetPasswordService)(req.params.id, req.body);
        res.status(200).send({
            success: true,
            status: 'success',
            message: 'Password Reset successful'
        });
    }
    catch (error) {
        res.status(401).send({
            success: false,
            status: 'error',
            message: 'Invalid password'
        });
    }
};
exports.resetPasswordController = resetPasswordController;
