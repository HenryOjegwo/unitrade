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
                <h3 class="product-name"><a class="product-name" href="product_description.html?id=${
                  wish.id
                }">${wish.name}</a></h3>
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

// const getDescription = async (pId) => {
//   console.log("Product ID:", pId);
//   const response = await fetch("/get-description", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       productId: pId,
//     }),
//   });
//   const data = await response.json();

//   if (!response.ok) {
//     console.error("Error fetching product description:", data);
//     return;
//   }
//   const productDescriptionContainer = document.getElementById("description");
//   productDescriptionContainer.innerHTML = ""; // Clear existing content

//   const descriptionCard = document.createElement("div");
//   descriptionCard.classList.add("description-card");
//   console.log(data.description);

//   const formattedPrice = Number(data.price).toLocaleString();
//   descriptionCard.innerHTML = `

//              <div class="home-image">
//                 <img src="${data.image}" alt="${
//     data.name
//   }" class="product-image"/>
//             </div>

//             <div class="home-text">
//                 <h4>${data.name}</h4><br>
//                 <h4>₦${formattedPrice}</h4><br>
//                 <h4>Time Left: <span class="countdown" data-createdat="${
//                   data.createdat
//                 }">${calculateCountdown(data.createdat)}</span></h4><br>
//                 <h4>PRODUCT DESCRIPTION: ${data.description}</h4><br>
//                 <h4>VENDOR NAME: ${data.user_name}</h4><br>
//                 <h4>VENDOR NUMBER:${data.phonenumber}</h4><br>
//             </div>

//         `;
//   productDescriptionContainer.appendChild(descriptionCard);
//   console.log("Did I get here?");
// };

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

document.addEventListener("DOMContentLoaded", getWishList);
