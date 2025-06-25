document
  .getElementById("add-product-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const vendorId = localStorage.getItem("vendorId");

    if (!token || !vendorId) {
      alert("You must be logged in!");
      window.location.href = "login.html";
      return;
    }

    const formData = new FormData();
    formData.append("vendor_id", vendorId);
    formData.append("name", document.getElementById("product-name").value);
    formData.append(
      "description",
      document.getElementById("description").value
    );
    formData.append(
      "price",
      parseFloat(document.getElementById("price").value)
    );
    formData.append(
      "quantity",
      parseInt(document.getElementById("quantity").value)
    );
    const category = document.querySelector(
      'input[name="category"]:checked'
    )?.value;
    const condition = document.querySelector(
      'input[name="condition"]:checked'
    )?.value;

    if (!category || !condition) {
      alert("Please select both category and condition.");
      return;
    }

    formData.append("category", category);
    formData.append("condition", condition);

    // Append image file
    const imageFile = document.getElementById("images").files[0];
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      console.log("Form data being submitted:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      console.log(formData);

      const res = await fetch("/upload-products", {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("🎉 Product added successfully!");
        window.location.href = "vendor_dashbord.html";
      } else {
        alert("Failed to add product: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    }
  });

//  Click preview box to open file picker
document.getElementById("image-preview").addEventListener("click", () => {
  document.getElementById("images").click();
});

//  Show image previews + allow removal
document.getElementById("images").addEventListener("change", (e) => {
  const previewGrid = document.getElementById("preview-grid");
  previewGrid.innerHTML = ""; // Clear old previews

  const files = e.target.files;
  for (let i = 0; i < files.length && i < 5; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = function (event) {
      const imgWrapper = document.createElement("div");
      imgWrapper.style.position = "relative";
      imgWrapper.style.display = "inline-block";
      imgWrapper.style.marginRight = "10px";

      const img = document.createElement("img");
      img.src = event.target.result;
      img.classList.add("preview-image");

      const removeBtn = document.createElement("span");
      removeBtn.innerHTML = "&times;";
      removeBtn.style.position = "absolute";
      removeBtn.style.top = "0";
      removeBtn.style.right = "0";
      removeBtn.style.background = "red";
      removeBtn.style.color = "white";
      removeBtn.style.borderRadius = "50%";
      removeBtn.style.padding = "2px 6px";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.fontSize = "14px";

      removeBtn.addEventListener("click", () => {
        imgWrapper.remove();
        // Optionally clear the file input to allow re-selection
        document.getElementById("images").value = "";
      });

      imgWrapper.appendChild(img);
      imgWrapper.appendChild(removeBtn);
      previewGrid.appendChild(imgWrapper);
    };

    reader.readAsDataURL(file);
  }
});
