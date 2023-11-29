// app.js

const express = require("express");
const { coffees, orders } = require("./data");
const flags = require("./flags.json");
const status = require("./status.json");
const moment = require("moment");
const app = express();
// const PORT = 3000;
const PORT = 8080;

app.use(express.json());
app.use(express.static("public"));
module.exports = app;

let client_credentials = {"coffee-project": ""};
client_credentials[process.env.client_id] =  process.env.client_secret;
let tokens = {};

app.post("/token", (req, res) => {
    // check for auth header
    if (req.headers.authorization) {
        let [auth_type, auth_creds] = req.headers.authorization.split(" ");
        // Ensure we have credentials and are using basic auth
        if (auth_type.toLowerCase() == "basic" && auth_creds) {
            let [client_id, client_secret] = Buffer.from(auth_creds,"base64").toString().split(":");
            // verify client info
            if (client_credentials[client_id] == client_secret) {
                let access_token = Buffer.from(`${moment().format()}:${client_id}`).toString("base64");
                // store token and expiry time
                tokens[access_token] = moment().add(1, "h");

                // return token to user
                return res.json({
                    access_token: access_token,
                    expires_in: 3600, // 1h in seconds
                    token_type: "Bearer",
                });
            }
        }
    }
    return res.status(status.UNAUTHORIZED).json({ error: "invalid credentials" });
});

function authenticated(access_token) {
    if (tokens[access_token]) { 
        return tokens[access_token].isAfter(moment());
    }
    return false;
}
app.use((req, res, next) => {
    if (req.headers.authorization) {
        let [auth_type, auth_creds] = req.headers.authorization.split(" ");
        if (auth_type.toLowerCase() == "bearer" && auth_creds){
            if (authenticated(auth_creds)) {
                next();
                return;
            }
        }
    }
    return res.status(status.UNAUTHORIZED).json({ error: "invalid credentials" });
});
app.get("/test", (req, res) => {
    res.json({ test: "test" });
});


// Endpoint to fetch available coffees
app.get("/coffees", (req, res) => {
    if (flags.endpoints.coffees) {
        res.json(coffees);
    } else {
        res.status(status.NOT_IMPLEMENTED);
    }
});

// Endpoint to place an order
app.post("/order", (req, res) => {
    if (flags.endpoints.order) {
        const { coffeeId, quantity } = req.body;

        const coffee = coffees.find((c) => c.id === coffeeId);

        if (!coffee) {
            return res
                .status(status.BAD_REQUEST)
                .json({ error: "Invalid coffee ID" });
        }

        const order = {
            orderId: orders.length + 1,
            coffeeName: coffee.name,
            quantity,
            total: coffee.price * quantity,
        };

        orders.push(order);

        res.status(status.CREATED).json(order);
    } else {
        res.status(status.NOT_IMPLEMENTED);
    }
});

// Endpoint to fetch all orders
app.get("/orders", (req, res) => {
    if (flags.endpoints.orders) {
        res.json(orders);
    } else {
        res.status(status.NOT_IMPLEMENTED);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
