import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  reference: { type: String, required: true },
});

const Donor = mongoose.model("donor", donorSchema);
export default Donor;
