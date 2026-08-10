let products = [

  {
    id: 1,
    name: "Elegant Evening Dress",
    price: 3500,
    category: "dresses",
    description: "Elegant full-length dress for special occasions.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Red", "Wine"],
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85"
  },

  {
    id: 2,
    name: "Classic Ladies Outfit",
    price: 3200,
    category: "women",
    description: "Stylish complete outfit for everyday elegance.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Brown"],
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=85"
  },

  {
    id: 3,
    name: "Men's Smart Outfit",
    price: 4500,
    category: "men",
    description: "Smart and elegant men's complete outfit.",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "Grey"],
    image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=800&q=85"
  },

  {
    id: 4,
    name: "Ladies Fashion Shoes",
    price: 2800,
    category: "shoes",
    description: "Elegant shoes designed to complete your outfit.",
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: ["Black", "Beige", "Brown"],
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=85"
  },

  {
    id: 5,
    name: "Luxury Party Dress",
    price: 5500,
    category: "dresses",
    description: "Premium party dress with an elegant finish.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Gold", "Red"],
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=85"
  },

  {
    id: 6,
    name: "Ladies Casual Wear",
    price: 3000,
    category: "women",
    description: "Comfortable and stylish casual fashion.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Pink"],
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=85"
  },

  {
    id: 7,
    name: "Classic Handbag",
    price: 2200,
    category: "accessories",
    description: "Elegant handbag to complete your look.",
    sizes: ["Standard"],
    colors: ["Black", "Brown", "Cream"],
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85"
  },

  {
    id: 8,
    name: "Premium Men's Shoes",
    price: 4200,
    category: "shoes",
    description: "Smart shoes suitable for formal and casual outfits.",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Black", "Brown"],
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=85"
  }

];


let cart = [];
let activeCategory = "all";


function formatMoney(amount) {

  return "KSh " + Number(amount).toLocaleString("en-KE");

}


