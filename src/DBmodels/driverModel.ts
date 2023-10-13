import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true
		},
		route: {
			type: Object,
			required: true
		},
		phoneNumber: {
			type: String,
			required: true,
			unique: true
		},
		accountNumber: {
			type: String,
			required: true,
			unique: true
		},
		validId: [
			{
				validId_img: String,
				cloudinary_id: String
			}
		],
		photo: [
			{
				profile_img: String,
				cloudinary_id: String
			}
		]
	},
	{
		timestamps: true
	}
);

const driverModel = mongoose.model('drivers', driverSchema);

export default driverModel;
