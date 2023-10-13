import { z } from 'zod';

export const signupUserZod = z.object({
	fullName: z
		.string({
			required_error: 'User First Name name is required'
		})
		.min(3, {
			message: 'User First Name name must be 3 or more characters long'
		}),
	gender: z
		.string({
			required_error: 'User gender is required'
		}),
	// 	.min(3, {
	// 		message: 'User Last Name name must be 3 or more characters long'
	// 	}),
	email: z.string({ required_error: 'Email is required' }).email(),
	password: z
		.string({
			required_error: 'Password is required'
		})
		.min(8, { message: 'Password must be 8 or more characters long' }),
	phone: z
		.string({
			required_error: 'User Phone Number is required'
		})
	// 	.min(4, { message: 'User Gender must be 4 or more characters long' }),
	// dateOfBirth: z.string({
	// 	required_error: 'Please select a date',
	// 	invalid_type_error: "That's not a date!"
	// })
});
export const loginUserZod = z.object({
	email: z.string({ required_error: 'Email is required' }).email(),
	password: z
		.string({
			required_error: 'Password is required'
		})
		.min(8, { message: 'Password must be 8 or more characters long' })
});

export const changePasswordZod = z.object({
	oldPassword: z
		.string({
			required_error: 'Old Password is required'
		})
		.min(8, { message: 'Password must be 8 or more characters long' }),
	newPassword: z
		.string({
			required_error: 'New Password is required'
		})
		.min(8, { message: 'Password must be 8 or more characters long' })
});

export const resetPasswordZod = z.object({
	password: z
		.string({
			required_error: 'New Password is required'
		})
		.min(8, { message: 'Password must be 8 or more characters long' }),
	confirmPassword: z
		.string({
			required_error: 'Confirm Password is required'
		})
		.min(8, { message: 'Password must be 8 or more characters long' })
});
