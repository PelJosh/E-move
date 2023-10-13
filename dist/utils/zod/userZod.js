"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordZod = exports.changePasswordZod = exports.loginUserZod = exports.signupUserZod = void 0;
const zod_1 = require("zod");
exports.signupUserZod = zod_1.z.object({
    fullName: zod_1.z
        .string({
        required_error: 'User First Name name is required'
    })
        .min(3, {
        message: 'User First Name name must be 3 or more characters long'
    }),
    gender: zod_1.z
        .string({
        required_error: 'User gender is required'
    }),
    // 	.min(3, {
    // 		message: 'User Last Name name must be 3 or more characters long'
    // 	}),
    email: zod_1.z.string({ required_error: 'Email is required' }).email(),
    password: zod_1.z
        .string({
        required_error: 'Password is required'
    })
        .min(8, { message: 'Password must be 8 or more characters long' }),
    phone: zod_1.z
        .string({
        required_error: 'User Phone Number is required'
    })
    // 	.min(4, { message: 'User Gender must be 4 or more characters long' }),
    // dateOfBirth: z.string({
    // 	required_error: 'Please select a date',
    // 	invalid_type_error: "That's not a date!"
    // })
});
exports.loginUserZod = zod_1.z.object({
    email: zod_1.z.string({ required_error: 'Email is required' }).email(),
    password: zod_1.z
        .string({
        required_error: 'Password is required'
    })
        .min(8, { message: 'Password must be 8 or more characters long' })
});
exports.changePasswordZod = zod_1.z.object({
    oldPassword: zod_1.z
        .string({
        required_error: 'Old Password is required'
    })
        .min(8, { message: 'Password must be 8 or more characters long' }),
    newPassword: zod_1.z
        .string({
        required_error: 'New Password is required'
    })
        .min(8, { message: 'Password must be 8 or more characters long' })
});
exports.resetPasswordZod = zod_1.z.object({
    password: zod_1.z
        .string({
        required_error: 'New Password is required'
    })
        .min(8, { message: 'Password must be 8 or more characters long' }),
    confirmPassword: zod_1.z
        .string({
        required_error: 'Confirm Password is required'
    })
        .min(8, { message: 'Password must be 8 or more characters long' })
});
