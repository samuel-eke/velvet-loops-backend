import request from "supertest";
import app from "../../app";
import foodModel from "../../models/productModel";
import userModel from "../../models/userModel";

describe("Cart API endpoints", () => {
    let token;
    let itemId;
    let userEmail = "cart@example.com";

    beforeEach(async () => {
        // Populate standard state properly on EACH test so setup.js afterEach wiping is irrelevant
        const regRes = await request(app)
            .post("/api/user/register")
            .send({
                name: "Cart Test User",
                email: userEmail,
                password: "password123"
            });
        token = regRes.body.token;

        const food = new foodModel({
            name: "Cart Test Food",
            description: "Cart Test Description",
            price: 5,
            category: "Test Category",
            image: {
                data: Buffer.from("dummy"),
                contentType: "image/jpeg"
            }
        });
        const savedFood = await food.save();
        itemId = savedFood._id.toString();
    });

    it("should add an item to the cart", async () => {
        const res = await request(app)
            .post("/api/cart/add")
            .set("token", token)
            .send({ itemId });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Added To Cart");

        const user = await userModel.findOne({ email: userEmail });
        expect(user.cartData[itemId]).toBe(1);
    });

    it("should get the user's cartData", async () => {
        // Pre-fill the cart to verify 'get'
        await userModel.findOneAndUpdate(
            { email: userEmail },
            { cartData: { [itemId]: 2 } }
        );

        const res = await request(app)
            .post("/api/cart/get")
            .set("token", token)
            .send({});

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.cartData).toHaveProperty(itemId);
        expect(res.body.cartData[itemId]).toBe(2);
    });

    it("should remove an item from the cart", async () => {
        // Pre-fill the cart with 1 existing entry
        await userModel.findOneAndUpdate(
            { email: userEmail },
            { cartData: { [itemId]: 1 } }
        );

        const res = await request(app)
            .post("/api/cart/remove")
            .set("token", token)
            .send({ itemId });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Removed From Cart");

        const user = await userModel.findOne({ email: userEmail });
        expect(user.cartData[itemId]).toBe(0);
    });

    it("should fail if unauthorized", async () => {
        const res = await request(app)
            .post("/api/cart/add")
            .send({ itemId });

        expect(res.statusCode).toBe(200); // the auth controller returns generic 200 {success: false} 
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Not Authorized Login Again");
    });
});