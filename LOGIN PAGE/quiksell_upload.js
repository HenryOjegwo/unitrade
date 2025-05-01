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

const productName = document.getElementById("product-name");
const description = document.getElementById("description");
const price = document.getElementById("price");
const image = document.getElementById("image");

const addProduct = async (ev) => {
  ev.preventDefault();

  const payload = {
    pName: productName.value,
    description: description.value,
    price: price.value,
    image: image.files[0],
    userName: user.fname + " " + user.lname,
    email: user.email,
    phoneNumber: user.tel,
  };

  const formData = new FormData();
  formData.append("pName", payload.pName);
  formData.append("description", payload.description);
  formData.append("price", payload.price);
  formData.append("image", payload.image);
  formData.append("userName", payload.userName);
  formData.append("email", payload.email);
  formData.append("phoneNumber", payload.phoneNumber);

  const response = await fetch("/quiksell_upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (response.ok) {
    const uploadAnother = confirm(
      "Product uploaded successfully. Do you want to upload another product?"
    );
    if (uploadAnother) {
      document.getElementById("product-form").reset();
    } else {
      window.location = "/profile.html";
    }
    return;
  }
  alert(data.message);
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

// Ensure only one event listener is attached to the form
const productForm = document.getElementById("product-form");
productForm.removeEventListener("submit", addProduct); // Remove any existing listener
productForm.addEventListener("submit", addProduct);
