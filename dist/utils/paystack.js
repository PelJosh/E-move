"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.initializePayment = void 0;
const request_1 = __importDefault(require("request"));
const mySecret = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
const initializePayment = (form, myCallback) => {
    const options = {
        url: "https://api.paystack.co/transaction/initialize",
        headers: {
            authorization: mySecret,
            "content-type": "application/json",
            "cache-control": "no-cache",
        },
        form,
    };
    const callback = (error, response, body) => {
        return myCallback(error, body);
    };
    request_1.default.post(options, callback);
};
exports.initializePayment = initializePayment;
const verifyPayment = (ref, myCallback) => {
    const options = {
        url: 'https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref),
        headers: {
            authorization: mySecret,
            "content-type": "application/json",
            "cache-control": "no-cache",
        },
    };
    const callback = (error, response, body) => {
        return myCallback(error, body);
    };
    (0, request_1.default)(options, callback);
};
exports.verifyPayment = verifyPayment;
