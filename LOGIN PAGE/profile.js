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
console.log("user", user);

//Tapping into the user data with cookies
const firstNameSpan = document.getElementById("firstName");
firstNameSpan.innerHTML = user.fname;

const lastNameSpan = document.getElementById("lastName");
lastNameSpan.innerHTML = user.lname;

const emailSpan = document.getElementById("email");
emailSpan.innerHTML = user.email;

const telSpan = document.getElementById("tel");
telSpan.innerHTML = user.tel;

//Delete cookies when user logout, so the user is automatically has no data on the system
const logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("click", () => {
  deleteCookie("user");
  window.location = "/";
});

//This is an button that when clicked deletes the user account
//It calles the delete-user endpoint
const closeAcc = document.getElementById("close");
closeAcc.addEventListener("click", () => {
  const confirmDelete = confirm(
    "Are you sure you want to delete your account? This action cannot be undone."
  );
  if (confirmDelete) {
    fetch("/delete-user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email }), //This sends the curren cookie email to the backend
    })
      .then((response) => {
        if (response.ok) {
          alert("Account deleted successfully.");
          deleteCookie("user");
          window.location = "/"; // Redirect to login page
        } else {
          alert("Failed to delete account. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error deleting account:", error);
        alert("An error occurred. Please try again later.");
      });
  }
});

//EDIT PROFILE
//Brings out the modal when user pressees Edit Profile Button
const editBtn = document.getElementById("editprofile");
editBtn.addEventListener("click", () => {
  const modal = document.getElementById("editProfileModal");
  modal.style.display = "block";

  // Prefill the form fields with user data
  document.getElementById("newFirstName").value = user.fname;
  document.getElementById("newLastName").value = user.lname;
  document.getElementById("newTelNo").value = user.tel;
});

// Close the modal when the user clicks outside of it
const modal = document.getElementById("editProfileModal");
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
    document.getElementById("newFirstName").value = user.fname;
    document.getElementById("newLastName").value = user.lname;
    document.getElementById("newTelNo").value = user.tel;
  }
});

// Close the modal when the user clicks the "Close" button
const closeModalBtn = document.getElementById("closeModalBtn");
closeModalBtn.addEventListener("click", () => {
  const modal = document.getElementById("editProfileModal");
  modal.style.display = "none";
  document.getElementById("editProfileForm").reset();
});

// Function to handle form submission to Update the profile
const updateProfile = async (event) => {
  event.preventDefault(); // Prevent the default form submission

  const newFirstName = document.getElementById("newFirstName").value;
  const newLastName = document.getElementById("newLastName").value;
  const newTel = document.getElementById("newTelNo").value;

  // Validate input
  if (!newFirstName || !newLastName || !newTel) {
    alert("All fields are required.");
    return;
  }

  // Validate the phone number length before updating
  if (newTel.length !== 11) {
    alert("Phone number must be exactly 11 digits.");
    return; // Stop the form submission if validation fails
  }

  // Update the user object
  user.fname = newFirstName;
  user.lname = newLastName;
  user.tel = newTel;

  const response = await fetch("/update-user", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fname: newFirstName,
      lname: newLastName,
      tel: newTel,
      email: user.email, // Use the email from the cookie
    }),
  });

  // Update the cookie only after database confirmation
  if (response.ok) {
    const updatedUser = await response.json(); // Assume the backend returns the updated user data
    document.cookie = `user=${encodeURIComponent(
      JSON.stringify(updatedUser)
    )}; path=/;`;
    alert("Profile updated successfully.");
    location.reload(); // Automatically reload the page
  } else {
    alert("Failed to update profile. Please try again.");
  }
};

// Restrict input to numbers only
const phoneNumberInput = document.getElementById("newTelNo");
phoneNumberInput.addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/[^0-9]/g, "");
});

//PASSWORD CHANGE
//Function to change Password
const changePassword = async (event) => {
  console.log(user);
  event.preventDefault(); // Prevent the default form submission

  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("cNewPassword").value;

  // Validate input
  if (!newPassword || !confirmPassword) {
    alert("All fields are required.");
    return;
  }

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }
  console.log(user.password);

  // Update the password in the backend
  const response = await fetch("/update-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email, // Use the email from the cookie
      oldPassword: user.password, // Assuming you have the old password stored in the cookie
      newPassword: newPassword,
    }),
  });

  if (response.ok) {
    alert("Password updated successfully. You will be logged out.");
    deleteCookie("user"); // Delete the user cookie
    window.location = "/login.html"; // Redirect to the login page
  } else {
    alert(
      "Failed to update password. Please try again. Probably the same as the old password"
    );
  }
};

