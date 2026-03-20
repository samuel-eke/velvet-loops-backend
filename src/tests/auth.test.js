import request from "supertest";
import app from "../../app";

describe ("POST /api/user/register", () => {
    it('should register a new user and return a token', async () => {
        const res = await request(app)
        .post('/api/user/register')
        .send({
            name: 'Test user',
            email: 'test@example.com',
            password: 'password123'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('token');
    });

    it('should reject registration with a duplicate email', async () => {
        await request(app).post('/api/user/register').send({
            name: 'Test User',
            email: 'duplicate@example.com',
            password: 'password123'
        });

        const res = await request(app).post('/api/user/register').send({
            name: 'Another user',
            email: 'duplicate@example.com',
            password: 'password456'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User already exists');
    });

    it("should reject registration with missing name or password", async () => {
        const res = await request(app)
            .post("/api/user/register")
            .send({email: "incomplete@example.com"});

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(false);
    });

    
});

describe("POST /api/user/login", () => {
    beforeEach(async() => {
        await request(app).post('/api/user/register').send({
            name: "login test user",
            email: "login@example.com",
            password: "password123"
        });
    });

    it('should login with valid credentials and return a token', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'login@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'login@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'ghost@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User does not exist");
  });
});