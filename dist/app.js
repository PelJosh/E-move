"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const assert_1 = require("assert");
const ts_dotenv_1 = require("ts-dotenv");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set('strictQuery', true);
const index_1 = __importDefault(require("./routes/index"));
const users_1 = __importDefault(require("./routes/users"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
// DotEnv variable types
const env = (0, ts_dotenv_1.load)({
    MONGO_URL: String,
    JWT_SECRET: String,
    SALT_ROUNDS: Number,
    CLOUDINARY_API_KEY: String,
    CLOUDINARY_API_SECRET: String
});
const url = process.env.MONGO_URL;
assert_1.strict.ok(env.MONGO_URL === process.env.MONGO_URL);
assert_1.strict.ok(env.JWT_SECRET === process.env.JWT_SECRET);
assert_1.strict.ok(env.CLOUDINARY_API_KEY === process.env.CLOUDINARY_API_KEY);
assert_1.strict.ok(env.CLOUDINARY_API_SECRET === process.env.CLOUDINARY_API_SECRET);
// Mongodb Connection
(async () => {
    await mongoose_1.default.connect(url);
    console.log('MongoDB is connected');
})();
// view engine setup
app.set('views', path_1.default.join(__dirname, '../', 'views'));
app.set('view engine', 'jade');
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/api/v1', index_1.default);
app.use('/api/v1/users', users_1.default);
app.use('/api/v1/admin', admin_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next((0, http_errors_1.default)(404));
});
// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
exports.default = app;
