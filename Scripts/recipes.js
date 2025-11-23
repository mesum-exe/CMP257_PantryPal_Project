// 1. Base recipe data (built-in recipes with images)
const baseRecipes = [
    {
        title: "Chocolate Brownies",
        time: "45 mins",
        difficulty: "Easy",
        tags: ["Dessert", "Baked", "Sweet"],
        summary: "Rich and fudgy brownies made with cocoa and butter.",
        ingredients: ["Butter", "Sugar", "Cocoa powder", "Eggs", "Flour", "Salt"],
        instructions: [
            "Melt butter and whisk with sugar",
            "Add eggs one at a time",
            "Fold in cocoa, flour, and salt",
            "Bake at 350°F for 25 minutes"
        ],
        image: "/Assets/brownies.jpg" // 🔁 change path if needed
    },
    {
        title: "Spaghetti Aglio e Olio",
        time: "20 mins",
        difficulty: "Easy",
        tags: ["Quick", "Vegetarian", "Dinner"],
        summary: "Classic pasta tossed with garlic, olive oil, and chili flakes.",
        ingredients: ["Spaghetti", "Garlic", "Olive Oil", "Chili Flakes", "Parsley", "Parmesan"],
        instructions: [
            "Boil spaghetti until al dente",
            "Sauté garlic in olive oil",
            "Add chili flakes and pasta water",
            "Toss pasta with sauce and parsley",
            "Top with parmesan"
        ],
        image: "/Assets/aglioeolio.jpg"
    },
    {
        title: "Chicken Tikka Wrap",
        time: "35 mins",
        difficulty: "Medium",
        tags: ["High Protein", "Lunch", "Quick"],
        summary: "Grilled chicken tucked in flatbread with yogurt and vegetables.",
        ingredients: ["Chicken thighs", "Yogurt", "Tikka spices", "Flatbread", "Cucumber", "Tomato", "Onion"],
        instructions: [
            "Marinate chicken in yogurt and spices",
            "Grill until charred",
            "Warm flatbread",
            "Assemble with veggies and sauce"
        ],
        image: "/Assets/tikkawrap.jpg"
    },
    {
        title: "Avocado Smoothie",
        time: "8 mins",
        difficulty: "Easy",
        tags: ["Healthy", "Breakfast", "Vegan"],
        summary: "Creamy smoothie with avocado, banana, and a hint of honey.",
        ingredients: ["Avocado", "Banana", "Non-dairy milk", "Honey or agave", "Ice"],
        instructions: [
            "Blend avocado and banana",
            "Add milk and sweetener",
            "Blend until smooth",
            "Serve chilled"
        ],
        image: "/Assets/avocadosmoothie.jpg"
    }
];

// This will hold base + custom recipes
let recipes = [];

// For user-uploaded image (Base64)
let uploadedImage = "";

// === LocalStorage helpers ===
function loadRecipesFromStorage() {
    // FIX: Only load custom recipes from storage and combine them with base recipes every time.
    // This prevents the accidental saving and reloading of base recipes.
    const customRecipes = JSON.parse(localStorage.getItem("pantryCustomRecipes") || "[]");

    // Initialize the main recipes array with the static base recipes and the stored custom recipes.
    recipes = [...baseRecipes, ...customRecipes];
}


function saveCustomRecipes() {
    // Ensure we only save recipes marked as isCustom: true
    const custom = recipes.filter(r => r.isCustom);
    localStorage.setItem("pantryCustomRecipes", JSON.stringify(custom));
}