function displayProducts(list = products) {

  const container = document.getElementById("products");

  container.innerHTML = "";

  if (!list.length) {

    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px">
        <h3>No products found</h3>
        <p style="color:#777;margin-top:8px">
          Try another search.
        </p>
      </div>
    `;

    return;

  }


  list.forEach(product => {

    container.innerHTML += `

      <article class="product">

        <div class="product-image">

          <img
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
          >

          <span class="product-badge">
            AVAILABLE
          </span>

        </div>


        <div class="product-info">

          <h3>${product.name}</h3>

          <p class="product-description">
            ${product.description}
          </p>

          <div class="product-price">
            ${formatMoney(product.price)}
          </div>

          <button
            class="add-button"
            onclick="chooseProduct(${product.id})">

            SELECT OPTIONS

          </button>

        </div>

      </article>

    `;

  });

}


/*
  PRODUCT OPTION SELECTION
*/

function chooseProduct(id) {

  const product = products.find(p => p.id === id);

  if (!product) return;


  let size = product.sizes[0];

  let color = product.colors[0];


  const sizeChoice = prompt(
    "Choose size:\n" +
    product.sizes.join(" | ")
  );

  if (sizeChoice) {

    const foundSize = product.sizes.find(
      s => s.toLowerCase() === sizeChoice.trim().toLowerCase()
    );

    if (!foundSize) {

      alert(
        "Invalid size. Available: " +
        product.sizes.join(", ")
      );

      return;

    }

    size = foundSize;

  }


  const colorChoice = prompt(
    "Choose colour:\n" +
    product.colors.join(" | ")
  );

  if (colorChoice) {

    const foundColor = product.colors.find(
      c => c.toLowerCase() === colorChoice.trim().toLowerCase()
    );

    if (!foundColor) {

      alert(
        "Invalid colour. Available: " +
        product.colors.join(", ")
      );

      return;

    }

    color = foundColor;

  }


  addToCart(product, size, color);

}


/*
  CART
*/

function addToCart(product, size, color) {

  const existing = cart.find(item =>
    item.id === product.id &&
    item.size === size &&
    item.color === color
  );


  if (existing) {

    existing.quantity++;

  } else {

    cart.push({

      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,

      size,
      color,

      quantity: 1

    });

  }


  updateCart();

  openCart();

}


function updateCart() {

  const container =
    document.getElementById("cartItems");

  container.innerHTML = "";

  let total = 0;
  let count = 0;


  cart.forEach((item, index) => {

    const itemTotal =
      item.price * item.quantity;

    total += itemTotal;

    count += item.quantity;


    container.innerHTML += `

      <div class="cart-item">

        <div class="cart-item-top">

          <img
            class="cart-item-image"
            src="${item.image}"
            alt="${item.name}"
          >

          <div class="cart-item-details">

            <h4>${item.name}</h4>

            <div class="cart-meta">
              Size: ${item.size}
              • Colour: ${item.color}
            </div>

            <div class="cart-price">
              ${formatMoney(item.price)}
            </div>

            <div class="quantity-controls">

              <button
                onclick="changeQuantity(${index}, -1)">
                −
              </button>

              <strong>${item.quantity}</strong>

              <button
                onclick="changeQuantity(${index}, 1)">
                +
              </button>

              <button
                class="remove"
                onclick="removeItem(${index})">
                Remove
              </button>

            </div>

          </div>

        </div>

      </div>

    `;

  });


  document.getElementById("cartCount").textContent =
    count;

  document.getElementById("subtotal").textContent =
    formatMoney(total);

  document.getElementById("cartTotal").textContent =
    formatMoney(total);

}


function changeQuantity(index, change) {

  if (!cart[index]) return;

  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {

    cart.splice(index, 1);

  }

  updateCart();

}


function removeItem(index) {

  cart.splice(index, 1);

  updateCart();

}


function openCart() {

  document
    .getElementById("cart")
    .classList.add("open");

  document
    .getElementById("overlay")
    .classList.add("show");

}


function closeCart() {

  document
    .getElementById("cart")
    .classList.remove("open");

  document
    .getElementById("overlay")
    .classList.remove("show");

}


/*
  CHECKOUT
*/

function openCheckout() {

  if (!cart.length) {

    alert("Your cart is empty.");

    return;

  }


  closeCart();

  buildCheckoutSummary();

  document
    .getElementById("checkoutModal")
    .classList.add("show");

}


function closeCheckout() {

  document
    .getElementById("checkoutModal")
    .classList.remove("show");

}


function buildCheckoutSummary() {

  let total = 0;

  const summary =
    document.getElementById("checkoutSummary");

  summary.innerHTML = "";


  cart.forEach(item => {

    const itemTotal =
      item.price * item.quantity;

    total += itemTotal;


    summary.innerHTML += `

      <div class="checkout-product">

        <span>
          ${item.name}
          × ${item.quantity}
          (${item.size}, ${item.color})
        </span>

        <strong>
          ${formatMoney(itemTotal)}
        </strong>

      </div>

    `;

  });


  document.getElementById("checkoutTotal").textContent =
    formatMoney(total);

}


/*
  PAYMENT
*/

document
  .getElementById("checkoutForm")
  .addEventListener("submit", async function(event) {

    event.preventDefault();


    if (!cart.length) {

      alert("Your cart is empty.");

      return;

    }


    const name =
      document.getElementById("customerName")
      .value.trim();


    const phone =
      document.getElementById("customerPhone")
      .value.trim();


    const location =
      document.getElementById("customerLocation")
      .value.trim();


    const address =
      document.getElementById("customerAddress")
      .value.trim();


    if (!name || !phone || !location) {

      alert("Please complete your details.");

      return;

    }


    const total = cart.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );


    const button =
      document.querySelector(".pay-button");


    button.disabled = true;

    button.textContent =
      "PROCESSING PAYMENT...";


    try {

      const response = await fetch(
        "/api/pay",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            name,
            phone,
            location,
            address,

            amount: total,

            items: cart.map(item => ({

              productId: item.id,
              name: item.name,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              price: item.price

            }))

          })

        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to start payment."
        );

      }


      closeCheckout();

      showPaymentStatus(data);

    } catch (error) {

      alert(
        error.message ||
        "Something went wrong. Please try again."
      );

    } finally {

      button.disabled = false;

      button.textContent =
        "🔒 PAY WITH M-PESA";

    }

  });


function showPaymentStatus(data) {

  document
    .getElementById("paymentModal")
    .classList.add("show");


  document.getElementById("paymentIcon")
    .textContent = "📱";


  document.getElementById("paymentTitle")
    .textContent =
    "Check Your Phone";


  document.getElementById("paymentMessage")
    .textContent =
    "An M-Pesa STK Push has been sent. Enter your M-Pesa PIN to complete your payment.";


  document.getElementById("orderNumber")
    .textContent =
    "Order: " + data.orderId;


  /*
    The server callback is the authoritative
    payment confirmation.

    We also poll the server so the customer
    sees the status without refreshing.
  */

  pollPayment(data.orderId);

}


async function pollPayment(orderId) {

  let attempts = 0;

  const maxAttempts = 30;


  const interval = setInterval(async () => {

    attempts++;


    try {

      const response =
        await fetch(
          `/api/orders/${encodeURIComponent(orderId)}`
        );


      if (!response.ok) return;


      const order =
        await response.json();


      if (order.status === "PAID") {

        clearInterval(interval);

        document.getElementById("paymentIcon")
          .textContent = "✅";

        document.getElementById("paymentTitle")
          .textContent =
          "Payment Successful";

        document.getElementById("paymentMessage")
          .textContent =
          "Your order has been received successfully. Thank you for shopping with Madam Eva Boutique.";

        document.getElementById("paymentLoader")
          .style.display = "none";

        cart = [];

        updateCart();

      }


      if (order.status === "FAILED") {

        clearInterval(interval);

        document.getElementById("paymentIcon")
          .textContent = "❌";

        document.getElementById("paymentTitle")
          .textContent =
          "Payment Failed";

        document.getElementById("paymentMessage")
          .textContent =
          "The payment was not completed. You can close this window and try again.";

        document.getElementById("paymentLoader")
          .style.display = "none";

      }


    } catch (error) {

      console.error(error);

    }


    if (attempts >= maxAttempts) {

      clearInterval(interval);

      document.getElementById("paymentLoader")
        .style.display = "none";

      document.getElementById("paymentMessage")
        .textContent =
        "Payment is still being processed. Please check your M-Pesa messages before trying again.";

    }

  }, 3000);

}


function closePayment() {

  document
    .getElementById("paymentModal")
    .classList.remove("show");

}


function filterProducts(category, button) {

  activeCategory = category;


  document
    .querySelectorAll(".category")
    .forEach(btn =>
      btn.classList.remove("active")
    );


  button.classList.add("active");


  applyFilters();

}


function searchProducts() {

  applyFilters();

}


function applyFilters() {

  const search =
    document.getElementById("search")
      .value
      .toLowerCase()
      .trim();


  let filtered = products;


  if (activeCategory !== "all") {

    filtered = filtered.filter(
      product =>
        product.category === activeCategory
    );

  }


  if (search) {

    filtered = filtered.filter(product =>

      product.name
        .toLowerCase()
        .includes(search) ||

      product.description
        .toLowerCase()
        .includes(search)

    );

  }


  displayProducts(filtered);

}


function scrollToShop() {

  document
    .getElementById("shop")
    .scrollIntoView({
      behavior: "smooth"
    });

}


displayProducts();

updateCart();
