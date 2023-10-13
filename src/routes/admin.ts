import express from 'express';
import {
	addDriver,
	deleteDriver,
	editDriver,
	getAllDrivers,
	getAllRoute,
	getOneDriver,
	getSingleRoute,
	totalDrivers,
	totalPassengers,
	totalSucRides,
	getAllTrips
} from '../controller/admin';
import { authenticateToken } from '../middleware/auth';
import upload from '../middleware/images.multer';
import { createRoutes, updateRoute } from '../controller/admin';

const router = express.Router();

const fields = [
	{ name: 'validId', maxCount: 1 },
	{ name: 'photo', maxCount: 1 }
];

router.post('/addDriver', authenticateToken, upload.fields(fields), addDriver);
router.put(
	'/editDriver/:driverId',
	authenticateToken,
	upload.fields(fields),
	editDriver
);

router.get('/getAllDrivers', authenticateToken, getAllDrivers);

router.get('/getOneDriver/:driverId', authenticateToken, getOneDriver);

router.delete('/deleteDriver/:driverId', authenticateToken, deleteDriver);

router.post('/create-route', authenticateToken, createRoutes);
router.patch('/edit-route/:id', authenticateToken, updateRoute);

router.get('/totalSucRides', authenticateToken, totalSucRides);
router.get('/totalPassengers', authenticateToken, totalPassengers);
router.get('/totalDrivers', authenticateToken, totalDrivers);

router.get('/getAllRoutes', authenticateToken, getAllRoute);
router.get('/getSingleRoutes/:id', authenticateToken, getSingleRoute);
router.get('/getAllTrips', authenticateToken, getAllTrips);

export default router;
