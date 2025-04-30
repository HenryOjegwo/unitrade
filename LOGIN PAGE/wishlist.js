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

const userString = getCookie("user");
if (!userString) {
  window.location = "/";
}
const user = JSON.parse(decodeURIComponent(userString));
console.log("user", user);

//This is the fucntion that gets all the data that the user has added to the wishlist
const getWishList = async () => {
  console.log("I was called");
  const response = await fetch("/get_wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: user.id }),
  });

  const data = await response.json();
  if (response.ok) {
    // return data;
  } else {
    console.error("Error fetching wishlist:", data);
  }

  const wishListContainer = document.getElementById("wishlist");
  wishListContainer.innerHTML = ""; // Clear existing content

  data.forEach((wish) => {
    console.log("Have I started looping?");
    const countdown = calculateCountdown(wish.createdat);
    const wishListCard = document.createElement("div");
    wishListCard.classList.add("wish-list-card");
    const formattedPrice = Number(wish.price).toLocaleString();
    wishListCard.innerHTML = `
        <div class="product-card">
                <div onclick="toggleHeart(${wish.id})" class="love-icon">
                ${
                  wish.isInWishlist
                    ? '<i class="ri-heart-fill"></i>'
                    : '<i class="ri-heart-line"></i>'
                } 
                </div>
            <img src="${wish.image}" alt="${wish.name}" class="product-image"/>
            <div product-info>
                <h3 class="product-name">${wish.name}</h3>
                <p class="price">₦${formattedPrice}</p>
                <p class="countdown">Time Left: <span class="countdown" data-createdat="${
                  wish.createdat
                }">${countdown}</span></p>
            </div>
        </div>
    `;
    console.log("I got to the end");
    console.log(wish.createdat);
    const countdownElement = wishListCard.querySelector(".countdown");
    countdownElement.setAttribute("data-createdat", wish.createdat);
    wishListContainer.appendChild(wishListCard);
  });
};

setInterval(() => {
  const countdownElements = document.querySelectorAll(".countdown");
  countdownElements.forEach((element) => {
    const createdAt = element.getAttribute("data-createdat");
    const countdown = calculateCountdown(createdAt);
    element.innerHTML = countdown;
  });
}, 1000);

//This function is called when the heart icon is clicked
//It sends a post request to the server to toggle the wishlist status of the product
//It also reloads the page to reflect the changes
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

const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", this.window.scrollY > 0);
});

document.addEventListener("DOMContentLoaded", getWishList);
