// FOODGO FOOD ITEMS

const foods = [
    { id: 1, name: "Farm Fresh Pizza", category: "Pizza", price: 250, emoji: "🍕", desc: "Cheesy pizza with fresh vegetables." },
    { id: 2, name: "Classic Burger", category: "Burger", price: 150, emoji: "🍔", desc: "Crispy patty with fresh lettuce." },
    { id: 3, name: "Chicken Biryani", category: "Indian", price: 200, emoji: "🍛", desc: "Aromatic rice with delicious spices." },
    { id: 4, name: "Masala Dosa", category: "Indian", price: 120, emoji: "🥞", desc: "Crispy dosa served with chutney." },
    { id: 5, name: "Veg Pizza", category: "Pizza", price: 220, emoji: "🍕", desc: "Loaded with fresh vegetables and cheese." },
    { id: 6, name: "Chocolate Cake", category: "Dessert", price: 130, emoji: "🍰", desc: "Soft chocolate cake with rich frosting." },
    { id: 7, name: "French Fries", category: "Burger", price: 100, emoji: "🍟", desc: "Crispy golden fries with seasoning." },
    { id: 8, name: "Gulab Jamun", category: "Dessert", price: 90, emoji: "🍮", desc: "Soft sweet dumplings in sugar syrup." }
];

// INITIAL DATA

