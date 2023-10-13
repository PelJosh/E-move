import createError, { HttpError } from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import * as dotenv from 'dotenv';
dotenv.config();
import { strict as assert } from 'assert';
import { load } from 'ts-dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
mongoose.set('strictQuery', true);

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import adminRouter from './routes/admin';

const app = express();
// DotEnv variable types
const env = load({
	MONGO_URL: String,
	JWT_SECRET: String,
	SALT_ROUNDS: Number,
	CLOUDINARY_API_KEY: String,
	CLOUDINARY_API_SECRET: String
});

const url = process.env.MONGO_URL as string;

assert.ok(env.MONGO_URL === process.env.MONGO_URL);
assert.ok(env.JWT_SECRET === process.env.JWT_SECRET);
assert.ok(env.CLOUDINARY_API_KEY === process.env.CLOUDINARY_API_KEY);
assert.ok(env.CLOUDINARY_API_SECRET === process.env.CLOUDINARY_API_SECRET);

// Mongodb Connection
(async () => {
	await mongoose.connect(url);
	console.log('MongoDB is connected');
})();
// view engine setup
app.set('views', path.join(__dirname, '../', 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
	next(createError(404));
});

// error handler
app.use(function (err: HttpError, req: Request, res: Response) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

export default app;
