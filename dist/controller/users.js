"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.getAllPassengerTrips = exports.transactionHistory = exports.getReference = exports.engagePayment = exports.bookTrip = exports.changePassword = exports.createUser = exports.loginController = void 0;
const userModel_1 = __importDefault(require("../DBmodels/userModel"));
const routesModel_1 = __importDefault(require("../DBmodels/routesModel"));
const ridesModel_1 = __importDefault(require("../DBmodels/ridesModel"));
const transactionModel_1 = __importDefault(require("../DBmodels/transactionModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_config_1 = __importDefault(require("../utils/email.config"));
const userZod_1 = require("../utils/zod/userZod");
const tokenUserId_1 = require("../utils/tokenUserId");
const donorModel_1 = __importDefault(require("../DBmodels/donorModel"));
const paystack_1 = require("../utils/paystack");
const lodash_1 = __importDefault(require("lodash"));
const saltRounds = parseInt(process.env.SALT_ROUNDS || '');
const loginController = async (req, res) => {
    const error = userZod_1.loginUserZod.safeParse(req.body);
    try {
        const { email, password } = req.body;
        if (error.success === false) {
            return res.status(400).send({
                status: 'error',
                path: req.url,
                message: error.error.issues[0].message
            });
        }
        const user = await userModel_1.default.findOne({ email: email });
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
        const isMatch = await bcrypt_1.default.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).send(' Invalid password ');
        }
        const secret = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, secret);
        return res.status(200).send({
            message: 'login successful',
            user,
            loginToken: token
        });
    }
    catch (error) {
        res.status(500).send('Invalid credentials');
    }
};
exports.loginController = loginController;
const createUser = async (req, res) => {
    const signupData = req.body;
    const error = userZod_1.signupUserZod.safeParse(signupData);
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
        const existingUser = await userModel_1.default.findOne({
            email: email
        });
        if (existingUser) {
            return res
                .status(200)
                .send({ message: 'User already exists', success: false });
        }
        const secret = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ email: email }, secret, { expiresIn: '1d' });
        const salt = await bcrypt_1.default.genSaltSync(saltRounds);
        const hash = await bcrypt_1.default.hashSync(password, salt);
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
        const newuser = new userModel_1.default(newUserData);
        await newuser.save();
        const link = `http://localhost:3000/api/v1/users/emailval/${newuser._id.toString()}/${token}`;
        const html = `<h1>Email Verification</h1>        <h2>Hello ${newuser.fullName}</h2>        <p>Please, click on link below to verify</p>        <div>        <a href=${link}>verify account</a>        </div>`;
        await (0, email_config_1.default)(newuser.email, 'Account verification', html);
        return res.status(201).send({
            status: 'success',
            path: req.url,
            message: `New user with email - ${newuser.email} added successfully`,
            data: newuser
        });
    }
    catch (error) {
        res.status(500).send({
            status: 'error',
            path: req.url,
            message: 'Something went wrong',
            success: false
        });
    }
};
exports.createUser = createUser;
// THIS IS WERE THE LOGIC FOR EACH END POINTS GO
const changePassword = async function (req, res) {
    const error = userZod_1.changePasswordZod.safeParse(req.body);
    try {
        if (error.success === false) {
            return res.status(400).send({
                success: false,
                path: req.url,
                message: error.error.issues[0].message
            });
        }
        const { oldPassword, newPassword } = req.body;
        const id = (0, tokenUserId_1.userId)(req, res);
        const user = await userModel_1.default.findOne({ _id: id }).exec();
        if (!user) {
            return res.status(401).send({
                name: 'UserNotFoundError',
                message: 'User not found'
            });
        }
        const isOldPasswordValid = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(401).send({
                name: 'InvalidPasswordError',
                message: 'Invalid old password'
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
        await userModel_1.default.findOneAndUpdate({ _id: req.params.id }, { password: hashedPassword }).exec();
        res.status(201).send({
            message: 'Password changed successfully'
        });
    }
    catch (err) {
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
exports.changePassword = changePassword;
const bookTrip = async function (req, res) {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const user = await userModel_1.default.findOne({ _id: id }).exec();
        if (!user) {
            return res.status(401).send({
                success: false,
                name: 'UserNotFoundError',
                message: 'User not found'
            });
        }
        const existingRoute = await routesModel_1.default.findOne({
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
                const newTransaction = new transactionModel_1.default(transactionData);
                await newTransaction.save();
                return res.status(400).send({
                    status: 'error',
                    path: req.url,
                    message: 'Insufficent Funds',
                    success: false
                });
            }
            else {
                const newbalance = user.walletBalance - existingRoute.price;
                const passenger = await userModel_1.default.findOneAndUpdate({ _id: id }, { walletBalance: newbalance }, { new: true });
                const rideData = {
                    passengerId: id,
                    route: existingRoute,
                    isSuccessful: false
                };
                const newRide = new ridesModel_1.default(rideData);
                await newRide.save();
                const transactionData = {
                    transactionType: 'Debit',
                    status: 'Accepted',
                    passengerId: id,
                    processed: true,
                    amount: existingRoute.price
                };
                const newTransaction = new transactionModel_1.default(transactionData);
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
    }
    catch (error) {
        return res.status(500).send({
            status: 'error',
            path: req.url,
            message: 'Something went wrong Error Booking a Trip',
            success: false
        });
    }
};
exports.bookTrip = bookTrip;
const engagePayment = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user;
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            return res.status(401).send({
                success: false,
                name: 'UserNotFoundError',
                message: 'User not found'
            });
        }
        const form = {};
        form.name = user.fullName;
        form.email = user.email;
        form.metadata = {
            full_name: user.fullName
        };
        form.amount = amount * 100;
        (0, paystack_1.initializePayment)(form, async (error, body) => {
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
            const transaction = new transactionModel_1.default(newTransaction);
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
    }
    catch (error) {
        return res.status(500).send({
            status: 'error',
            path: req.url,
            message: 'Error initializing payment',
            success: false
        });
    }
};
exports.engagePayment = engagePayment;
const getReference = async (req, res) => {
    try {
        // const userId = req.user;
        // const transactionId = req.query.transactionId;
        const transaction = await transactionModel_1.default.findOne({
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
        const ref = req.query.reference;
        (0, paystack_1.verifyPayment)(ref, async (error, body) => {
            if (error) {
                return res.status(401).send({
                    status: 'error',
                    path: req.url,
                    message: error,
                    success: false
                });
            }
            const response = JSON.parse(body);
            const data = lodash_1.default.at(response.data, [
                'reference',
                'amount',
                'customer.email',
                'metadata.full_name',
                'status'
            ]);
            const [reference, amount, email, name, status] = data;
            const newDonor = { reference, amount, email, name };
            const donor = new donorModel_1.default(newDonor);
            await donor.save();
            const user = await userModel_1.default.findOne({ email: donor.email });
            if (status === 'success') {
                await userModel_1.default.updateOne({ _id: user?._id }, { $inc: { walletBalance: donor.amount / 100 } });
                const updatedTransaction = await transactionModel_1.default.findByIdAndUpdate({ _id: transaction?._id }, { processed: true, status: 'Accepted' }, { new: true });
                res.redirect('http://localhost:5173/#/userDashboard');
                // return res.status(200).send({
                // 	status: 'success',
                // 	message: 'Transaction accepted',
                // 	data: {
                // 		donor,
                // 		transaction: updatedTransaction
                // 	},
                // 	success: true
                // });
            }
            else {
                const updatedTransaction = await transactionModel_1.default.findByIdAndUpdate({ _id: transaction?._id }, { processed: true, status: 'Declined' }, { new: true });
                res.redirect('http://localhost:5173/#/userDashboard');
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
    }
    catch (error) {
        return res.status(500).send({
            status: 'error',
            path: req.url,
            message: 'Get Reference Failed',
            success: false
        });
    }
};
exports.getReference = getReference;
const transactionHistory = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const user = await userModel_1.default.findOne({ _id: id }).exec();
        if (!user) {
            return res.status(401).send({
                success: false,
                name: 'UserNotFoundError',
                message: 'User not found'
            });
        }
        const transactions = await transactionModel_1.default.find().exec();
        res.status(200).send({
            status: 'success',
            path: req.url,
            message: 'Transaction History',
            data: transactions
        });
    }
    catch (error) {
        res.status(500).send({
            status: 'error',
            error: 'Internal Server Error',
            path: req.url,
            message: 'Error fetching transaction history from database',
            success: false
        });
    }
};
exports.transactionHistory = transactionHistory;
const getAllPassengerTrips = async (req, res) => {
    try {
        const id = (0, tokenUserId_1.userId)(req, res);
        const user = await userModel_1.default.findOne({ _id: id }).exec();
        if (!user) {
            return res
                .status(401)
                .send({ message: 'User is not found', success: false });
        }
        const trips = await ridesModel_1.default.find({ passengerId: id }).exec();
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
    }
    catch (error) {
        res.status(400).send({
            status: 'error',
            path: req.url,
            message: 'Error Getting Passenger Trips',
            success: false
        });
    }
};
exports.getAllPassengerTrips = getAllPassengerTrips;
const getUser = async (req, res) => {
    try {
        const userId = req.user;
        const existingUser = await userModel_1.default.findById(userId);
        if (!existingUser) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
            });
        }
        return res.status(200).send({
            data: existingUser,
        });
    }
    catch (error) {
        res.status(500).send({
            status: 'error',
            success: false
        });
    }
};
exports.getUser = getUser;
