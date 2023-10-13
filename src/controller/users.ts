import { Request, Response } from 'express';
import User from '../DBmodels/userModel';
import routesModel from '../DBmodels/routesModel';
import Ride from '../DBmodels/ridesModel';
import Transaction from '../DBmodels/transactionModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../utils/email.config';
import {
	loginUserZod,
	signupUserZod,
	changePasswordZod
} from '../utils/zod/userZod';
import { userId } from '../utils/tokenUserId';
import Donor from '../DBmodels/donorModel';
import { initializePayment, verifyPayment } from '../utils/paystack';
import _ from 'lodash';

const saltRounds = parseInt(process.env.SALT_ROUNDS || '');
export const loginController = async (req: Request, res: Response) => {
	const error: any = loginUserZod.safeParse(req.body);
	try {
		const { email, password } = req.body;
		if (error.success === false) {
			return res.status(400).send({
				status: 'error',
				path: req.url,
				message: error.error.issues[0].message
			});
		}
		const user: any = await User.findOne({ email: email });
		const verify = user.isVerified;
		if (!verify) {
			return res.status(400).send({
				status: 'error',
				path: req.url,
				message: 'User is not verified'
			});
		}
		if (!user) {
			return res.status(400).send('Invalid email or password');
		}
		const isMatch = await bcrypt.compareSync(password, user.password);
		if (!isMatch) {
			return res.status(400).send(' Invalid password ');
		}
		const secret: string = process.env.JWT_SECRET as string;
		const token = jwt.sign({ _id: user._id }, secret);
		return res.status(200).send({
			message: 'login successful',
			user,
			loginToken: token
		});
	} catch (error) {
		res.status(500).send('Invalid credentials');
	}
};
export const createUser = async (req: Request, res: Response) => {
	const signupData = req.body;
	const error: any = signupUserZod.safeParse(signupData);
	try {
		if (error.success === false) {
			return res.status(400).send({
				success: false,
				path: req.url,
				message: error.error.issues[0].message
			});
		}
		console.log(req.body);
		const { fullName, email, password, dateOfBirth, gender, phone } = req.body;
		const existingUser = await User.findOne({
			email: email
		});
		if (existingUser) {
			return res
				.status(200)
				.send({ message: 'User already exists', success: false });
		}
		const secret: string = process.env.JWT_SECRET as string;
		const token = jwt.sign({ email: email }, secret, { expiresIn: '1d' });
		const salt = await bcrypt.genSaltSync(saltRounds);
		const hash = await bcrypt.hashSync(password, salt);
		const newUserData = {
			fullName,
			email,
			password: hash,
			dateOfBirth,
			gender,
			phone,
			isVerified: false,
			isAdmin: false
		};
		const newuser = new User(newUserData);
		await newuser.save();
		const link = `http://localhost:3000/api/v1/users/emailval/${newuser._id.toString()}/${token}`;
		const html = `<h1>Email Verification</h1>        <h2>Hello ${newuser.fullName}</h2>        <p>Please, click on link below to verify</p>        <div>        <a href=${link}>verify account</a>        </div>`;
		await sendMail(newuser.email, 'Account verification', html);
		return res.status(201).send({
			status: 'success',
			path: req.url,
			message: `New user with email - ${newuser.email} added successfully`,
			data: newuser
		});
	} catch (error) {
		res.status(500).send({
			status: 'error',
			path: req.url,
			message: 'Something went wrong',
			success: false
		});
	}
};

