
// test/app.test.js

const request = require("supertest");
const chai = require("chai");
const app = require("../app"); // path to your app.js file
const { describe, it } = require("mocha");

const expect = chai.expect;


const client_id = Buffer.from("coffee-project:").toString("base64");

describe("Coffee Delivery Service API", () => {
    describe("GET /coffees", () => {
        it("should return a list of available coffees", (done) => {
            request(app).post("/token").set({"authorization":`Basic ${client_id}`}).send().end((err,res) =>{
                let access_token = res.body.access_token;
                request(app)
                    .get("/coffees").set({"authorization":`Bearer ${access_token}`})
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(200);
                        expect(res.body).to.be.an("array");
                        done();
                    });
            }
            );
        });
    });

    describe("POST /order", () => {
        it("should place an order", (done) => {
            request(app).post("/token").set({"authorization":`Basic ${client_id}`}).send().end((err,res) =>{
                let access_token = res.body.access_token;
                request(app)
                    .post("/order")
                    .send({ coffeeId: 1, quantity: 2 })
                    .set({"authorization":`Bearer ${access_token}`})
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(201);
                        expect(res.body).to.be.an("object");
                        expect(res.body).to.have.property("orderId");
                        done();
                    });
            });
        });

        it("should return an error for invalid coffee ID", (done) => {
            request(app).post("/token").set({"authorization":`Basic ${client_id}`}).send().end((err,res) =>{
                let access_token = res.body.access_token;
                request(app)
                    .post("/order")
                    .send({ coffeeId: 999, quantity: 2 })
                    .set({"authorization":`Bearer ${access_token}`})
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(400);
                        done();
                    });
            });
        });
    });

    describe("GET /orders", () => {
        it("should return a list of placed orders", (done) => {
            request(app).post("/token").set({"authorization":`Basic ${client_id}`}).send().end((err,res) =>{
                let access_token = res.body.access_token;
                request(app)
                    .get("/orders")
                    .set({"authorization":`Bearer ${access_token}`})
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(200);
                        expect(res.body).to.be.an("array");
                        done();
                    });
            });
        });
    });
});