//Opens the modal for changing password
const updatePasswordBtn = document.getElementById("updatePasswordBtn");
updatePasswordBtn.addEventListener("click", () => {
  const modal = document.getElementById("changePassword");
  modal.style.display = "block";
});

//Closes the modal for changing password when the user clicks the close button
const closePasswordModalBtn = document.getElementById("closePasswordModalBtn");
closePasswordModalBtn.addEventListener("click", () => {
  const modal = document.getElementById("changePassword");
  modal.style.display = "none";
  document.getElementById("newPassword").value = ""; // Clear the password field
  document.getElementById("cNewPassword").value = ""; // Clear the confirm password field
});

const submitPasswordBtn = document.getElementById("submitPasswordBtn");
submitPasswordBtn.addEventListener("click", changePassword);

//DELIVERY UPLOADS
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

//This gets all the data of the delivery that user uploaded
const getDeliveryData = async () => {
  try {
    const response = await fetch("/my-deliveries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email }), // Send the user's email to fetch their deliveries
    });

    if (!response.ok) {
      throw new Error("Failed to fetch delivery data");
    }

    const deliveries = await response.json();
    const deliveryContainer = document.getElementById("deliveryUploadsList");

    // Clear existing content
    deliveryContainer.innerHTML = "";

    // Populate the modal with delivery data
    deliveries.forEach((delivery) => {
      const deliveryCard = document.createElement("div");
      deliveryCard.classList.add("delivery-card");

      const countdown = calculateCountdown(
        delivery.deliverycreate,
        delivery.timeavailable
      );

      deliveryCard.innerHTML = `
        <h3>${delivery.deliveryname}</h3>
        <p>Pickup Location: ${delivery.leavingfrom}</p>
        <p>Delivery Location: ${delivery.gettingto}</p>
        <p>Date Created: ${delivery.deliverycreate}</p>
        <p>Time Left: <span class="countdown" data-createdat="${delivery.deliverycreate}" data-availablefor="${delivery.timeavailable}">${countdown}</span></p>
        <p>Available For: ${delivery.timeavailable}</p>
        <button class="delete-delivery" onclick=deleteDelivery(${delivery.id}) data-id="${delivery.id}">Delete</button>
      `;

      console.log(delivery.id);
      deliveryContainer.appendChild(deliveryCard);
    });

    // Start updating countdowns every second
    setInterval(updateCountdowns, 1000);
  } catch (error) {
    console.error("Error fetching delivery data:", error);
  }
};

// Function to delete a delivery that user uploaded
const deleteDelivery = async (deliveryId) => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this delivery? This action cannot be undone."
  );
  if (!confirmDelete) {
    return; // User canceled the deletion
  }
  try {
    const response = await fetch("/delete-delivery", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: deliveryId }), // Send the delivery ID to delete
    });

    if (!response.ok) {
      throw new Error("Failed to delete delivery");
    }

    alert("Delivery deleted successfully.");
    getDeliveryData(); // Refresh the delivery data after deletion
  } catch (error) {
    console.error("Error deleting delivery:", error);
  }
};

// Close the modal when the user clicks close button
const closeMyDeliveriesBtn = document.getElementById("closeDeliveryModalBtn");
closeMyDeliveriesBtn.addEventListener("click", () => {
  const modal = document.getElementById("deliveryUploadsModal");
  modal.style.display = "none";
});

// Open the delivery upload page when the user clicks the "Upload Delivery" button
const uploadDeliveryBtn = document.getElementById("addDeliveryBtn");
uploadDeliveryBtn.addEventListener("click", () => {
  window.location = "/delivery.html"; // Redirect to the delivery upload page
});

//Modal for viewing my deliveries
const viewMyDeliveries = document.getElementById("deliveryuploads");
viewMyDeliveries.addEventListener("click", () => {
  const modal = document.getElementById("deliveryUploadsModal");
  modal.style.display = "block";
  getDeliveryData(); // Fetch and display delivery data when the modal opens
});

const deliveryForm = document.getElementById("deliveryForm");
deliveryForm.addEventListener("click", (event) => {
  const modal = document.getElementById("deliveryFormModal");
  modal.style.display = "block";
});

const closeDeliveryFormBtn = document.getElementById("closeFormBtn");
closeDeliveryFormBtn.addEventListener("click", () => {
  const modal = document.getElementById("deliveryFormModal");
  modal.style.display = "none";
  document.getElementById("uploadForm").reset(); // Reset the form fields
});

// Restrict input to numbers only
const clientNumberInput = document.getElementById("clientTelNo");
clientNumberInput.addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/[^0-9]/g, "");
});

// Restrict input to a maximum of 11 digits
clientNumberInput.addEventListener("input", (event) => {
  if (event.target.value.length > 11) {
    event.target.value = event.target.value.slice(0, 11);
  }
});

