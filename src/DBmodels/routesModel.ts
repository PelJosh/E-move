import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const routesSchema = new Schema({
	pickupStation: {
		type: String,
		required: true
	},

	destination: {
		type: String,
		required: true
	},

	price: {
		type: Number,
		required: true
	}
});
const routesModel = mongoose.model('routes', routesSchema);

export default routesModel;
