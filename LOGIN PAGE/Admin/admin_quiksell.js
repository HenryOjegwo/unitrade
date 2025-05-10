const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", this.window.scrollY > 0);
});

// Function to fetch and display products in a table
async function fetchAndDisplayProducts() {
  try {
    // Fetch product data from the backend API (replace 'your-api-endpoint' with the actual endpoint)
    const response = await fetch("/get-products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await response.json();

    // Get the table body element where products will be displayed
    const tableBody = document.getElementById("listings");
    tableBody.innerHTML = ""; // Clear any existing rows

    // Populate the table with product data
    products.forEach((product) => {
      const row = document.createElement("tr");
      console.log(product.image);

      row.innerHTML = `
        <td><img src="../${product.image}" alt="${product.name}" class="product-image" width="60px"></td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td>${product.user_name}</td>
        <td>${product.email}</td>
        <td>${product.phonenumber}</td>
        <td>
          <button id="deletequiksell" class="delete-btn" data-id="${product.id}">Delete</button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    // Add event listeners for edit and delete buttons
    // document.querySelectorAll(".edit-btn").forEach((button) => {
    //   button.addEventListener("click", (e) => {
    //     const productId = e.target.dataset.id;
    //     // Handle edit action (implement edit functionality here)
    //     console.log(`Edit product with ID: ${productId}`);
    //   });
    // });

    // document.querySelectorAll(".delete-btn").forEach((button) => {
    //   button.addEventListener("click", (e) => {
    //     deleteQuiksell(product.id);
    //   });
    // });
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const productId = event.target.dataset.id;
        await deleteQuiksell(productId);
        window.location.reload();
      });
    });
  } catch (error) {
    console.error("Error fetching and displaying products:", error);
  }
}
const deleteQuiksell = async (productId) => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this product? This action cannot be undone."
  );
  if (!confirmDelete) {
    return; // User canceled the deletion
  }
  try {
    const response = await fetch("/delete-quiksell", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: productId }), // Send the product ID to delete
    });

    if (!response.ok) {
      throw new Error("Failed to delete quiksell product");
    }

    alert("Product deleted successfully.");
    getQuiksellData(); // Refresh the quiksell data after deletion
  } catch (error) {
    console.error("Error deleting quiksell product:", error);
  }
};

// Call the function to fetch and display products when the page loads
document.addEventListener("DOMContentLoaded", fetchAndDisplayProducts);
