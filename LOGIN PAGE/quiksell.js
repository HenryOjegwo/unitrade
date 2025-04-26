// Function to calculate and display countdown for each product

// const storageKey = "wish_list";
// const wishListEl = document.getElementById("wishlist");
// const wishList = JSON.parse(localStorage.getItem(storageKey)) || [];
// wishListEl.innerHTML = wishList.length;

//This is the timer to put on the product card
const calculateCountdown = (createdAt) => {
  const createdTime = new Date(createdAt).getTime();
  const expiryTime = createdTime + 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const now = new Date().getTime();
  const timeLeft = expiryTime - now;

  if (timeLeft <= 0) {
    return "Expired";
  }

  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
};

// Ensure countdown updates every second

// function itemClick(prod) {
//   console.log("Item clicked", prod);
//   const product = JSON.parse(atob(prod));
//   const productId = product.id;
//   console.log("Item clicked", productId);
//   const wishList = JSON.parse(localStorage.getItem(storageKey)) || [];
//   const productIndex = wishList.findIndex((item) => item.id === productId);
//   if (productIndex === -1) {
//     const product = { id: productId, createdAt: new Date().toISOString() };
//     wishList.push(product);
//     localStorage.setItem(storageKey, JSON.stringify(wishList));
//     wishListEl.innerHTML = wishList.length;
//   }
// }

const fetchProducts = async () => {
  try {
    //This calls the endpoints that filter the databse to only display products  reated less than 24 hours ago
    const response = await fetch("/get-products"); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await response.json();
    const productContainer = document.getElementById("product-list");

    // Clear existing content
    productContainer.innerHTML = "";

    // Get the current time
    const now = new Date().getTime();

    // Loop through products and display only valid ones
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");

      const countdown = calculateCountdown(product.createdat);
      //   const formattedProduct = btoa(JSON.stringify(product));

      //   productCard.innerHTML = `
      //  <button id='${product.id}' class="product-card" onclick="itemClick('${formattedProduct}')">
      //  <img src="${product.image}" alt="${product.name}" class="product-image" height="100px" width="100px" />
      // <h3>${product.name}</h3>
      // <p>${product.description}</p>
      // <p>Price: ₦${product.price}</p>
      // <p>Time Left: <span class="countdown">${countdown}</span></p>
      // //</button>
      // `;

      //   productCard
      //     .querySelector(".product-card")
      //     .addEventListener("click", itemClick);

      // Ensure the price is a number before formatting
      const formattedPrice = Number(product.price).toLocaleString();

      // Ensure the `data-createdat` attribute is set on the countdown element
      productCard.innerHTML = `
        <div class="product-card">
            <div class="love-icon">
            <i class="ri-heart-line"></i>
        </div>
        <img src="${product.image}" alt="${product.name}" class="product-image"/>
        <div product-info>
            <h3 class="product-name">${product.name}</h3>
            <p class="price">₦${formattedPrice}</p>
            <p class="expires">Time Left: <span class="countdown" data-createdat="${product.createdat}">${countdown}</span></p>
        </div>
    </div>
    `;

      // Set the `data-createdat` attribute explicitly
      const countdownElement = productCard.querySelector(".countdown");
      countdownElement.setAttribute("data-createdat", product.createdat);

      productContainer.appendChild(productCard);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

setInterval(() => {
  const countdownElements = document.querySelectorAll(".countdown");
  countdownElements.forEach((element) => {
    const createdAt = element.getAttribute("data-createdat");
    if (createdAt) {
      const countdown = calculateCountdown(createdAt);
      element.textContent = countdown;
    }
  });
}, 1000);

//Dropdown functionality
// Prevent default behavior of dropdown menu click
const dropdownIcon = document.getElementById("dropdown-icon");
const dropdownMenu = document.getElementById("dropdown-menu");

dropdownIcon.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent the page from scrolling to the top
  dropdownMenu.classList.toggle("show"); // Toggle visibility
});

// Optional: Close the dropdown menu if clicked outside
document.addEventListener("click", (event) => {
  if (
    !dropdownIcon.contains(event.target) &&
    !dropdownMenu.contains(event.target)
  ) {
    dropdownMenu.classList.remove("show");
  }
});

// Call fetchProducts when the page loads
document.addEventListener("DOMContentLoaded", fetchProducts);
