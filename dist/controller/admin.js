"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTrips = exports.getAllDrivers = exports.getOneDriver = exports.deleteDriver = exports.totalDrivers = exports.totalPassengers = exports.totalSucRides = exports.getSingleRoute = exports.getAllRoute = exports.updateRoute = exports.createRoutes = exports.editDriver = exports.addDriver = void 0;
const userModel_1 = __importDefault(require("../DBmodels/userModel"));
const driverModel_1 = __importDefault(require("../DBmodels/driverModel"));
const cloudinary_config_1 = __importDefault(require("../service/cloudinary.config"));
const routesModel_1 = __importDefault(require("../DBmodels/routesModel"));
const ridesModel_1 = __importDefault(require("../DBmodels/ridesModel"));
const tokenUserId_1 = require("../utils/tokenUserId");
const ridesModel_2 = __importDefault(require("../DBmodels/ridesModel"));
const addDriver = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
        if (!adminUser?.isAdmin) {
            return res
                .status(401)
                .send({ message: 'User is not an Admin', success: false });
        }
        const { fullName, route, phoneNumber, accountNumber } = req.body;
        const existingDriver = await driverModel_1.default.findOne({
            fullName: fullName,
            phoneNumber: phoneNumber
        });
        if (existingDriver) {
            return res
                .status(401)
                .send({ message: 'Driver already exists', success: false });
        }
        const existingRoute = await routesModel_1.default.findOne({
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
        const newDriver = new driverModel_1.default(newDriverData);
        const PhotoResult = await cloudinary_config_1.default.uploader.upload(req.body.photo, {
            allowed_formats: ['jpg', 'png', 'svg', 'jpeg'],
            public_id: '',
            folder: 'emove'
        });
        const validIdResult = await cloudinary_config_1.default.uploader.upload(req.body.validId, {
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
    }
    catch (error) {
        return res.status(400).send({
            status: 'error',
            path: req.url,
            message: 'Error Adding Driver',
            success: false
        });
    }
};
exports.addDriver = addDriver;
const editDriver = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
        if (!adminUser?.isAdmin) {
            return res
                .status(401)
                .send({ message: 'User is not an Admin', success: false });
        }
        const driver = await driverModel_1.default.findOne({
            _id: req.params.driverId
        }).exec();
        if (!driver) {
            return res.status(500).send({
                message: 'This Driver dose not exists'
            });
        }
        if (driver.validId[0]?.cloudinary_id) {
            await cloudinary_config_1.default.uploader.destroy(driver.validId[0].cloudinary_id);
        }
        if (driver.photo[0]?.cloudinary_id) {
            await cloudinary_config_1.default.uploader.destroy(driver.photo[0].cloudinary_id);
        }
        const { fullName, route, phoneNumber, accountNumber } = req.body;
        const existingRoute = await routesModel_1.default.findOne({
            _id: route
        });
        if (!existingRoute) {
            return res.status(401).send({
                message: 'Route chosen by Driver dose not exists',
                success: false
            });
        }
        const PhotoResult = await cloudinary_config_1.default.uploader.upload(req.body.photo, {
            allowed_formats: ['jpg', 'png', 'svg', 'jpeg'],
            public_id: '',
            folder: 'emove'
        });
        const validIdResult = await cloudinary_config_1.default.uploader.upload(req.body.validId, {
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
        const updatedDriver = await driverModel_1.default.findOneAndUpdate({ _id: req.params.driverId }, newDriverData, { new: true });
        return res.status(201).send({
            status: 'success',
            path: req.url,
            message: `Driver Details Updated successfully`,
            data: updatedDriver
        });
    }
    catch (error) {
        return res.status(400).send({
            status: 'error',
            path: req.url,
            message: 'Error Editing Driver',
            success: false
        });
    }
};
exports.editDriver = editDriver;
const createRoutes = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
        if (!adminUser?.isAdmin) {
            return res
                .status(401)
                .send({ message: 'User is not an Admin', success: false });
        }
        const existingRoute = await routesModel_1.default.findOne({
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
        const newRoute = new routesModel_1.default(newRouteData);
        await newRoute.save();
        res.status(201).send({
            status: 'success',
            message: 'Route created successfully',
            data: newRoute
        });
    }
    catch (error) {
        res.status(500).send({
            status: 'error',
            path: req.url,
            message: 'Error Creating Route',
            success: false
        });
    }
};
exports.createRoutes = createRoutes;
const updateRoute = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
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
        const editRoute = await routesModel_1.default.updateOne({ _id: routeId }, { price: req.body.price });
        if (editRoute.modifiedCount) {
            return res.status(200).send({
                status: 'success',
                message: 'Route updated successfully',
                data: editRoute
            });
        }
    }
    catch (error) {
        return res.status(500).send({
            status: 'error',
            path: req.url,
            message: 'Error Updating Route Price ',
            success: false
        });
    }
};
exports.updateRoute = updateRoute;
const getAllRoute = async function (req, res) {
    try {
        const routes = await routesModel_1.default.find();
        return res.status(200).send({
            status: 'success',
            message: 'Getting All Route successful',
            data: routes
        });
    }
    catch (err) {
        res.status(500).send({
            status: 'error',
            path: req.url,
            message: 'Error retrieving all routes',
            success: false
        });
    }
};
exports.getAllRoute = getAllRoute;
// Endpoint to get a single route by ID
const getSingleRoute = async function (req, res) {
    try {
        const route = await routesModel_1.default.findById(req.params.id);
        if (!route) {
            return res.status(404).send('Route not found');
        }
        return res.status(200).send({
            status: 'success',
            message: 'Getting Route successful',
            data: route
        });
    }
    catch (err) {
        res.status(500).send({
            status: 'error',
            path: req.url,
            message: 'Error retrieving a route',
            success: false
        });
    }
};
exports.getSingleRoute = getSingleRoute;
const totalSucRides = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
        if (!adminUser?.isAdmin) {
            return res
                .status(401)
                .send({ message: 'User is not an Admin', success: false });
        }
        const count = await ridesModel_2.default.countDocuments();
        return res.status(201).send({
            status: 'success',
            path: req.url,
            data: {
                message: 'Total Successful Rides',
                count
            }
        });
    }
    catch (error) {
        res.status(400).send({
            status: 'error',
            path: req.url,
            message: 'Error Getting total number of successful rides',
            success: false
        });
    }
};
exports.totalSucRides = totalSucRides;
const totalPassengers = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
        if (!adminUser?.isAdmin) {
            return res
                .status(401)
                .send({ message: 'User is not an Admin', success: false });
        }
        const count = await userModel_1.default.countDocuments({ isAdmin: false });
        return res.status(201).send({
            status: 'success',
            path: req.url,
            data: {
                message: 'Total passengers',
                count
            }
        });
    }
    catch (error) {
        res.status(500).send({
            status: 'error',
            path: req.url,
            message: 'Error Getting total number of Passengers',
            success: false
        });
    }
};
exports.totalPassengers = totalPassengers;
const totalDrivers = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
        if (!adminUser?.isAdmin) {
            return res
                .status(401)
                .send({ message: 'User is not an Admin', success: false });
        }
        const totalDrivers = await driverModel_1.default.estimatedDocumentCount();
        return res.status(201).send({
            status: 'success',
            path: req.url,
            data: {
                message: 'Total drivers',
                totalDrivers
            }
        });
    }
    catch (error) {
        res.status(400).send({
            status: 'error',
            path: req.url,
            message: 'Error Getting total number of Drivers',
            success: false
        });
    }
};
exports.totalDrivers = totalDrivers;
const deleteDriver = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
        if (!adminUser?.isAdmin) {
            return res
                .status(401)
                .send({ message: 'User is not an Admin', success: false });
        }
        const driver = await driverModel_1.default.findOne({
            _id: req.params.driverId
        }).exec();
        if (!driver) {
            return res.status(500).send({
                message: 'This Driver dose not exists'
            });
        }
        await driverModel_1.default.findOneAndDelete({ _id: req.params.driverId });
        return res.status(201).send({
            status: 'success',
            path: req.url,
            message: `Driver Deleted successfully`,
            data: driver
        });
    }
    catch (error) {
        res.status(400).send({
            status: 'error',
            path: req.url,
            message: 'Error Deleting Driver',
            success: false
        });
    }
};
exports.deleteDriver = deleteDriver;
const getOneDriver = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
        if (!adminUser?.isAdmin) {
            return res
                .status(401)
                .send({ message: 'User is not an Admin', success: false });
        }
        const driver = await driverModel_1.default.findOne({
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
    }
    catch (error) {
        res.status(400).send({
            status: 'error',
            path: req.url,
            message: 'Error Getting Driver',
            success: false
        });
    }
};
exports.getOneDriver = getOneDriver;
const getAllDrivers = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
        if (!adminUser?.isAdmin) {
            return res
                .status(401)
                .send({ message: 'User is not an Admin', success: false });
        }
        const drivers = await driverModel_1.default.find({}).exec();
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
    }
    catch (error) {
        res.status(400).send({
            status: 'error',
            path: req.url,
            message: 'Error Getting All Drivers',
            success: false
        });
    }
};
exports.getAllDrivers = getAllDrivers;
const getAllTrips = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const adminUser = await userModel_1.default.findOne({ _id: id }).exec();
        if (!adminUser?.isAdmin) {
            return res
                .status(401)
                .send({ message: 'User is not an Admin', success: false });
        }
        const trips = await ridesModel_1.default.find({}).exec();
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
    }
    catch (error) {
        res.status(400).send({
            status: 'error',
            path: req.url,
            message: 'Error Getting All Trips',
            success: false
        });
    }
};
exports.getAllTrips = getAllTrips;
