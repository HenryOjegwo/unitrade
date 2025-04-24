//This knows user by the cookie address. Using a cookie, the tapping into the cookie properties to acccess different data of the users

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
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

// Add functionality to delete the current user from the database
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
      body: JSON.stringify({ email: user.email }),
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

const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", this.window.scrollY > 0);
});
