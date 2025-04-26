//This knows user by the cookie address. Using a cookie,
// the tapping into the cookie properties to acccess different data of the users
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const userString = getCookie("user");
if (!userString) {
  window.location = "/";
}
const user = JSON.parse(decodeURIComponent(userString));

//Getting the user data from cookies, and from the form
const deliveryName = user.fname + " " + user.lname;
const deliveryEmail = user.email;
const deliveryPhoneNumber = user.tel;
const deliverFrom = document.getElementById("pickup-location");
const deliverTo = document.getElementById("delivery-location");
const availableFor = document.getElementById("available-time");

const addDelivery = async (ev) => {
  ev.preventDefault();

  // Check if deliverFrom and deliverTo are the same
  if (deliverFrom.value === deliverTo.value) {
    alert("Pickup location and delivery location cannot be the same.");
    return;
  }

  //Getting the user data from cookies, and from the form and sending it to the backend
  const payload = {
    deliveryName: deliveryName,
    deliveryEmail: deliveryEmail,
    deliveryPhoneNumber: deliveryPhoneNumber,
    deliverFrom: deliverFrom.value,
    deliverTo: deliverTo.value,
    availableFor: availableFor.value,
  };

  //Sending the data to the backend
  const response = await fetch("/delivery_upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (response.ok) {
    const uploadAnother = confirm(
      "Delivery request uploaded successfully. Do you want to upload another request?"
    );
    if (uploadAnother) {
      document.getElementById("delivery-form").reset();
    } else {
      window.location = "/profile.html";
    }
    return;
  }
  alert(data.message);
};

const deliveryForm = document.getElementById("delivery-form");
deliveryForm.addEventListener("submit", addDelivery);