// THIS IS WERE THE LOGIC FOR EACH END POINTS GO
export const changePassword = async function (req: Request, res: Response) {
	const error: any = changePasswordZod.safeParse(req.body);
	try {
		if (error.success === false) {
			return res.status(400).send({
				success: false,
				path: req.url,
				message: error.error.issues[0].message
			});
		}
		const { oldPassword, newPassword } = req.body;
		const id = userId(req, res);

		const user = await User.findOne({ _id: id }).exec();

		if (!user) {
			return res.status(401).send({
				name: 'UserNotFoundError',
				message: 'User not found'
			});
		}

		const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

		if (!isOldPasswordValid) {
			return res.status(401).send({
				name: 'InvalidPasswordError',
				message: 'Invalid old password'
			});
		}

		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

		await User.findOneAndUpdate(
			{ _id: req.params.id },
			{ password: hashedPassword }
		).exec();

		res.status(201).send({
			message: 'Password changed successfully'
		});
	} catch (err: any) {
		if (err.name === 'TokenExpiredError') {
			return res.status(401).send({
				name: 'ExpiredTokenError'
			});
		}
		res.status(400).send({
			name: 'ChangePasswordError',
			message: err.message
		});
	}
};

export const bookTrip = async function (req: Request, res: Response) {
	try {
		const id = userId(req, res);
		const user = await User.findOne({ _id: id }).exec();
		if (!user) {
			return res.status(401).send({
				success: false,
				name: 'UserNotFoundError',
				message: 'User not found'
			});
		}

		const existingRoute = await routesModel.findOne({
			_id: req.params.routeId
		});
		if (!existingRoute) {
			return res.status(400).send({
				message: 'Route chosen by Passenger dose not exists',
				success: false
			});
		}
		if (user.walletBalance >= 0) {
			if (existingRoute.price > user.walletBalance) {
				const transactionData = {
					transactionType: 'Debit',
					status: 'Declined',
					passengerId: id,
					processed: false,
					amount: existingRoute.price
				};
				const newTransaction = new Transaction(transactionData);
				await newTransaction.save();

				return res.status(400).send({
					status: 'error',
					path: req.url,
					message: 'Insufficent Funds',
					success: false
				});
			} else {
				const newbalance = user.walletBalance - existingRoute.price;

				const passenger = await User.findOneAndUpdate(
					{ _id: id },
					{ walletBalance: newbalance },
					{ new: true }
				);

				const rideData = {
					passengerId: id,
					route: existingRoute,
					isSuccessful: false
				};
				const newRide = new Ride(rideData);
				await newRide.save();

				const transactionData = {
					transactionType: 'Debit',
					status: 'Accepted',
					passengerId: id,
					processed: true,
					amount: existingRoute.price
				};
				const newTransaction = new Transaction(transactionData);
				await newTransaction.save();

				return res.status(200).send({
					status: 'success',
					message: 'Passenger has booked a trip successfully',
					data: {
						passenger,
						rideData: newRide
					}
				});
			}
		}
		return res.status(401).send({
			status: 'error',
			path: req.url,
			message: 'Error Accessing Users Wallet',
			success: false
		});
	} catch (error) {
		return res.status(500).send({
			status: 'error',
			path: req.url,
			message: 'Something went wrong Error Booking a Trip',
			success: false
		});
	}
};

export const engagePayment = async (req: Request, res: Response) => {
	try {
		const { amount } = req.body;

		const userId = req.user;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(401).send({
				success: false,
				name: 'UserNotFoundError',
				message: 'User not found'
			});
		}
		const form: any = {};
		form.name = user.fullName;
		form.email = user.email;
		form.metadata = {
			full_name: user.fullName
		};
		form.amount = amount * 100;

		initializePayment(form, async (error: any, body: any) => {
			if (error) {
				return res.status(401).send({
					status: 'error',
					path: req.url,
					message: 'payment error occured',
					success: false 
				});
			}

			const response = JSON.parse(body);

			const newTransaction = {
				passengerId: userId,
				transactionType: 'Credit',
				// status: '',
				amount: form.amount,
				initRef: response.data.reference
			};
			
			const transaction = new Transaction(newTransaction);
			await transaction.save();

			return res.status(200).send({
				status: 'success',
				message: 'Payment Engaged',
				data: {
					authorization_url: response.data.authorization_url,
					response,
					transaction
				}
			});
		});
	} catch (error) {
		return res.status(500).send({
			status: 'error',
			path: req.url,
			message: 'Error initializing payment',
			success: false
		});
	}
};

