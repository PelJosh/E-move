import Token from '../DBmodels/tokenModel';
import userModel from '../DBmodels/userModel';
import crypto from 'crypto';
import sendMail from '../utils/email.config';
import bcrypt from 'bcrypt';

const saltRounds = parseInt(process.env.SALT_ROUNDS || '');
export const requestPasswordResetService = async (email: string) => {
	const user = await userModel.findOne({ email });

	if (!user) throw new Error('User does not exist');

	let token = await Token.findOne({ userId: user._id });
	if (token) await token.deleteOne();

	const resetToken = crypto.randomBytes(32).toString('hex');
	const hashedToken = await bcrypt.hash(resetToken, 8);

	token = new Token({
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

	await sendMail(user.email, 'Forgot Password', html);

	return {
		success: true,
		userId: user._id,
		resetToken,
		message: 'Check your mail for Email Verification'
	};
};

export const getPasswordResetService = async (
	userId: string,
	token: string
) => {
	const resetPasswordToken = await Token.findOne({ userId });
	if (!resetPasswordToken) {
		throw new Error('Invalid or expired token');
	}
	const isMatch = await bcrypt.compare(token, resetPasswordToken.token);
	if (!isMatch) {
		throw new Error('invalid or expired password reset token');
	}
	return resetPasswordToken;
};

export const resetPasswordService = async (
	userId: string,
	newPassword: any
) => {
	if (newPassword.password !== newPassword.confirmPassword) throw new Error('Passwords dose not match');
		const newHashedPassword = await bcrypt.hash(
			newPassword.password,
			saltRounds
		);

	const user = await userModel.findById({ _id: userId });
	if (!user) throw new Error('User not found');


	const token = await Token.findOne({ userId });
	if (!token) throw new Error('Invalid token');

	await userModel.updateOne(
		{ _id: userId },
		{ $set: { password: newHashedPassword } }
	);

	const html = `<h1>Reset Password</h1>
    <p>Password reset successful</p>
    `;

	await sendMail(user.email, 'Password Reset', html);
	await token.deleteOne();
	return user;
};
