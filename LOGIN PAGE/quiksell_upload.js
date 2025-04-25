// Global variables
let currentEditingRow = null;
const productForm = document.getElementById("product-form");
const productTable = document
  .getElementById("product-table")
  ?.getElementsByTagName("tbody")[0];
const productMessage = document.getElementById("product-message");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const userString = getCookie("user");
if (!userString) {
  window.location = "/";
}

// // Handle image preview
// document.getElementById("image").addEventListener("change", function (e) {
//   const preview = document.getElementById("image-preview");
//   preview.innerHTML = "";

//   if (e.target.files[0]) {
//     const img = document.createElement("img");
//     img.src = URL.createObjectURL(e.target.files[0]);
//     img.style.maxHeight = "150px";
//     preview.appendChild(img);
//   }
// });

// Form submission handler
productForm.addEventListener("submit", function (e) {
  e.preventDefault();
  alert("Form submitted");

  const productName = document.getElementById("product-name").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;
  const imageFile = document.getElementById("image").files[0];

  const formattedPrice = `₦${parseInt(price).toLocaleString("en-NG")}`;

  if (currentEditingRow) {
    // Update existing row
    updateProductRow(
      currentEditingRow,
      productName,
      description,
      formattedPrice,
      imageFile
    );
    const response = fetch("/quiksell_upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pName: productName,
        description: description,
        price: price,
        image: imageFile,
        userName: user.fname + " " + user.lname,
        email: user.email,
        phoneNumber: user.tel,
      }),
    });
    if (response.ok) {
      console.log("Product updated successfully");
    }
    // Show success message
    showSuccessMessage("Product updated successfully!");
    cancelEdit();
  } else {
    // Add new row
    addProductRow(productName, description, formattedPrice, imageFile);
    showSuccessMessage("Product added successfully!");
  }

  productForm.reset();
  document.getElementById("image-preview").innerHTML = "";
});

// Cancel edit mode
cancelEditBtn.addEventListener("click", cancelEdit);

function cancelEdit() {
  currentEditingRow = null;
  productForm.reset();
  document.getElementById("image-preview").innerHTML = "";
  submitBtn.textContent = "Add Listing";
  cancelEditBtn.style.display = "none";
}

// Add new product row
function addProductRow(name, description, price, imageFile) {
  const row = productTable.insertRow();

  // Image cell
  const imgCell = row.insertCell(0);
  if (imageFile) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(imageFile);
    img.style.maxHeight = "50px";
    imgCell.appendChild(img);
  } else {
    imgCell.textContent = "No Image";
  }

  // Other cells
  row.insertCell(1).textContent = name;
  row.insertCell(2).textContent = description;
  row.insertCell(3).textContent = price;
  row.insertCell(4).textContent = "Available";

  // Actions cell
  const actionsCell = row.insertCell(5);
  actionsCell.className = "actions";
  actionsCell.innerHTML = `
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    `;

  // Attach event listeners
  attachRowEvents(row);
}

// Update existing product row
function updateProductRow(row, name, description, price, imageFile) {
  // Update image if new one was selected
  if (imageFile) {
    const imgCell = row.cells[0];
    imgCell.innerHTML = "";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(imageFile);
    img.style.maxHeight = "50px";
    imgCell.appendChild(img);
  }

  // Update other cells
  row.cells[1].textContent = name;
  row.cells[2].textContent = description;
  row.cells[3].textContent = price;
}

// Attach event listeners to row buttons
function attachRowEvents(row) {
  row.querySelector(".delete-btn").addEventListener("click", function () {
    if (confirm("Are you sure you want to delete this product?")) {
      row.remove();
      showSuccessMessage("Product deleted successfully!");
    }
  });

  row.querySelector(".edit-btn").addEventListener("click", function () {
    editProduct(row);
  });
}

// Edit product function
function editProduct(row) {
  currentEditingRow = row;

  // Populate form with row data
  document.getElementById("product-name").value = row.cells[1].textContent;
  document.getElementById("description").value = row.cells[2].textContent;
  document.getElementById("price").value = row.cells[3].textContent
    .replace("₦", "")
    .replace(/,/g, "");

  // Handle image preview
  const preview = document.getElementById("image-preview");
  preview.innerHTML = "";
  const img = row.cells[0].querySelector("img");
  if (img) {
    const previewImg = document.createElement("img");
    previewImg.src = img.src;
    previewImg.style.maxHeight = "150px";
    preview.appendChild(previewImg);
  }

  // Update UI for edit mode
  submitBtn.textContent = "Update Listing";
  cancelEditBtn.style.display = "inline-block";
  productForm.scrollIntoView();
}

// Show success message
function showSuccessMessage(message) {
  productMessage.textContent = message;
  productMessage.style.color = "green";

  setTimeout(() => {
    productMessage.textContent = "";
  }, 3000);
}

// Initialize existing rows when page loads
document.addEventListener("DOMContentLoaded", function () {
  const rows = document.querySelectorAll("#product-table tbody tr");
  rows.forEach((row) => attachRowEvents(row));
});