const logDelivery = async (event) => {
  event.preventDefault();
  console.log("I was clicked");

  const clientName = document.getElementById("clientName").value;
  const clientTel = document.getElementById("clientTelNo").value;
  const deliveryType = document.getElementById("deliveryType").value;
  const pickupLocation = document.getElementById("pickupLocation").value;
  const dropoffLocation = document.getElementById("deliveryLocation").value;
  const packageDescription =
    document.getElementById("packageDescription").value;

  // Validate input
  if (
    !clientName ||
    !clientTel ||
    !deliveryType ||
    !pickupLocation ||
    !dropoffLocation ||
    !packageDescription
  ) {
    alert("All fields are required.");
    return;
  }

  try {
    const response = await fetch("/log-delivery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id, // Use the user ID from the cookie
        userMail: user.email, // Use the email from the cookie
        userTel: user.tel, // Use the phone number from the cookie
        userName: user.fname + " " + user.lname, // Combine first and last name
        clientName,
        clientTel,
        deliveryType,
        pickupLocation,
        dropoffLocation,
        packageDescription,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to upload delivery");
    }

    alert("Delivery uploaded successfully.");
    const modal = document.getElementById("deliveryFormModal");
    modal.style.display = "none";
    document.getElementById("uploadForm").reset(); // Reset the form fields
  } catch (error) {
    console.error("Error uploading delivery:", error);
    alert("Failed to upload delivery. Please try again.");
  }
};

const logDeliveryBtn = document.getElementById("logButton");
logDeliveryBtn.addEventListener("click", logDelivery);

//QUIKSELL
const calculateQuiksellCountdown = (createdAt) => {
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

const getQuiksellData = async () => {
  try {
    const response = await fetch("/my-quiksell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email }), // Send the user's email to fetch their quiksell data
    });

    if (!response.ok) {
      throw new Error("Failed to fetch quiksell data");
    }

    const products = await response.json();
    const productContainer = document.getElementById("quiksellUploadsList");
    console.log(products);

    // Clear existing content
    productContainer.innerHTML = "";

    // Populate the modal with quiksell data
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("quiksell-card");

      const formattedPrice = Number(product.price).toLocaleString();
      const countdown = calculateQuiksellCountdown(product.createdat);

      productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="quiksell-image width="50%" height="110px"/>
        <h3>${product.name}</h3>
        <p>Price: ${formattedPrice}</p>
        <p>Date Created: ${product.createdat}</p>
        <p>Time Left: <span class="countdown" data-createdat="${product.createdat}">${countdown}</span></p>
        <button class="delete-quiksell" onclick=deleteQuiksell(${product.id})>Delete</button>
      `;

      const countdownElement = productCard.querySelector(".countdown");
      countdownElement.setAttribute("data-createdat", product.createdat);

      productContainer.appendChild(productCard);
    });
  } catch (error) {
    console.error("Error fetching quiksell data:", error);
  }
};

setInterval(() => {
  const countdownElements = document.querySelectorAll(".countdown");
  countdownElements.forEach((element) => {
    const createdAt = element.getAttribute("data-createdat");
    if (createdAt) {
      const countdown = calculateQuiksellCountdown(createdAt);
      element.textContent = countdown;
    }
  });
}, 1000);

//Delete quiksell product that user uploaded
const deleteQuiksell = async (productId) => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this product? This action cannot be undone."
  );
  if (!confirmDelete) {
    return; // User canceled the deletion
  }
  try {
    const response = await fetch("/delete-quiksell", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: productId }), // Send the product ID to delete
    });

    if (!response.ok) {
      throw new Error("Failed to delete quiksell product");
    }

    alert("Product deleted successfully.");
    getQuiksellData(); // Refresh the quiksell data after deletion
  } catch (error) {
    console.error("Error deleting quiksell product:", error);
  }
};

//Open the quiksell upload modal when the user clicks the "Upload Quiksell" button
const myQuiksellBtn = document.getElementById("quikselluploads");
myQuiksellBtn.addEventListener("click", () => {
  const modal = document.getElementById("quiksellUploadsModal");
  modal.style.display = "block";
  getQuiksellData(); // Fetch and display quiksell data when the modal opens
});

//Close the modal when user clicks close button
const closeQuiksellModalBtn = document.getElementById("closeQuiksellModalBtn");
closeQuiksellModalBtn.addEventListener("click", () => {
  const modal = document.getElementById("quiksellUploadsModal");
  modal.style.display = "none";
});

const updateForm = document.getElementById("editProfileForm");
updateForm.addEventListener("submit", updateProfile);

const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", this.window.scrollY > 0);
});
