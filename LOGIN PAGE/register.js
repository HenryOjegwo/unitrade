// const passwordregex =
//   "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$";

// Looking and getting to hold the input fields from the form on register/html
const firstName = document.getElementById("fname");
const lastName = document.getElementById("lname");
const email = document.getElementById("email");
const tel = document.getElementById("tel");
const password = document.getElementById("password");
const cPassword = document.getElementById("cpassword");
const emailError = document.getElementById("email-error");

console.log("emailError", emailError);

//Does not shoot out an error till the user is done typing the domain name
email.addEventListener("focusout", (ev) => {
  if (ev.target.value.split("@")[1].toLowerCase() != "nileuniversity.edu.ng") {
    emailError.innerHTML = "Invalid domain";
  }
});

email.addEventListener("focus", (ev) => {
  emailError.innerHTML = "";
});

//Submiting the from through ajax and getting the values of the form
const handleSubmit = async (ev) => {
  ev.preventDefault(); //Prevent the form from submitting before being submitted by the user
  const payload = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    tel: tel.value,
    password: password.value,
  }; // All the data sent to the backend

  //Check if the domain maches
  if (email.value.split("@")[1] != "nileuniversity.edu.ng") {
    alert("Invalid Domain");
    return;
  }

  //Make sure the phone number is 11 digits
  if (tel.value.length !== 11) {
    alert("Wrong Phone Number");
    return;
  }

  //Checks if confirmation password is correct
  if (password.value !== cPassword.value) {
    alert("password and confirm password does not match");
    return;
  }

  //This submits the data to the /register endpoint on the server using json
  const response = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (response.ok) {
    alert("Registration Successful");
    window.location = "/login.html";
    return;
  }
  alert(data.message);
};

// Restrict input to numbers only for the phone number field
tel.addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/[^0-9]/g, "");
});

//When the user presses submit the handleSubmit function is triggered
const form = document.getElementById("form");
form.addEventListener("submit", handleSubmit);
