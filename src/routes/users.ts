import express from 'express';
import {
	createUser,
	loginController,
	changePassword,
	bookTrip,
	engagePayment,
	getReference,
	transactionHistory,
	getAllPassengerTrips,
	getUser
} from '../controller/users';

import {
	getPasswordController,
	requestPasswordResetController,
	resetPasswordController
} from '../utils/passwordReset';
import { updateVerified } from '../utils/updateVerified';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.put('/changepassword', authenticateToken, changePassword);

router.post('/signup', createUser);
router.post('/login', loginController);
router.get('/emailval/:id/:token', updateVerified);

router.post('/forgot-password', requestPasswordResetController);
router.get('/get-password/:userId/:token', getPasswordController);
router.put('/reset-password/:id', resetPasswordController);

router.post('/book-trip/:routeId', authenticateToken, bookTrip);
router.get(
	'/transaction-history',
	authenticateToken,
	transactionHistory
);

router.get('/getAllPassengerTrips', authenticateToken, getAllPassengerTrips)

router.post('/paystack/pay', authenticateToken, engagePayment);
router.get('/paystack/callback', getReference);
router.get('/getuser', authenticateToken, getUser);

export default router;
