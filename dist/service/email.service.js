"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordService = exports.getPasswordResetService = exports.requestPasswordResetService = void 0;
const tokenModel_1 = __importDefault(require("../DBmodels/tokenModel"));
const userModel_1 = __importDefault(require("../DBmodels/userModel"));
const crypto_1 = __importDefault(require("crypto"));
const email_config_1 = __importDefault(require("../utils/email.config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const saltRounds = parseInt(process.env.SALT_ROUNDS || '');
const requestPasswordResetService = async (email) => {
    const user = await userModel_1.default.findOne({ email });
    if (!user)
        throw new Error('User does not exist');
    let token = await tokenModel_1.default.findOne({ userId: user._id });
    if (token)
        await token.deleteOne();
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt_1.default.hash(resetToken, 8);
    token = new tokenModel_1.default({
        userId: user._id,
        token: hashedToken
    });
    await token.save();
    const link = `http://localhost:3000/api/v1/users/get-password/${user._id.toString()}/${resetToken}`;
    const html = `<h1>Reset Password</h1>
  <h2>Hello ${user.fullName}</h2>
  <p>Please, click on link below to reset</p>
  <div>
  <a href=${link}>reset password</a>
  </div>`;
    await (0, email_config_1.default)(user.email, 'Forgot Password', html);
    return {
        success: true,
        userId: user._id,
        resetToken,
        message: 'Check your mail for Email Verification'
    };
};
exports.requestPasswordResetService = requestPasswordResetService;
const getPasswordResetService = async (userId, token) => {
    const resetPasswordToken = await tokenModel_1.default.findOne({ userId });
    if (!resetPasswordToken) {
        throw new Error('Invalid or expired token');
    }
    const isMatch = await bcrypt_1.default.compare(token, resetPasswordToken.token);
    if (!isMatch) {
        throw new Error('invalid or expired password reset token');
    }
    return resetPasswordToken;
};
exports.getPasswordResetService = getPasswordResetService;
const resetPasswordService = async (userId, newPassword) => {
    if (newPassword.password !== newPassword.confirmPassword)
        throw new Error('Passwords dose not match');
    const newHashedPassword = await bcrypt_1.default.hash(newPassword.password, saltRounds);
    const user = await userModel_1.default.findById({ _id: userId });
    if (!user)
        throw new Error('User not found');
    const token = await tokenModel_1.default.findOne({ userId });
    if (!token)
        throw new Error('Invalid token');
    await userModel_1.default.updateOne({ _id: userId }, { $set: { password: newHashedPassword } });
    const html = `<h1>Reset Password</h1>
    <p>Password reset successful</p>
    `;
    await (0, email_config_1.default)(user.email, 'Password Reset', html);
    await token.deleteOne();
    return user;
};
exports.resetPasswordService = resetPasswordService;
