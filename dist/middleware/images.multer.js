"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({});
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == 'image/png' ||
            file.mimetype == 'image/jpeg' ||
            file.mimetype == 'image/jpg') {
            cb(null, true);
        }
        else {
            console.log('only jpg , jpeg and png files are supported');
            cb(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
});
exports.default = upload;
