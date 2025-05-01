const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", this.window.scrollY > 0);
});
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const userString = getCookie("user");
if (!userString) {
  window.location = "/";
}
const user = JSON.parse(decodeURIComponent(userString));
console.log(user);

// Display admin email if needed
const adminEmail = user.email;
console.log("Admin Email:", adminEmail); // Log the admin email for debugging

// Function to delete a cookie by name
const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Update logout functionality
const logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("click", () => {
  console.log("Logging out admin with email:", adminEmail); // Log the logout action
  deleteCookie("user"); // Delete the user cookie
  window.location = "/login.html"; // Redirect to the login page
});
