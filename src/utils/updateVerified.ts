import { Request, Response } from 'express';
import User from '../DBmodels/userModel';
import jwt from 'jsonwebtoken';

const secret: string = process.env.JWT_SECRET as string;

export const updateVerified = async (req: Request, res: Response) => {
	try {
		const user = await User.findOne({
			_id: req.params.id
		});
		if(user?.isVerified === true) {
			return res.status(400).redirect('http://localhost:5173/#/login');
		}
		const token = req.params.token;
		const decoded = await jwt.verify(token, secret);
		if (!decoded) {
			return res.status(400).send('Invalid or Expired Token');
		}
		if (!user) {
			return res.status(400).send('Invalid link');
		}
		await User.findByIdAndUpdate(user._id, { isVerified: true });
		// res.status(201).send({
		// 	status: 'success',
		// 	path: req.url,
		// 	message: `Email verified successfully`
		// });
		res.redirect('http://localhost:5173/#/login')
	} catch (error) {
		res.status(500).send({
			status: 'error',
			path: req.url,
			message: 'Something went wrong',
			success: false
		});
	}
};
