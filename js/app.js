const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmY0MmU0OTZiYjcwMTAwMTUyMTg2ODEiLCJpYXQiOjE3MjcyNzg2NjYsImV4cCI6MTcyODQ4ODI2Nn0.XSloLCpuJ348JjK7WQIoPG_0qgKQ4GlGB4vwAB65I8A";
const apiEndpoint = "https://striveschool-api.herokuapp.com/api/product/";

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "back-office.html") {
    const productId = new URLSearchParams(window.location.search).get("id");
    if (productId) {
      fetchProductDetailForEditing(productId); // Fetch product details for editing
    }
    document.getElementById("productForm").addEventListener("submit", editProduct); // Listen for form submission
    document.getElementById("resetButton").addEventListener("click", resetForm);
  } else if (currentPage === "homepage.html") {
    fetchProducts();
  } else if (currentPage === "product-detail.html") {
    const productId = new URLSearchParams(window.location.search).get("id");
    if (productId) {
      fetchProductDetail(productId);
    }
  }
});

// Fetch Product Detail for Editing
const fetchProductDetailForEditing = async (productId) => {
  try {
    const response = await fetch(apiEndpoint + productId, {
      headers: {
        "Authorization": token
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch product details");
    }

    const product = await response.json();
    document.getElementById("name").value = product.name;
    document.getElementById("description").value = product.description;
    document.getElementById("brand").value = product.brand;
    document.getElementById("imageUrl").value = product.imageUrl;
    document.getElementById("price").value = product.price;
  } catch (error) {
    showError("Error fetching product details: " + error.message);
  }
};

// Edit Product
const editProduct = async (event) => {
  event.preventDefault(); // Prevent form submission

  const productId = new URLSearchParams(window.location.search).get("id");
  const product = {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    brand: document.getElementById("brand").value,
    imageUrl: document.getElementById("imageUrl").value,
    price: parseFloat(document.getElementById("price").value),
  };

  try {
    const response = await fetch(apiEndpoint + productId, {
      method: "PUT",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    });

    if (response.ok) {
      alert("Product updated successfully!");
      window.location.href = "back-office.html"; // Redirect to the back-office page after editing
    } else {
      const errorData = await response.json();
      showError("Error updating product: " + errorData.message);
    }
  } catch (error) {
    showError("Error: " + error.message);
  }
};

// Show error message
const showError = (message) => {
  const errorMessage = document.getElementById("error-message");
  errorMessage.innerText = message;
  errorMessage.classList.remove("d-none");
};

// Reset form function
const resetForm = () => {
  if (confirm("Are you sure you want to reset the form?")) {
    document.getElementById("productForm").reset();
  }
};

// Fetch Products for Homepage
const fetchProducts = async () => {
  const loader = document.getElementById("loader");
  loader.classList.remove("d-none");

  try {
    const response = await fetch(apiEndpoint, {
      headers: {
        "Authorization": token
      }
    });

    const products = await response.json();
    loader.classList.add("d-none");

    if (window.location.pathname.endsWith("homepage.html")) {
      const productList = document.getElementById("productList");
      productList.innerHTML = "";

      products.forEach((product) => {
        const imageArr = product.imageUrl.split(",").map(url => url.trim());

        // Create a div element to hold the product card
        const productCard = document.createElement('div');
        productCard.classList.add('col-md-4');

        // Set the inner HTML for the product card
        productCard.innerHTML = `
          <div class="card m-2">
            <img src="${imageArr[0]}" class="card-img-top" alt="${product.name}" id="productImage-${product._id}">
            <div class="card-body">
              <h5 class="card-title devil-font">${product.name}</h5>
              <p class="card-text">${product.description}</p>
              <button class="btn rounded-0 m-1" onclick="editProductRedirect('${product._id}')">Edit</button>
              <button class="btn rounded-0 m-1" onclick="deleteProduct('${product._id}')">Delete</button>
              <button class="btn rounded-0 m-1" onclick="viewProductDetail('${product._id}')">View Details</button>
            </div>
          </div>
        `;

        // Append the product card to the product list
        productList.appendChild(productCard);
      });
    }
  } catch (error) {
    showError("Error fetching products: " + error.message);
  }
};

// Redirect to Edit Product Page
const editProductRedirect = (productId) => {
  // Open the edit page in a new window
  window.open(`back-office.html?id=${productId}`, '_blank');
};

// Delete Product
const deleteProduct = async (productId) => {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      const response = await fetch(apiEndpoint + productId, {
        method: "DELETE",
        headers: {
          "Authorization": token
        }
      });

      if (response.ok) {
        alert("Product deleted successfully!");
        fetchProducts();  // Reload product list
      } else {
        const errorData = await response.json();
        showError("Error deleting product: " + errorData.message);
      }
    } catch (error) {
      showError("Error: " + error.message);
    }
  }
};

// View Product Detail
const viewProductDetail = (productId) => {
  window.location.href = `product-detail.html?id=${productId}`;
};

// Fetch Product Detail
const fetchProductDetail = async (productId) => {
  try {
    const response = await fetch(apiEndpoint + productId, {
      headers: {
        "Authorization": token
      }
    });

    const product = await response.json();
    const imageArr = product.imageUrl.split(",").map(url => url.trim());

    // Generate the main product structure with a placeholder for the carousel
    let detailContent = `
      <h2 class="devil-font">${product.name}</h2>
      <img id="mainImage" src="${imageArr[0]}" class="img-fluid mb-3" alt="${product.name}">
      
      <div class="row mt-4 justify-content-center" id="imageCarousel">
    `;

    // Generate carousel thumbnails dynamically
    imageArr.forEach((img, index) => {
      detailContent += `
      <img class="m-1" src="${img}" class="img-thumbnail img-clickable" alt="Image ${index + 1}" style="cursor: pointer;width:100px;" onclick="changeMainImage('${img}')">
      `;
    });

    // Close the carousel row div
    detailContent += `</div>`;

    // Add the rest of the product details below the carousel
    detailContent += `
      <p class="mt-3"><strong>Description:</strong> ${product.description}</p>
      <p><strong>Use:</strong> ${product.brand}</p>
      <p><strong>Price:</strong> $${product.price}</p>
    `;

    // Insert the full content into the DOM
    document.getElementById("detailContent").innerHTML = detailContent;

  } catch (error) {
    showError("Error fetching product details: " + error.message);
  }
};

// Function to change the main image
const changeMainImage = (newImageUrl) => {
  const mainImage = document.getElementById("mainImage");
  mainImage.src = newImageUrl;
};
