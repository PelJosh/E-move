"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema = new mongoose_1.default.Schema({
    transactionType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Declined'
    },
    passengerId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    processed: {
        type: Boolean,
        default: false
    },
    initRef: {
        type: String
    }
}, {
    timestamps: true
});
const transactionModel = mongoose_1.default.model('transactions', transactionSchema);
exports.default = transactionModel;
