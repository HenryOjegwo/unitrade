const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", window.scrollY > 0);
});

// Get category from file name
function getCategoryFromPath() {
  const path = window.location.pathname;
  const page = path.split("/").pop().replace(".html", "");
  return page.toLowerCase();
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".product-content");
  const category = getCategoryFromPath();

  try {
    // const endpoint =
    //   category === "shop"
    //     ? `http://localhost:5000/api/products`
    //     : `http://localhost:5000/api/products/category/${category}`;

    const res = await fetch("/category-products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category: category }),
    });

    const products = await res.json();

    if (!res.ok) throw new Error(products.error || "Failed to fetch products");

    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML = "<p>No products found for this category.</p>";
      return;
    }

    products.forEach((product) => {
      const box = document.createElement("div");
      box.classList.add("box");

      box.innerHTML = `
                <div class="box-img">
                    <img src="/uploads/${product.image}" alt="${product.name}" width="100px">
                </div>
                <h3><a href="description.html?vendorid=${product.id}">${product.name}</a></h3>
                <h4>${product.description}</h4>
                <div><a href="#" class="price">₦${product.price}</a></div>
            `;
      container.appendChild(box);
    });
  } catch (err) {
    console.error("⚠️ Failed to load products:", err);
    container.innerHTML =
      "<p>Failed to load products. Please try again later.</p>";
  }
});

const dropdownIcon = document.getElementById("dropdown-icon");
const dropdownMenu = document.getElementById("dropdown-menu");

dropdownIcon.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent the page from scrolling to the top
  dropdownMenu.classList.toggle("show"); // Toggle visibility
});

// Optional: Close the dropdown menu if clicked outside
document.addEventListener("click", (event) => {
  if (
    !dropdownIcon.contains(event.target) &&
    !dropdownMenu.contains(event.target)
  ) {
    dropdownMenu.classList.remove("show");
  }
});
