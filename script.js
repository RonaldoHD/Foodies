
let selectedImages = [];
const endpoint = "https://foodies-d70k.onrender.com"
// const endpoint = "http://localhost:3001/"

async function generateImageUrls(recipeTitle) {
    try {
        const response = await fetch(`/generateImage?title=${encodeURIComponent(recipeTitle)}`);
        const data = await response.json();
        return data.imageUrl.map(item => item.link);
    } catch (error) {
        console.error('Error fetching images:', error);
        return [];
    }
}

async function updateRecipeStatus(data) {
    console.log(data)
    try {
        const response = await fetch("/updateRecipe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: data }), // Convert the object to a JSON string
        });
        if (!response.ok) {
            throw new Error("Failed to update recipe status");
        }
        const result = await response.text(); // Handle the response if needed
        console.log(result);
    } catch (error) {
        console.error("Error updating recipe status:", error);
    }
}

fetch(`${endpoint}/getfirebase`)
    .then((response) => response.json())
    .then((recipes) => {
        const container = document.getElementById("recipes-list");
        const modalTitle = document.getElementById("recipeModalLabel");
        const modalBody = document.getElementById("modalBody");
        const imageContainer = document.getElementById("imageContainer");
        const submitButton = document.getElementById("submitForm");

        Object.entries(recipes).slice(0, 100).forEach(([id, recipe]) => { // Extract key (id) and value (recipe)
            // console.log(recipe.id); // Log ID and recipe details

            if (recipe.added) {
                return; // Skip invalid or already added recipes
            }

            const card = document.createElement("div");
            card.className = "card text-white bg-primary mb-4";
            card.style.cursor = "pointer";

            const cardBody = document.createElement("div");
            cardBody.className = "card-body";

            const title = document.createElement("h5");
            title.className = "card-title";
            title.textContent = recipe.title;
            cardBody.appendChild(title);

            const shortDesc = document.createElement("p");
            shortDesc.className = "card-text";
            shortDesc.textContent = `${recipe.instructions.slice(0, 50)}...`;
            cardBody.appendChild(shortDesc);

            card.appendChild(cardBody);

            card.addEventListener("click", () => {
                modalTitle.textContent = recipe.title;

                modalBody.innerHTML = `
          <p><strong>Instructions:</strong> ${recipe.instructions}</p>
          <h6>Ingredients:</h6>
          <ul class="list-group list-group-flush">
            ${recipe.ingredients
                        .map((ingredient) => `<li class="list-group-item">${ingredient}</li>`)
                        .join("")}
          </ul>
          <button id="generateImages" class="btn btn-primary mt-3">
            <span id="loader" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
            Generate Images
          </button>
        `;

                imageContainer.innerHTML = "";

                document.getElementById("generateImages").onclick = async () => {
                    const loader = document.getElementById("loader");
                    loader.classList.remove("d-none");
                    const imageUrls = await generateImageUrls(recipe.title);
                    loader.classList.add("d-none");
                    imageContainer.innerHTML = "";
                    imageUrls.forEach((url) => {
                        const img = document.createElement("img");
                        img.src = url;
                        img.className = "img-fluid rounded m-2";
                        img.style.cursor = "pointer";
                        img.addEventListener("click", () => {
                            img.classList.toggle("border-success");
                            img.classList.toggle("shadow-lg");
                            img.style.border = '2px solid blue'
                        });
                        imageContainer.appendChild(img);
                    });
                };
                const modal = new bootstrap.Modal(document.getElementById("recipeModal"));

                submitButton.onclick = async () => {
                    const cuisineType = document.getElementById("cuisineType").value;
                    const mealType = document.getElementById("mealType").value;
                    const difficulty = document.getElementById("difficulty").value;
                    const selectedImages = Array.from(
                        imageContainer.querySelectorAll(".border-success")
                    ).map((img) => img.src);

                    const data = {
                        id: recipe.id,
                        title: recipe.title,
                        instructions: recipe.instructions,
                        cuisine: cuisineType,
                        mealType: mealType,
                        difficulty: difficulty,
                        images: selectedImages,
                        added:'true'
                    };

                    await updateRecipeStatus(data); // Update recipe status
                    modal.hide();
                
                    // Hide the recipe card
                    card.style.display = "none";
                };

                modal.show();
            });

            container.appendChild(card);
        });
    })
    .catch((error) => console.error("Error fetching recipes:", error));




