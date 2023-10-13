"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const donorSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    reference: { type: String, required: true },
});
const Donor = mongoose_1.default.model("donor", donorSchema);
exports.default = Donor;
