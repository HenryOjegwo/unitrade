// Function to calculate and display countdown for each delivery based on database values
const calculateCountdown = (createdAt, availableFor) => {
  const createdTime = new Date(createdAt).getTime();
  const expiryTime = createdTime + parseInt(availableFor) * 60 * 1000; // Calculate expiry time in milliseconds

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

// Function to update countdowns constantly
const updateCountdowns = () => {
  const countdownElements = document.querySelectorAll(".countdown");

  countdownElements.forEach((element) => {
    const createdAt = element.getAttribute("data-createdat");
    const availableFor = element.getAttribute("data-availablefor");

    const countdown = calculateCountdown(createdAt, availableFor);
    element.textContent = countdown;
  });
};

//Applying filters to the delivery cards
const applyFilters = () => {
  const pickupFilter = document.getElementById("location-filter-pickup").value;
  const deliveryFilter = document.getElementById(
    "location-filter-delivery"
  ).value;

  console.log("Pickup Filter:", pickupFilter);
  console.log("Delivery Filter:", deliveryFilter);

  const deliveryCards = document.querySelectorAll(".delivery-card");

  deliveryCards.forEach((card) => {
    const pickupLocation = card.getAttribute("data-pickup-location");
    const deliveryLocation = card.getAttribute("data-delivery-location");

    console.log("Card Pickup Location:", pickupLocation);
    console.log("Card Delivery Location:", deliveryLocation);

    const matchesPickup = !pickupFilter || pickupLocation === pickupFilter;
    const matchesDelivery =
      !deliveryFilter || deliveryLocation === deliveryFilter;

    if (matchesPickup && matchesDelivery) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
};

// Add event listener to filter button
const filterButton = document.getElementById("filter-button");
filterButton.addEventListener("click", applyFilters);

// Modify fetchDeliveryData to include data attributes for filtering
const fetchDeliveryData = async () => {
  try {
    const response = await fetch("/get-deliveries");
    if (!response.ok) {
      throw new Error("Failed to fetch delivery data");
    }

    const deliveries = await response.json();
    const deliveryContainer = document.getElementById(
      "delivery-helpers-container"
    );

    // Clear existing content
    deliveryContainer.innerHTML = "";

    // Loop through deliveries and display them
    deliveries.forEach((delivery) => {
      const deliveryCard = document.createElement("div");
      deliveryCard.classList.add("delivery-card");
      deliveryCard.setAttribute("data-pickup-location", delivery.leavingfrom);
      deliveryCard.setAttribute("data-delivery-location", delivery.gettingto);

      const countdown = calculateCountdown(
        delivery.deliverycreate,
        delivery.timeavailable
      );

      deliveryCard.innerHTML = `
        <h3>Delivery Name: ${delivery.deliveryname}</h3>
        <p>Email: ${delivery.deliverymail}</p>
        <p>Phone Number: ${delivery.deliverytel}</p>
        <p>Pickup Location: ${delivery.leavingfrom}</p>
        <p>Delivery Location: ${delivery.gettingto}</p>
        <p>Time Left: <span class="countdown" data-createdat="${delivery.deliverycreate}" data-availablefor="${delivery.timeavailable}">${countdown}</span></p>
      `;

      deliveryContainer.appendChild(deliveryCard);
    });

    // Start updating countdowns every second
    setInterval(updateCountdowns, 1000);
  } catch (error) {
    console.error("Error fetching delivery data:", error);
  }
};

// Call fetchDeliveryData when the page loads
document.addEventListener("DOMContentLoaded", fetchDeliveryData);
