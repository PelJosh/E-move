import { Request, Response } from 'express';
import {
	getPasswordResetService,
	requestPasswordResetService,
	resetPasswordService
} from '../service/email.service';
import { resetPasswordZod } from '../utils/zod/userZod';

export const requestPasswordResetController = async (
	req: Request,
	res: Response
) => {
	try {
		const requestPasswordReset = await requestPasswordResetService(
			req.body.email
		);
		res.send(requestPasswordReset);
	} catch (error) {
		res.send({
			success: false,
			status: 'error',
			message: 'User not registered'
		});
	}
};

export const getPasswordController = async (req: Request, res: Response) => {
	try {
		const getPasswordReset = await getPasswordResetService(
			req.params.userId,
			req.params.token
		);
			res
				.status(302)
				.redirect(
					`http://localhost:5173/#/resetpassword?userId=${req.params.userId}`
				);
		// res.send(getPasswordReset);
	} catch (error) {
		res.send({
			status: 'error',
			message: 'Invalid password reset link'
		});
	}
};

export const resetPasswordController = async (req: Request, res: Response) => {
	const error: any = resetPasswordZod.safeParse(req.body);
	try {
		if (error.success === false) {
			return res.status(400).send({
				success: false,
				path: req.url,
				message: error.error.issues[0].message
			});
		}

		await resetPasswordService(req.params.id, req.body);
		res.status(200).send({
			success: true,
			status: 'success',
			message: 'Password Reset successful'
		});
	} catch (error) {
		res.status(401).send({
			success:false,
			status: 'error',
			message: 'Invalid password'
		});
	}
};