let cart = JSON.parse(localStorage.getItem("foodgo_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("foodgo_orders") || "[]");
let category = "All";
// AUTOMATIC ORDER TRACKING
const orderTimers = {};
let currentTrackingId = null;

const orderStatuses = [
    "Preparing",
    "Confirmed",
    "Out for Delivery",
    "Delivered"
];
// SAVE DATA

function save() {
    localStorage.setItem("foodgo_cart", JSON.stringify(cart));
    localStorage.setItem("foodgo_orders", JSON.stringify(orders));
}

// DISPLAY MENU

function renderMenu() {

    const q = document.getElementById("searchInput").value.toLowerCase();

    const list = foods.filter(f =>
        (category === "All" || f.category === category) &&
        f.name.toLowerCase().includes(q)
    );

    document.getElementById("foodGrid").innerHTML = list.length
        ? list.map(f => `
        <article class="food-card">
            <div class="food-img">${f.emoji}</div>

            <div class="food-info">
                <h3>${f.name}</h3>
                <p>${f.desc}</p>

                <div class="food-bottom">
                    <span class="price">₹${f.price}</span>
                    <button class="add" onclick="addToCart(${f.id})">
                        + Add
                    </button>
                </div>
            </div>
        </article>
    `).join("")
        : `<div class="empty">No food items found.</div>`;
}

// CATEGORY FILTER

function setCategory(c, btn) {

    category = c;

    document.querySelectorAll(".filter").forEach(x =>
        x.classList.remove("active")
    );

    btn.classList.add("active");

    renderMenu();
}

// ADD TO CART

function addToCart(id) {

    const item = cart.find(x => x.id === id);

    if (item) {
        item.qty++;
    } else {
        cart.push({ id: id, qty: 1 });
    }

    save();
    updateCartCount();
    showToast("Item added to cart");
}

// CART COUNT

function updateCartCount() {

    document.getElementById("cartCount").textContent =
        cart.reduce((s, x) => s + x.qty, 0);
}

// CART TOTAL

function cartTotal() {

    return cart.reduce((sum, x) => {

        const f = foods.find(y => y.id === x.id);

        return sum + (f ? f.price * x.qty : 0);

    }, 0);
}

// OPEN CART

function openCart() {

    const box = document.getElementById("cartItems");

    if (!cart.length) {

        box.innerHTML = `
            <div class="empty">
                Your cart is empty.<br>
                Add some delicious food first!
            </div>
        `;

    } else {

        box.innerHTML = cart.map(x => {

            const f = foods.find(y => y.id === x.id);

            if (!f) return "";

            return `
                <div class="cart-item">

                    <div class="emoji">${f.emoji}</div>

                    <div class="cart-item-info">
                        <b>${f.name}</b>
                        <small>₹${f.price} each</small>
                    </div>

                    <div class="qty">
                        <button onclick="changeQty(${f.id},-1)">−</button>
                        <b>${x.qty}</b>
                        <button onclick="changeQty(${f.id},1)">+</button>
                    </div>

                    <button class="remove" onclick="removeItem(${f.id})">
                        Remove
                    </button>

                </div>
            `;

        }).join("");
    }

    document.getElementById("cartTotal").textContent =
        "₹" + cartTotal();

    document.getElementById("cartModal").classList.remove("hidden");
}

// CLOSE CART

function closeCart() {
    document.getElementById("cartModal").classList.add("hidden");
}

// CHANGE QUANTITY

function changeQty(id, d) {

    const x = cart.find(i => i.id === id);

    if (!x) return;

    x.qty += d;

    if (x.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }

    save();
    updateCartCount();
    openCart();
}

// REMOVE ITEM

function removeItem(id) {

    cart = cart.filter(i => i.id !== id);

    save();
    updateCartCount();
    openCart();
}

// OPEN CHECKOUT

function goCheckout() {

    if (!cart.length) {
        showToast("Your cart is empty");
        return;
    }

    closeCart();

    document.getElementById("checkoutTotal").textContent =
        "₹" + cartTotal();

    document.getElementById("checkoutModal").classList.remove("hidden");

    updatePaymentSection();
}

// CLOSE CHECKOUT

function closeCheckout() {
    document.getElementById("checkoutModal").classList.add("hidden");
}

// ========================================
// PAYMENT METHOD SYSTEM
// ========================================

const paymentSelect = document.getElementById("payment");

const upiSection = document.getElementById("upiSection");

const cardSection = document.getElementById("cardSection");

const upiQR = document.getElementById("upiQR");

// UPDATE PAYMENT DISPLAY

function updatePaymentSection() {

    const method = paymentSelect.value;

    upiSection.classList.add("hidden");
    cardSection.classList.add("hidden");

    if (method === "UPI") {

        upiSection.classList.remove("hidden");

        generateUPIQR();

    }

    else if (method === "Card") {

        cardSection.classList.remove("hidden");

    }
}

// LISTEN TO PAYMENT METHOD

paymentSelect.addEventListener("change", updatePaymentSection);

// GENERATE UPI QR CODE

function generateUPIQR() {

    upiQR.innerHTML = "";

    if (typeof QRCode === "undefined") {

        upiQR.textContent = "QR library unavailable. Please check your internet connection.";

        return;
    }

    new QRCode(upiQR, {
        text: "foodgo@upi",
        width: 180,
        height: 180,
        colorDark: "#171717",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// CARD NUMBER FORMATTING

document.getElementById("cardNumber").addEventListener("input", function () {

    let value = this.value.replace(/\D/g, "").substring(0, 16);

    this.value = value.replace(/(.{4})/g, "$1 ").trim();

});

// CARD EXPIRY FORMATTING

document.getElementById("cardExpiry").addEventListener("input", function () {

    let value = this.value.replace(/\D/g, "").substring(0, 4);

    if (value.length > 2) {
        value = value.substring(0, 2) + "/" + value.substring(2);
    }

    this.value = value;

});

// CVV ONLY NUMBERS

document.getElementById("cardCVV").addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, "").substring(0, 4);

});

// CARD VALIDATION

function validateCard() {

    const name = document.getElementById("cardName").value.trim();

    const number = document.getElementById("cardNumber").value.replace(/\s/g, "");

    const expiry = document.getElementById("cardExpiry").value;

    const cvv = document.getElementById("cardCVV").value;

    if (name.length < 2) {
        showToast("Enter cardholder name");
        return false;
    }

    if (!/^\d{16}$/.test(number)) {
        showToast("Enter a valid 16-digit card number");
        return false;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        showToast("Enter expiry in MM/YY format");
        return false;
    }

    const [month, year] = expiry.split("/").map(Number);

    const currentDate = new Date();

    const currentMonth = currentDate.getMonth() + 1;

    const currentYear = currentDate.getFullYear() % 100;

    if (
        year < currentYear ||
        (year === currentYear && month < currentMonth)
    ) {
        showToast("Card has expired");
        return false;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        showToast("Enter a valid CVV");
        return false;
    }

    return true;
}

// ========================================
// PLACE ORDER
// ========================================

document.getElementById("checkoutForm").addEventListener("submit", function (e) {

    e.preventDefault();

    if (!cart.length) {
        showToast("Your cart is empty");
        return;
    }

    const payment = paymentSelect.value;

    // Validate card if Card is selected

    if (payment === "Card") {

        if (!validateCard()) {
            return;
        }
    }

    // Create order

    const order = {

        id: "FG" + Date.now().toString().slice(-6),

        name: document.getElementById("customerName").value,

        mobile: document.getElementById("mobile").value,

        address: document.getElementById("address").value,

        payment: payment,

        total: cartTotal(),

        date: new Date().toLocaleString(),

        status: "Preparing"

    };

    orders.unshift(order);

startOrderTracking(order.id);

cart = [];

    save();

    updateCartCount();

    closeCheckout();

    // Reset checkout form

    this.reset();

    // Hide payment sections

    upiSection.classList.add("hidden");

    cardSection.classList.add("hidden");

    renderOrders();

    showToast("Order placed successfully");

    setTimeout(() => trackOrder(order.id), 400);

});
// AUTOMATIC STATUS UPDATES

function startOrderTracking(id) {

    if (orderTimers[id]) return;

    function updateStatus() {

        const order = orders.find(o => o.id === id);

        if (!order) {
            delete orderTimers[id];
            return;
        }

        const currentIndex = orderStatuses.indexOf(order.status);

        // Remove order 10 seconds after Delivered
        if (currentIndex === orderStatuses.length - 1) {

            orderTimers[id] = setTimeout(() => {

                orders = orders.filter(o => o.id !== id);

                delete orderTimers[id];

                save();
                renderOrders();

                if (currentTrackingId === id) {
                    closeTracking();
                }

                showToast("Order delivered and removed from history");

            }, 10000);

            return;
        }

        // Move to next status
        order.status = orderStatuses[currentIndex + 1];

        save();
        renderOrders();

        // Update tracking popup
        if (currentTrackingId === id) {

            document.getElementById("trackingId").textContent =
                "Order #" + id + " • Current status: " + order.status;
        }

        // Schedule next status
        orderTimers[id] = setTimeout(() => {
            delete orderTimers[id];
            updateStatus();
        }, 10000);
    }

    orderTimers[id] = setTimeout(() => {
        delete orderTimers[id];
        updateStatus();
    }, 10000);
}
// ========================================
// ORDER HISTORY
// ========================================

function renderOrders() {

    const el = document.getElementById("orderHistory");

    if (!orders.length) {

        el.innerHTML = `
            <div class="empty">
                No orders yet. Place your first order from the menu.
            </div>
        `;

        return;
    }

    el.innerHTML = orders.map(o => `

        <div class="order-card">

            <div>
                <b>Order #${o.id}</b>
                <br>

                <small>${o.date} • ${o.payment}</small>
                <br>

                <strong>₹${o.total}</strong>
            </div>

            <div>
                <span class="status">${o.status}</span>

                <button class="track-btn"
                    onclick="trackOrder('${o.id}')">
                    Track
                </button>
            </div>

        </div>

    `).join("");
}

// TRACK ORDER

// TRACK ORDER

function trackOrder(id) {

    const order = orders.find(o => o.id === id);

    if (!order) {
        showToast("Order not found");
        return;
    }

    currentTrackingId = id;

    document.getElementById("trackingId").textContent =
        "Order #" + id + " • Current status: " + order.status;

    document.getElementById("trackingModal").classList.remove("hidden");
}

// CLOSE TRACKING

function closeTracking() {

    currentTrackingId = null;

    document.getElementById("trackingModal").classList.add("hidden");
}

// TOAST MESSAGE

function showToast(msg) {

    const t = document.getElementById("toast");

    t.textContent = msg;

    t.classList.add("show");

    setTimeout(() => {
        t.classList.remove("show");
    }, 2200);
}

// ========================================
// INITIALIZE FOODGO
// ========================================

renderMenu();

renderOrders();

updateCartCount();

updatePaymentSection();