"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const driverSchema = new mongoose_1.default.Schema({
    fullName: {
        type: String,
        required: true
    },
    route: {
        type: Object,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    validId: [
        {
            validId_img: String,
            cloudinary_id: String
        }
    ],
    photo: [
        {
            profile_img: String,
            cloudinary_id: String
        }
    ]
}, {
    timestamps: true
});
const driverModel = mongoose_1.default.model('drivers', driverSchema);
exports.default = driverModel;
