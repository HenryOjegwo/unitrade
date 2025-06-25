const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", this.window.scrollY > 0);
});

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".product-content");

  try {
    const res = await fetch("/featured-products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const products = await res.json();

    if (!res.ok) {
      throw new Error(products.error || "Failed to fetch products");
    }

    // Clear default placeholder
    container.innerHTML = "";

    products.forEach((product) => {
      const box = document.createElement("div");
      box.classList.add("product-card");

      box.innerHTML = `
                <div class="product-card">
                    <img src="/uploads/${product.image}" alt="${product.name} width="60px">
                </div>
                <h3><a href="description.html?vendorid=${product.id}">${product.name}</a></h3>
                <h4>${product.description}</h4>
                <div><a href="#" class="price">₦${product.price}</a></div>
            `;

      container.appendChild(box);
    });
  } catch (err) {
    console.error("⚠️ Failed to load featured products:", err);
    container.innerHTML =
      "<p>Failed to load featured products. Please try again later.</p>";
  }
});
