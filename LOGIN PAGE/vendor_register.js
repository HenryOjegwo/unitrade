document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("fullname").value;
    const email = document.getElementById("email").value.trim();
    const allowedDomain = "@nileuniversity.edu.ng";
    const phone = document.getElementById("phone").value;
    const store_name = document.getElementById("store-name").value;
    const store_description =
      document.getElementById("store-description").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Password confirmation check
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // confirm email
    if (!email.endsWith(allowedDomain)) {
      e.preventDefault();
      alert(
        "Please use your Nile University email address (e.g. yourname@nileuniversity.edu.ng)."
      );
    }
    // Check if user selected "Vendor"
    const userType = document.querySelector(
      'input[name="user-type"]:checked'
    ).value;
    if (userType !== "vendor") {
      alert("This registration is only for Vendors.");
      return;
    }

    if (!email.endsWith("@nileuniversity.edu.ng")) {
      alert("You must have Nile University email");
      return;
    }

    // Prepare vendor data
    const vendorData = {
      name,
      email,
      phone,
      store_name,
      store_description,
      password,
    };

    console.log("I was clicked");

    try {
      const res = await fetch("/vendor-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorData),
      });
      console.log("Did I get here");

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        alert("🎉 Registration successful! You can now login.");
        window.location.href = "vendor_login.html";
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    }
  });
