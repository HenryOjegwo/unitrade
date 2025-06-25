document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/vendor-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login successful!");

      // ✅ Store token and correct vendor ID
      localStorage.setItem("token", data.token);
      localStorage.setItem("vendorId", data.vendor.id);

      window.location.href = "vendor_dashbord.html";
    } else {
      alert("Login failed: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred during login.");
  }
});
