import { Request, Response } from 'express';
import User from '../DBmodels/userModel';
import Driver from '../DBmodels/driverModel';
import cloudinary from '../service/cloudinary.config';
import routesModel from '../DBmodels/routesModel';
import Rides from '../DBmodels/ridesModel'
import { userId } from '../utils/tokenUserId';
import Ride from '../DBmodels/ridesModel';

export const addDriver = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();

		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}
		const { fullName, route, phoneNumber, accountNumber } = req.body;

		const existingDriver = await Driver.findOne({
			fullName: fullName,
			phoneNumber: phoneNumber
		});
		if (existingDriver) {
			return res
				.status(401)
				.send({ message: 'Driver already exists', success: false });
		}

		const existingRoute = await routesModel.findOne({
			_id: route
		});
		if (!existingRoute) {
			return res.status(401).send({
				message: 'Route chosen by Driver dose not exists',
				success: false
			});
		}

		const newDriverData = {
			fullName,
			route: existingRoute,
			phoneNumber,
			accountNumber
		};
		const newDriver = new Driver(newDriverData);

		
			
			const PhotoResult = await cloudinary.uploader.upload(req.body.photo, {
				allowed_formats: ['jpg', 'png', 'svg', 'jpeg'],
				public_id: '',
				folder: 'emove'
			});
			const validIdResult = await cloudinary.uploader.upload(req.body.validId, {
				allowed_formats: ['jpg', 'png', 'svg', 'jpeg'],
				public_id: '',
				folder: 'emove'
			});

			newDriver.validId.push({
				validId_img: validIdResult.secure_url,
				cloudinary_id: validIdResult.public_id
			});
			

			newDriver.photo.push({
				profile_img: PhotoResult.secure_url,
				cloudinary_id: PhotoResult.public_id
			});
		

		await newDriver.save();
		return res.status(201).send({
			status: 'success',
			path: req.url,
			message: `Driver Added successfully`,
			data: newDriver
		});
	} catch (error) {
		return res.status(400).send({
			status: 'error',
			path: req.url,
			message: 'Error Adding Driver',
			success: false
		});
	}
};

export const editDriver = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();
		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}
		const driver = await Driver.findOne({
			_id: req.params.driverId
		}).exec();
		if (!driver) {
			return res.status(500).send({
				message: 'This Driver dose not exists'
			});
		}
		if (driver.validId[0]?.cloudinary_id) {
			await cloudinary.uploader.destroy(driver.validId[0].cloudinary_id);
		}
		if (driver.photo[0]?.cloudinary_id) {
			await cloudinary.uploader.destroy(driver.photo[0].cloudinary_id);
		}

		const { fullName, route, phoneNumber, accountNumber } = req.body;

		const existingRoute = await routesModel.findOne({
			_id: route
		});
		if (!existingRoute) {
			return res.status(401).send({
				message: 'Route chosen by Driver dose not exists',
				success: false
			});
		}


		const PhotoResult = await cloudinary.uploader.upload(req.body.photo, {
			allowed_formats: ['jpg', 'png', 'svg', 'jpeg'],
			public_id: '',
			folder: 'emove'
		});
		const validIdResult = await cloudinary.uploader.upload(req.body.validId, {
			allowed_formats: ['jpg', 'png', 'svg', 'jpeg'],
			public_id: '',
			folder: 'emove'
		});

			const newDriverData = {
				fullName,
				route: existingRoute,
				phoneNumber,
				accountNumber,
				validId: [
					{
						validId_img: validIdResult.secure_url,
						cloudinary_id: validIdResult.public_id
					}
				],
				photo: [
					{
						profile_img: PhotoResult.secure_url,
						cloudinary_id: PhotoResult.public_id
					}
				]
			};

			const updatedDriver = await Driver.findOneAndUpdate(
				{ _id: req.params.driverId },
				newDriverData,
				{ new: true }
			);
			return res.status(201).send({
				status: 'success',
				path: req.url,
				message: `Driver Details Updated successfully`,
				data: updatedDriver
			});
	
	} catch (error) {
		return res.status(400).send({
			status: 'error',
			path: req.url,
			message: 'Error Editing Driver',
			success: false
		});
	}
};

export const createRoutes = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();
		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}
		const existingRoute = await routesModel.findOne({
			pickupStation: req.body.pickupStation,
			destination: req.body.destination
		});
		if (existingRoute) {
			return res.send('Route already exist');
		}

		const { pickupStation, destination, price } = req.body;

		const newRouteData = {
			pickupStation,
			destination,
			price
		};
		const newRoute = new routesModel(newRouteData);
		await newRoute.save();

		res.status(201).send({
			status: 'success',
			message: 'Route created successfully',
			data: newRoute
		});
	} catch (error) {
		res.status(500).send({
			status: 'error',
			path: req.url,
			message: 'Error Creating Route',
			success: false
		});
	}
};

