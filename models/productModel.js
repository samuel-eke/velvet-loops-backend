import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: {
    data: Buffer,            // binary image data
    contentType: String      // e.g., "image/jpeg" or "image/png"
  },
  category: { type: String, required: true }
});

const foodModel = mongoose.models.food || mongoose.model("product", productSchema);
export default foodModel;