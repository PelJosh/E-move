import mongoose from 'mongoose';

const ridesSchema = new mongoose.Schema(
	{
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
	},
	{
		timestamps: true
	}
);

const ridesModel = mongoose.model('rides', ridesSchema);

export default ridesModel;