// 2. Function to Render Recipe Cards
function renderRecipes() {
    const recipesList = document.getElementById('recipesList');
    const emptyState = document.getElementById('emptyState');
    
    if (!recipesList) return;

    // Clear existing content
    recipesList.innerHTML = '';
    
    // Check if there are recipes
    if (!recipes || recipes.length === 0) {
        if (emptyState) emptyState.classList.remove('d-none');
        return;
    }
    
    if (emptyState) emptyState.classList.add('d-none');
    
    // Loop through recipes and create cards
    recipes.forEach((recipe, index) => {
        const col = document.createElement('div');
        col.className = 'col';
        
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.index = index;

        // 🔹 Recipe image (if exists)
        if (recipe.image) {
            const img = document.createElement('img');
            img.className = 'recipe-image';
            img.src = recipe.image;
            img.alt = recipe.title;
            card.appendChild(img);
        }
        
        // Recipe Meta (time and difficulty)
        const meta = document.createElement('div');
        meta.className = 'recipe-meta';
        meta.innerHTML = `
            <span><i class="bi bi-clock me-1"></i>${recipe.time}</span>
            <span><i class="bi bi-graph-up me-1"></i>${recipe.difficulty}</span>
        `;
        
        // Recipe Title
        const title = document.createElement('h4');
        title.textContent = recipe.title;
        
        // Recipe Summary
        const summary = document.createElement('p');
        summary.textContent = recipe.summary;
        
        // Recipe Tags
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'recipe-tags';
        if (recipe.tags && recipe.tags.length) {
            recipe.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'recipe-tag';
                tagSpan.textContent = tag;
                tagsContainer.appendChild(tagSpan);
            });
        }
        
        // Card Actions
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        actions.innerHTML = `
            <button class="btn-inline" data-view data-index="${index}">View details</button>
            <button class="btn-inline" data-favorite data-index="${index}">
                <i class="bi bi-heart me-1"></i>Favorite
            </button>
        `;
        
        // Append all elements
        card.appendChild(meta);
        card.appendChild(title);
        card.appendChild(summary);
        card.appendChild(tagsContainer);
        card.appendChild(actions);
        col.appendChild(card);
        recipesList.appendChild(col);
    });
    
    // Add event listeners
    attachEventListeners();
    applyCardAnimations();
}

// 3. Function to Add Event Listeners
function attachEventListeners() {
    // View Details buttons
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = e.currentTarget.dataset.index;
            showRecipeDetails(index);
        });
    });
    
    // Favorite buttons
    document.querySelectorAll('[data-favorite]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const buttonEl = e.currentTarget;
            const heartIcon = buttonEl.querySelector('i');
            
            if (heartIcon.classList.contains('bi-heart')) {
                heartIcon.classList.remove('bi-heart');
                heartIcon.classList.add('bi-heart-fill');
                buttonEl.style.color = '#dc3545';
                
                // Add a subtle animation
                buttonEl.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    buttonEl.style.transform = 'scale(1)';
                }, 200);
            } else {
                heartIcon.classList.remove('bi-heart-fill');
                heartIcon.classList.add('bi-heart');
                buttonEl.style.color = '';
            }
        });
    });
    
    // Make entire recipe card clickable to view details
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('[data-view]') && !e.target.closest('[data-favorite]')) {
                const index = card.dataset.index;
                showRecipeDetails(index);
            }
        });
    });
}

