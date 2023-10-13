import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
const secret: string = process.env.JWT_SECRET as string;

export const userId = (req: Request, res: Response) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({
			name: 'MissingTokenError',
			message: 'No token was provided'
		});
	}
    const decoded: any = jwt.verify(token, secret);
    return decoded._id
};
