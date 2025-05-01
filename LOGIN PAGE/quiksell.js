//This knows user by the cookie address. Using a cookie,
// the tapping into the cookie properties to acccess different data of the users

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

//Since a cookie temporarilyy holds user data, so once the cookie is deleted
//The temporary user data is deleted, for logging out
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

//This makes sure that if user doesnt have any cookies, profile page can't be accessed
//It takes ut back to the login page.
const userString = getCookie("user");
if (!userString) {
  window.location = "/";
}
const user = JSON.parse(decodeURIComponent(userString));
console.log(user);

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

const fetchProducts = async () => {
  try {
    //This calls the endpoints that filter the databse to only display products  reated less than 24 hours ago
    const response = await fetch("/get-products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await response.json();
    const productContainer = document.getElementById("product-list");

    // Clear existing content
    productContainer.innerHTML = "";

    // Loop through products and display only valid ones
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");

      const countdown = calculateCountdown(product.createdat);

      // Ensure the price is a number before formatting
      const formattedPrice = Number(product.price).toLocaleString();

      // Ensure the `data-createdat` attribute is set on the countdown element
      //Used remix icon for the heart icon
      productCard.innerHTML = `
        <div class="product-card">
            <div onclick="toggleHeart(${product.id})" class="love-icon">
             ${
               product.isInWishlist
                 ? '<i class="ri-heart-fill"></i>'
                 : '<i class="ri-heart-line"></i>'
             } 
            </div>
        <img src="${product.image}" alt="${
        product.name
      }" class="product-image"/>
        <div product-info>
          <h3>
            <a class="product-name" href="product_description.html?id=${
              product.id
            }">${product.name}</a>
          </h3>
            <p class="price">₦${formattedPrice}</p>
            <p class="expires">Time Left: <span class="countdown" data-createdat="${
              product.createdat
            }">${countdown}</span></p>
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

const toggleHeart = (pId) => {
  console.log("Heart icon clicked");
  const response = fetch("/toggle-wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: user.id,
      productId: pId,
    }),
  });
  window.location.reload();
};

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
