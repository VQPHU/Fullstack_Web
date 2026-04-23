import mongoose from "mongoose";

const componentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
});

export default mongoose.model("Component", componentSchema);