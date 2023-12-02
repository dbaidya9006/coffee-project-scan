
// example token request
//> POST /token HTTP/1.1
//>Host: localhost:8080
//> User-Agent: insomnia/2023.5.8
//> Content-Type: application/x-www-form-urlencoded
//> Accept: application/x-www-form-urlencoded, application/json
//> Authorization: Basic b3dvOnV3dQ==
//> Content-Length: 29
// example token response:
// {"access_token":"TOKEN","expires_in":3600,"token_type":"Bearer"}

var token;
document.addEventListener("DOMContentLoaded", () => {
    axios.post("/token", { client_id: "coffee-project" }, {headers: {"Authorization": `Basic ${btoa("coffee-project:")}`}})
        .then(response => {
            console.log(response.data);
            token = response.data.access_token;
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            axios.get("/coffees")
                .then(response => {
                    const coffeeList = document.getElementById("coffeeList");
                    response.data.forEach(coffee => {
                        const listItem = document.createElement("li");
                        listItem.textContent = `${coffee.name} - $${coffee.price}`;
                        const orderButton = document.createElement("button");
                        orderButton.textContent = "Order";
                        orderButton.onclick = () => placeOrder(coffee.id);
                        listItem.appendChild(orderButton);
                        coffeeList.appendChild(listItem);
                    });
                });
        })
        .catch(error => {
            alert(`Error authenticating: ${error}`);
        });
});

function placeOrder(coffeeId) {
    axios.post("/order", { coffeeId: coffeeId, quantity: 1 })
        .then(response => {
            alert(`Ordered ${response.data.coffeeName}! Total: $${response.data.total}`);
        })
        .catch(error => {
            alert(`Error placing order: ${error}`);
        });
}