export const updateRoute = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();
		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}

		const routeId = req.params.id;
		const checkField = Object.keys(req.body);
		if (!(checkField[0] === 'price' && checkField.length === 1)) {
			return res.send('Route can not be updated');
		}
		const editRoute = await routesModel.updateOne(
			{ _id: routeId },
			{ price: req.body.price }
		);
		if (editRoute.modifiedCount) {
			return res.status(200).send({
				status: 'success',
				message: 'Route updated successfully',
				data: editRoute
			});
		}
	} catch (error) {
		return res.status(500).send({
			status: 'error',
			path: req.url,
			message: 'Error Updating Route Price ',
			success: false
		});
	}
};

export const getAllRoute = async function (req: Request, res: Response) {
	try {
		const routes = await routesModel.find();

		return res.status(200).send({
			status: 'success',
			message: 'Getting All Route successful',
			data: routes
		});
	} catch (err) {
		res.status(500).send({
			status: 'error',
			path: req.url,
			message: 'Error retrieving all routes',
			success: false
		});
	}
};

// Endpoint to get a single route by ID
export const getSingleRoute = async function (req: Request, res: Response) {
	try {
		const route = await routesModel.findById(req.params.id);
		if (!route) {
			return res.status(404).send('Route not found');
		}

		return res.status(200).send({
			status: 'success',
			message: 'Getting Route successful',
			data: route
		});
	} catch (err) {
		res.status(500).send({
			status: 'error',
			path: req.url,
			message: 'Error retrieving a route',
			success: false
		});
	}
};

export const totalSucRides = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();
		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}
		
		const count = await Ride.countDocuments();
		return res.status(201).send({
			status: 'success',
			path: req.url,
			data: {
				message: 'Total Successful Rides',
				count
			}
		});
	} catch (error) {
		res.status(400).send({
			status: 'error',
			path: req.url,
			message: 'Error Getting total number of successful rides',
			success: false
		});
	}
};

export const totalPassengers = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();

		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}

		const count = await User.countDocuments({ isAdmin: false });
		return res.status(201).send({
			status: 'success',
			path: req.url,
			data: {
				message: 'Total passengers',
				count
			}
		});
	} catch (error) {
		res.status(500).send({
			status: 'error',
			path: req.url,
			message: 'Error Getting total number of Passengers',
			success: false
		});
	}
};

export const totalDrivers = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();
		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}
		const totalDrivers = await Driver.estimatedDocumentCount();
		return res.status(201).send({
			status: 'success',
			path: req.url,
			data: {
				message: 'Total drivers',
				totalDrivers
			}
		});
	} catch (error) {
		res.status(400).send({
			status: 'error',
			path: req.url,
			message: 'Error Getting total number of Drivers',
			success: false
		});
	}
};

export const deleteDriver = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();
		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}
		const driver = await Driver.findOne({
			_id: req.params.driverId
		}).exec();
		if (!driver) {
			return res.status(500).send({
				message: 'This Driver dose not exists'
			});
		}

		await Driver.findOneAndDelete({ _id: req.params.driverId });
		return res.status(201).send({
			status: 'success',
			path: req.url,
			message: `Driver Deleted successfully`,
			data: driver
		});
	} catch (error) {
		res.status(400).send({
			status: 'error',
			path: req.url,
			message: 'Error Deleting Driver',
			success: false
		});
	}
};

export const getOneDriver = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();
		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}
		const driver = await Driver.findOne({
			_id: req.params.driverId
		}).exec();
		if (!driver) {
			return res.status(500).send({
				message: 'This Driver dose not exists'
			});
		}

		return res.status(201).send({
			status: 'success',
			path: req.url,
			message: `Driver Details`,
			data: driver
		});
	} catch (error) {
		res.status(400).send({
			status: 'error',
			path: req.url,
			message: 'Error Getting Driver',
			success: false
		});
	}
};

export const getAllDrivers = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();
		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}
		const drivers = await Driver.find({}).exec();
		if (!drivers) {
			return res.status(500).send({
				message: 'No Drivers found'
			});
		}

		return res.status(201).send({
			status: 'success',
			path: req.url,
			message: `All Drivers`,
			data: drivers
		});
	} catch (error) {
		res.status(400).send({
			status: 'error',
			path: req.url,
			message: 'Error Getting All Drivers',
			success: false
		});
	}

};


export const getAllTrips = async (req: Request, res: Response) => {
	try {
		const id = userId(req, res);
		const adminUser = await User.findOne({ _id: id }).exec();
		if (!adminUser?.isAdmin) {
			return res
				.status(401)
				.send({ message: 'User is not an Admin', success: false });
		}
		const trips = await Rides.find({}).exec();
		if (!trips) {
			return res.status(500).send({
				message: 'No Trips found'
			});
		}

		return res.status(201).send({
			status: 'success',
			path: req.url,
			message: `All Trips`,
			data: trips
		});
	} catch (error) {
		res.status(400).send({
			status: 'error',
			path: req.url,
			message: 'Error Getting All Trips',
			success: false
		});
	}
	
};