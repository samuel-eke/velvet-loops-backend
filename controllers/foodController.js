import foodModel from "../models/foodModel.js";

// 📌 List all foods (include images as Base64)
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    
    // convert each food's image buffer to base64 string
    const foodsWithImages = foods.map(food => ({
      _id: food._id,
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: food.image?.data 
        ? `data:${food.image.contentType};base64,${food.image.data.toString("base64")}` 
        : null
    }));

    res.json({ success: true, data: foodsWithImages });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching foods" });
  }
};

// 📌 Add new food with image
const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await food.save();
    res.json({ success: true, message: "Food Added", food });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error adding food" });
  }
};

// 📌 Remove food
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findByIdAndDelete(req.body.id);

    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error removing food" });
  }
};

export { listFood, addFood, removeFood };