// 4. Function to Show Recipe Details in Modal (with image)
function showRecipeDetails(index) {
    const recipe = recipes[index];
    if (!recipe) return;

    const imageHTML = recipe.image
        ? `<img src="${recipe.image}" alt="${recipe.title}" class="modal-recipe-image mb-3">`
        : "";
    
    const modalHTML = `
        <div class="modal fade" id="recipeModal" tabindex="-1" aria-labelledby="recipeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="recipeModalLabel">${recipe.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${imageHTML}
                        <div class="recipe-meta mb-3">
                            <span><i class="bi bi-clock me-1"></i>${recipe.time}</span>
                            <span><i class="bi bi-graph-up me-1"></i>${recipe.difficulty}</span>
                        </div>
                        
                        <div class="recipe-tags mb-3">
                            ${recipe.tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                        </div>
                        
                        <p class="mb-4">${recipe.summary}</p>
                        
                        <h6 class="fw-bold mb-2">Ingredients:</h6>
                        <ul class="mb-4">
                            ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                        </ul>
                        
                        <h6 class="fw-bold mb-2">Instructions:</h6>
                        <ol>
                            ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
                        </ol>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-hero">Start Cooking</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove any existing modal
    const existingModal = document.getElementById('recipeModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
    modal.show();
    
    // Clean up modal after it's hidden
    document.getElementById('recipeModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// 5. Handle Recipe Form Submission (with image + localStorage)
function handleRecipeFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('recipe-name').value.trim();
    const ingredientsText = document.getElementById('ingredients').value.trim();
    const instructionsText = document.getElementById('instructions').value.trim();
    
    // Get selected tags
    const selectedTags = [];
    document.querySelectorAll('.tag-chip input:checked').forEach(checkbox => {
        selectedTags.push(checkbox.value);
    });
    
    // Validate form
    if (!name || !ingredientsText || !instructionsText) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    // Create new recipe object
    const newRecipe = {
        title: name,
        time: "30 mins", // Default value
        difficulty: "Medium", // Default value
        tags: selectedTags.length > 0 ? selectedTags : ["Custom"],
        summary: "A custom recipe created by you.",
        ingredients: ingredientsText.split('\n').filter(line => line.trim()),
        instructions: instructionsText.split('\n').filter(line => line.trim()),
        image: uploadedImage || "/Assets/Images/recipes/default.jpg", // fallback
        isCustom: true
    };
    
    // Add to recipes array
    recipes.push(newRecipe);
    saveCustomRecipes();
    
    // Re-render recipes
    renderRecipes();
    
    // Clear form + image
    document.getElementById('recipeForm').reset();
    uploadedImage = "";
    
    // Scroll to recipes list
    document.getElementById('recipesList').scrollIntoView({ behavior: 'smooth' });
    
    // Show success message
    showNotification('Recipe added successfully!', 'success');
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        border-radius: 12px;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 6. Shuffle Recipes Function
function shuffleRecipes() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (!shuffleBtn) return;

    const originalHTML = shuffleBtn.innerHTML;
    shuffleBtn.innerHTML = '<i class="bi bi-arrow-repeat me-2"></i>Shuffling...';
    shuffleBtn.disabled = true;
    
    setTimeout(() => {
        for (let i = recipes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [recipes[i], recipes[j]] = [recipes[j], recipes[i]];
        }
        
        renderRecipes();
        
        shuffleBtn.innerHTML = originalHTML;
        shuffleBtn.disabled = false;
        
        showNotification('Recipes shuffled!', 'info');
    }, 500);
}

// 7. Generate Recipes Function (placeholder)
function generateRecipes() {
    const btn = event.target;
    const originalHTML = btn.innerHTML;
    
    btn.innerHTML = '<i class="bi bi-stars me-2"></i>Generating...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        showNotification('Generate recipes feature coming soon! This will use your inventory to suggest recipes.', 'info');
    }, 1000);
}

// 8. Card animations on scroll
function applyCardAnimations() {
    const cards = document.querySelectorAll('.recipe-card');
    if (!cards.length) return;

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

// 9. Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Load recipes from storage + base
    loadRecipesFromStorage();
    
    // Render initial recipes
    renderRecipes();
    
    // Add form submit handler
    const recipeForm = document.getElementById('recipeForm');
    if (recipeForm) {
        recipeForm.addEventListener('submit', handleRecipeFormSubmit);
    }

    // Image upload input
    const imageInput = document.getElementById('recipe-image');
    if (imageInput) {
        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
        
            const reader = new FileReader();
            reader.onload = () => {
                uploadedImage = reader.result; // Base64
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Add shuffle button handler
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', shuffleRecipes);
    }
    
    // Add generate buttons handlers
    document.querySelectorAll('[data-generate]').forEach(btn => {
        btn.addEventListener('click', generateRecipes);
    });
    
    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});