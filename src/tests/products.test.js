import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import foodModel from "../../models/productModel";

describe("Product API endpoints", () => {
    it("should add a new food product with an image", async () => {
        const res = await request(app)
            .post("/api/food/add")
            .field("name", "Test Food")
            .field("description", "Test Description")
            .field("price", 10)
            .field("category", "Test Category")
            .attach("image", Buffer.from("dummy image content"), "test.jpg");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Food Added");
        expect(res.body.food).toHaveProperty("_id");
    });

    it("should fail to add food if image is missing", async () => {
        const res = await request(app)
            .post("/api/food/add")
            .field("name", "No Image Food")
            .field("description", "No Image Description")
            .field("price", 15)
            .field("category", "Test Category");

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Image is required");
    });

    it("should list all food products", async () => {
        // Prepare state strictly within test to avoid setup.js afterEach drops
        const food = new foodModel({
            name: "List Food",
            description: "List Description",
            price: 20,
            category: "List",
            image: { data: Buffer.from("dummy"), contentType: "image/jpeg" }
        });
        const savedFood = await food.save();

        const res = await request(app).get("/api/food/list");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        
        const returnedFood = res.body.data.find(f => f._id === savedFood._id.toString());
        expect(returnedFood).toBeDefined();
        expect(returnedFood.image).toMatch(/^data:image\/jpeg;base64,/);
    });

    it("should remove a food product", async () => {
        // Prepare state strictly within test
        const food = new foodModel({
            name: "Remove Food",
            description: "Remove Description",
            price: 5,
            category: "Remove",
            image: { data: Buffer.from("dummy"), contentType: "image/jpeg" }
        });
        const savedFood = await food.save();
        const foodId = savedFood._id.toString();

        const res = await request(app)
            .post("/api/food/remove")
            .send({ id: foodId });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Food Removed");
    });

    it("should return 404 when removing non-existent food", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post("/api/food/remove")
            .send({ id: fakeId });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Food not found");
    });
});