export const getReference = async (req: Request, res: Response) => {
	try {
		// const userId = req.user;
		// const transactionId = req.query.transactionId;


		const transaction = await Transaction.findOne({
			initRef: req.query.reference
		});

		if (transaction?.processed === true) {
			return res.status(401).send({
				status: 'error',
				path: req.url,
				message: 'Transaction already processed',
				success: false
			});
		}

		const ref: string = req.query.reference as string;
		verifyPayment(ref, async (error: any, body: any) => {
			if (error) {
				return res.status(401).send({
					status: 'error',
					path: req.url,
					message: error,
					success: false
				});
			}

			const response = JSON.parse(body);

			const data = _.at(response.data, [
				'reference',
				'amount',
				'customer.email',
				'metadata.full_name',
				'status'
			]);
			const [reference, amount, email, name, status] = data;

			const newDonor = { reference, amount, email, name };

			const donor = new Donor(newDonor);
			await donor.save();

			const user = await User.findOne({ email: donor.email });

			if (status === 'success') {
				await User.updateOne(
					{ _id: user?._id },
					{ $inc: { walletBalance: donor.amount / 100 } }
				);

				const updatedTransaction = await Transaction.findByIdAndUpdate(
					{ _id: transaction?._id },
					{ processed: true, status: 'Accepted' },
					{ new: true }
				);
				
				res.redirect('http://localhost:5173/#/userDashboard')
				// return res.status(200).send({
				// 	status: 'success',
				// 	message: 'Transaction accepted',
				// 	data: {
				// 		donor,
				// 		transaction: updatedTransaction
				// 	},
				// 	success: true
				// });
			} else {
				const updatedTransaction = await Transaction.findByIdAndUpdate(
					{ _id: transaction?._id },
					{ processed: true, status: 'Declined' },
					{ new: true }
				);
				res.redirect('http://localhost:5173/#/userDashboard')
				// return res.status(401).send({
				// 	status: 'error',
				// 	path: req.url,
				// 	message: 'Transport declined',
				// 	data: {
				// 		donor,
				// 		transaction: updatedTransaction
				// 	},
				// 	success: false
				// });
			}
		});
	} catch (error) {
		return res.status(500).send({
			status: 'error',
			path: req.url,
			message: 'Get Reference Failed',
			success: false
		});
	}
};
export const transactionHistory = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const user = await User.findOne({ _id: id }).exec();
		if (!user) {
			return res.status(401).send({
				success: false,
				name: 'UserNotFoundError',
				message: 'User not found'
			});
		}
		const transactions = await Transaction.find().exec();
		res.status(200).send({
			status: 'success',
			path: req.url,
			message: 'Transaction History',
			data: transactions
		});
	} catch (error) {
		res.status(500).send({
			status: 'error',
			error: 'Internal Server Error',
			path: req.url,
			message: 'Error fetching transaction history from database',
			success: false
		});
	}
};

export const getAllPassengerTrips = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const user = await User.findOne({ _id: id }).exec();
		if (!user) {
			return res
				.status(401)
				.send({ message: 'User is not found', success: false });
		}
		const trips = await Ride.find({ passengerId: id }).exec();
		if (!trips) {
			return res.status(500).send({
				message: 'No Trips found'
			});
		}

		return res.status(201).send({
			status: 'success',
			path: req.url,
			message: `My Trips`,
			data: trips
		});
	} catch (error) {
		res.status(400).send({
			status: 'error',
			path: req.url,
			message: 'Error Getting Passenger Trips',
			success: false
		});
	}
};

export const getUser = async (req: Request, res: Response) => {
	try {
		const userId = req.user
		const existingUser = await User.findById(userId)

		if(!existingUser){
			return res.status(404).send({
				success: false,
				message: 'User not found',
			})
		}

		return res.status(200).send({
			data: existingUser,
		})
	} catch (error) {
		res.status(500).send({
			status: 'error',
			success: false
		})
		
	}
};
