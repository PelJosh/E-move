"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = require("../controller/admin");
const auth_1 = require("../middleware/auth");
const images_multer_1 = __importDefault(require("../middleware/images.multer"));
const admin_2 = require("../controller/admin");
const router = express_1.default.Router();
const fields = [
    { name: 'validId', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
];
router.post('/addDriver', auth_1.authenticateToken, images_multer_1.default.fields(fields), admin_1.addDriver);
router.put('/editDriver/:driverId', auth_1.authenticateToken, images_multer_1.default.fields(fields), admin_1.editDriver);
router.get('/getAllDrivers', auth_1.authenticateToken, admin_1.getAllDrivers);
router.get('/getOneDriver/:driverId', auth_1.authenticateToken, admin_1.getOneDriver);
router.delete('/deleteDriver/:driverId', auth_1.authenticateToken, admin_1.deleteDriver);
router.post('/create-route', auth_1.authenticateToken, admin_2.createRoutes);
router.patch('/edit-route/:id', auth_1.authenticateToken, admin_2.updateRoute);
router.get('/totalSucRides', auth_1.authenticateToken, admin_1.totalSucRides);
router.get('/totalPassengers', auth_1.authenticateToken, admin_1.totalPassengers);
router.get('/totalDrivers', auth_1.authenticateToken, admin_1.totalDrivers);
router.get('/getAllRoutes', auth_1.authenticateToken, admin_1.getAllRoute);
router.get('/getSingleRoutes/:id', auth_1.authenticateToken, admin_1.getSingleRoute);
router.get('/getAllTrips', auth_1.authenticateToken, admin_1.getAllTrips);
exports.default = router;
