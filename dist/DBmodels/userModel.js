"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});
const userModel = mongoose_1.default.model('users', userSchema);
exports.default = userModel;
