const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", this.window.scrollY > 0);
});

const productId = window.location.search.split("=")[1];

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

const getDescription = async (pId) => {
  console.log("Product ID:", pId);
  const response = await fetch("/get-description", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: pId,
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    console.error("Error fetching product description:", data);
    return;
  }
  const productDescriptionContainer = document.getElementById("description");
  productDescriptionContainer.innerHTML = ""; // Clear existing content

  const descriptionCard = document.createElement("div");
  descriptionCard.classList.add("description-card");
  console.log(data.description);

  const formattedPrice = Number(data.price).toLocaleString();
  descriptionCard.innerHTML = `

             <div class="home-image">
                <img src="${data.image}" alt="${
    data.name
  }" class="product-image"/>
            </div>

            <<div class="home-text">
                <h4>${data.name}</h4><br>
                <h4>₦${formattedPrice}</h4><br>
                <h4>Time Left: <span class="countdown" data-createdat="${
                  data.createdat
                }">${calculateCountdown(data.createdat)}</span></h4><br>
                <h4>PRODUCT DESCRIPTION: ${data.description}</h4><br>
                <h4>VENDOR NAME: ${data.user_name}</h4><br>
                <h4>VENDOR NUMBER:${data.phonenumber}</h4><br>
            </div>

        `;
  productDescriptionContainer.appendChild(descriptionCard);
  console.log("Did I get here?");
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

document.addEventListener("DOMContentLoaded", () => {
  getDescription(productId);
});
