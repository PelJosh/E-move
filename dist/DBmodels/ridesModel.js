"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ridesSchema = new mongoose_1.default.Schema({
    passengerId: {
        type: String,
        required: true
    },
    route: {
        type: Object,
        required: true
    },
    isSuccessful: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});
const ridesModel = mongoose_1.default.model('rides', ridesSchema);
exports.default = ridesModel;
