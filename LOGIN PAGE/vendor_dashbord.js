document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const vendorId = localStorage.getItem("vendorId"); // ✅ dynamic vendor ID

  if (!token || !vendorId) {
    alert("You must be logged in!");
    window.location.href = "login.html";
    return;
  }

  //  Fetch Vendor Profile (for welcome message)
  try {
    const response = await fetch("/vendor-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendor: vendorId,
      }),
    });

    const vendor = await response.json();
    console.log("Am I loaded");

    if (response.ok) {
      //  Show vendor name on dashboard
      document.getElementById("dashboard-vendor-name").innerText =
        vendor.full_name || vendor.name || "Vendor";
    }
  } catch (err) {
    console.error("Failed to load vendor profile info:", err);
  }

  //  Fetch vendor's products
  try {
    const res = await fetch("/get-vendor-products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ vendor_id: vendorId }),
    });

    const products = await res.json();

    if (res.ok) {
      allProducts = products;
      updateStats(products);
      displayProducts(products);
    } else {
      alert("Error fetching products: " + products.error);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Failed to load products.");
  }
});

let allProducts = []; // Store fetched products globally

//  Quick stats
function updateStats(products) {
  document.getElementById("total-products").innerText = products.length;
}

// Display products
function displayProducts(products) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML =
      "<p>No products found. Click 'Add New Product' to get started!</p>";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
            ${
              product.image
                ? `<img src="/uploads/${product.image}" alt="Product Image" class="product-image">`
                : ""
            }
            <h4>${product.name}</h4>
            <p><strong>₦${product.price}</strong></p>
            <p>${product.description}</p>
            <p>Category: ${product.category || "N/A"}</p>
            <p>Condition: ${product.condition || "N/A"}</p>
            <p>Quantity: ${product.quantity || 1}</p>
            <button id="deleteproduct" class="delete-btn" data-id="${
              product.id
            }">Delete</button>
        `;
    container.appendChild(card);
  });
}

//  Delete functionality
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const productId = e.target.getAttribute("data-id");

    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch("/delete-product", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: productId }),
        });

        const data = await res.json();

        if (res.ok) {
          alert(data.message);
          allProducts = allProducts.filter((p) => p.id != productId);
          displayProducts(allProducts);
          updateStats(allProducts);
        } else {
          alert("Failed to delete product: " + data.error);
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred while deleting.");
      }
    }
  }
});

//  Filters
document
  .getElementById("search-products")
  .addEventListener("input", applyFilters);
document
  .getElementById("sort-products")
  .addEventListener("change", applyFilters);

function applyFilters() {
  let filtered = [...allProducts];

  const searchQuery = document
    .getElementById("search-products")
    .value.toLowerCase();
  filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery));

  const sortValue = document.getElementById("sort-products").value;
  if (sortValue === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortValue === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === "newest") {
    filtered.sort((a, b) => b.id - a.id);
  } else if (sortValue === "oldest") {
    filtered.sort((a, b) => a.id - b.id);
  }

  displayProducts(filtered);
}
