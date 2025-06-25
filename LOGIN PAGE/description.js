const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", this.window.scrollY > 0);
});

const productId = window.location.search.split("=")[1];

const description = async () => {
  console.log("Page loaded");
  const response = await fetch("/description", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ product_Id: productId }),
  });

  const data = await response.json();
  console.log(data);
  if (!response.ok) {
    console.error("Error fetching product description:", data);
    return;
  }
  const productDescriptionContainer = document.getElementById("description");
  productDescriptionContainer.innerHTML = ""; // Clear existing content

  const descriptionCard = document.createElement("div");
  descriptionCard.classList.add("description-card");
  console.log(data.description);

  descriptionCard.innerHTML = `

             <div class="home-image">
                <img src="/uploads/${data.image}" alt="${data.name}" class="product-image"/>
            </div>

            <<div class="home-text">
                <h4>${data.name}</h4><br>
                <h4>₦${data.price}</h4><br>
                <h4>PRODUCT DESCRIPTION: ${data.description}</h4><br>
                <h4>VENDOR NAME: ${data.vendor_name}</h4><br>
                <h4>VENDOR NUMBER: ${data.vendor_phone}</h4><br>
            </div>

        `;
  productDescriptionContainer.appendChild(descriptionCard);
};

document.addEventListener("DOMContentLoaded", description);
