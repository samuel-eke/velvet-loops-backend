import request from "supertest";
import app from "../../app";
import userModel from "../../models/userModel";
import orderModel from "../../models/orderModel";
import mongoose from "mongoose";

// Mock stripe to prevent real API calls
jest.mock("stripe", () => {
    return jest.fn().mockImplementation(() => {
        return {
            checkout: {
                sessions: {
                    create: jest.fn().mockResolvedValue({ url: "http://mock-stripe-url.com" })
                }
            }
        };
    });
});

describe("Order API endpoints", () => {
    let token;
    let userEmail = "order@example.com";
    let userId;

    beforeEach(async () => {
        // Create user for authenticated requests
        const regRes = await request(app)
            .post("/api/user/register")
            .send({
                name: "Order Test User",
                email: userEmail,
                password: "password123"
            });
        token = regRes.body.token;

        const user = await userModel.findOne({ email: userEmail });
        userId = user._id.toString();
    });

    it("should place an order using stripe", async () => {
        const orderData = {
            items: [{ name: "Test Item", price: 10, quantity: 2 }],
            amount: 25,
            address: { 
                firstName: "John", 
                lastName: "Doe", 
                street: "123 Test St", 
                city: "Testville", 
                state: "TS", 
                zipcode: "12345", 
                country: "Testland", 
                phone: "1234567890" 
            }
        };

        const res = await request(app)
            .post("/api/order/place")
            .set("token", token)
            .send(orderData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.session_url).toBe("http://mock-stripe-url.com");

        // Verify order saved
        const userOrders = await orderModel.find({ userId });
        expect(userOrders.length).toBe(1);
        expect(userOrders[0].amount).toBe(25);
    });

    it("should place a COD order", async () => {
        const orderData = {
            items: [{ name: "COD Item", price: 15, quantity: 1 }],
            amount: 20,
            address: { city: "CODville" }
        };

        const res = await request(app)
            .post("/api/order/placecod")
            .set("token", token)
            .send(orderData);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Order Placed");

        // Verify cart is empty and order is saved
        const user = await userModel.findOne({ email: userEmail });
        expect(user.cartData).toEqual({});

        const userOrders = await orderModel.find({ userId });
        expect(userOrders.length).toBe(1);
        expect(userOrders[0].payment).toBe(true);
    });

    it("should list all orders for admin", async () => {
        // Pre-insert an order
        const newOrder = new orderModel({
            userId,
            items: [],
            amount: 50,
            address: {}
        });
        await newOrder.save();

        const res = await request(app).get("/api/order/list");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should list user orders", async () => {
        // Pre-insert an order
        const newOrder = new orderModel({
            userId,
            items: [],
            amount: 75,
            address: {}
        });
        await newOrder.save();

        const res = await request(app)
            .post("/api/order/userorders")
            .set("token", token)
            .send({});

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].amount).toBe(75);
    });

    it("should update order status", async () => {
        const newOrder = new orderModel({
            userId,
            items: [],
            amount: 100,
            address: {}
        });
        const savedOrder = await newOrder.save();
        const orderId = savedOrder._id.toString();

        const res = await request(app)
            .post("/api/order/status")
            .send({ orderId, status: "Out for delivery" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Status Updated");

        const checkedOrder = await orderModel.findById(orderId);
        expect(checkedOrder.status).toBe("Out for delivery");
    });

    it("should verify order payment successfully", async () => {
        const newOrder = new orderModel({
            userId,
            items: [],
            amount: 120,
            address: {}
        });
        const savedOrder = await newOrder.save();
        const orderId = savedOrder._id.toString();

        const res = await request(app)
            .post("/api/order/verify")
            .send({ orderId, success: "true" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Paid");

        const checkedOrder = await orderModel.findById(orderId);
        expect(checkedOrder.payment).toBe(true);
    });

    it("should mark order as not paid and delete if success is not 'true'", async () => {
        const newOrder = new orderModel({
            userId,
            items: [],
            amount: 150,
            address: {}
        });
        const savedOrder = await newOrder.save();
        const orderId = savedOrder._id.toString();

        const res = await request(app)
            .post("/api/order/verify")
            .send({ orderId, success: "false" }); // Controller expects string "true" or anything else

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Not Paid");

        const checkedOrder = await orderModel.findById(orderId);
        expect(checkedOrder).toBeNull();
    });
});
