import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const secret: string = process.env.JWT_SECRET as string;

declare module "express-serve-static-core" {
	interface Request {
		user: string
	}
}

export const authenticateToken = function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({
			name: 'MissingTokenError',
			message: 'No token was provided'
		});
	}

	try {
		const decoded: {_id: string} = jwt.verify(token, secret) as {_id: string}
		const user = decoded._id
		if(!user) {
			return res.status(400).json({error: "Invalid token"})
		}
		req.user = user

		next();
	} catch (err: any) {
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
