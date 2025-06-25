document.addEventListener("DOMContentLoaded", async () => {
  console.log("📢 profile.js is loaded!");

  const token = localStorage.getItem("token");
  const vendorId = localStorage.getItem("vendorId");

  console.log("📢 DOM fully loaded, running profile fetch...");

  if (!token || !vendorId) {
    alert("Session expired. Please log in again.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("/vendorprofile", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({
        id: vendorId,
      }),
    });
    console.log("Did the data get back");

    const vendor = await res.json();
    console.log("🧪 Vendor object:", vendor);

    console.log("✅ Vendor fetched:", vendor);

    if (res.ok) {
      document.getElementById("vendor-name").innerText = vendor.name || "N/A";
      document.getElementById("vendor-email").innerText = vendor.email || "N/A";
      document.getElementById("vendor-phone").innerText = vendor.phone || "N/A";
      document.getElementById("store-name").value = vendor.store_name || "";
      document.getElementById("store-description").value =
        vendor.store_description || "";

      // Set profile picture if available
      // if (vendor.profile_picture) {
      //   document.getElementById(
      //     "vendor-avatar"
      //   ).src = `http://localhost:5000/uploads/${vendor.profile_picture}`;
      // }
    } else {
      alert("Failed to load profile: " + vendor.error);
    }
  } catch (err) {
    console.error("❌ Error loading profile:", err);
    alert("An error occurred while loading profile.");
  }
});

// Change Password Button
document
  .getElementById("change-password-btn")
  .addEventListener("click", function () {
    window.location.href = "change-password.html";
  });

// Edit Profile Button
const editButton = document.getElementById("edit-profile-btn");
let isEditing = false;

editButton.addEventListener("click", async () => {
  const storeNameInput = document.getElementById("store-name");
  const storeDescriptionInput = document.getElementById("store-description");

  if (!isEditing) {
    storeNameInput.removeAttribute("readonly");
    storeDescriptionInput.removeAttribute("readonly");
    editButton.innerHTML = `<i class="fas fa-save"></i> Save Profile`;
    isEditing = true;
  } else {
    const token = localStorage.getItem("token");
    const vendorId = localStorage.getItem("vendorId");

    const updatedStoreName = storeNameInput.value.trim();
    const updatedStoreDescription = storeDescriptionInput.value.trim();

    try {
      const res = await fetch(
        `http://localhost:5000/api/vendors/profile/${vendorId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            storeName: updatedStoreName,
            storeDescription: updatedStoreDescription,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Profile updated successfully!");
        storeNameInput.setAttribute("readonly", true);
        storeDescriptionInput.setAttribute("readonly", true);
        editButton.innerHTML = `<i class="fas fa-edit"></i> Edit Profile`;
        isEditing = false;
      } else {
        alert("Failed to update profile: " + data.error);
      }
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      alert("An error occurred while updating profile.");
    }
  }
});

// Camera icon triggers file input
document.getElementById("change-avatar").addEventListener("click", () => {
  document.getElementById("avatar-input").click();
});

// Upload and preview selected image
document
  .getElementById("avatar-input")
  .addEventListener("change", async (e) => {
    const file = e.target.files[0];
    const token = localStorage.getItem("token");
    const vendorId = localStorage.getItem("vendorId");

    if (!file) return;

    // Show preview immediately
    document.getElementById("vendor-avatar").src = URL.createObjectURL(file);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(
        `http://localhost:5000/api/vendors/profile-picture/${vendorId}`,
        {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        }
      );

      const data = await res.json();
      console.log("🧪 Upload response:", data); // 👈 Add this if not already

      if (res.ok) {
        alert("✅ Profile picture updated!");
        // Force reload to fetch latest image (bypass cache)
        document.getElementById(
          "vendor-avatar"
        ).src = `http://localhost:5000/uploads/${data.file}?t=${Date.now()}`;
      } else {
        alert("❌ Failed to upload: " + data.error);
      }
    } catch (err) {
      console.error("⚠️ Upload error:", err);
      alert("Something went wrong while uploading.");
    }
  });
