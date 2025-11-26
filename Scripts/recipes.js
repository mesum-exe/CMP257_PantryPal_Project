// PantryPal Recipes - Fully Interactive Frontend with LocalStorage

// === 1. Base recipe data (used only on first load) ===
const baseRecipes = [
  {
    id: 1,
    title: "Chocolate Brownies",
    time: "45 mins",
    difficulty: "Easy",
    tags: ["Dessert", "Sweet", "Baked"],
    summary: "Rich and fudgy brownies made with cocoa and butter.",
    ingredients: ["Butter", "Sugar", "Cocoa powder", "Eggs", "Flour", "Salt"],
    instructions: [
      "Melt butter and whisk with sugar",
      "Add eggs one at a time",
      "Fold in cocoa, flour, and salt",
      "Bake at 180°C (350°F) for about 25 minutes"
    ],
    image: "/Assets/brownies.jpg",
    favorite: false
  },
  {
    id: 2,
    title: "Spaghetti Aglio e Olio",
    time: "20 mins",
    difficulty: "Easy",
    tags: ["Quick", "Vegetarian", "Dinner"],
    summary: "Classic pasta tossed with garlic, olive oil, and chili flakes.",
    ingredients: [
      "Spaghetti",
      "Garlic",
      "Olive Oil",
      "Chili Flakes",
      "Parsley",
      "Parmesan"
    ],
    instructions: [
      "Boil spaghetti until al dente",
      "Sauté garlic in olive oil until fragrant",
      "Add chili flakes and a splash of pasta water",
      "Toss pasta with sauce and parsley",
      "Top with parmesan and serve"
    ],
    image: "/Assets/aglioeolio.jpg",
    favorite: false
  },
  {
    id: 3,
    title: "Chicken Tikka Wrap",
    time: "35 mins",
    difficulty: "Medium",
    tags: ["High Protein", "Lunch", "Quick"],
    summary: "Grilled chicken tucked in flatbread with yogurt and vegetables.",
    ingredients: [
      "Chicken thighs",
      "Yogurt",
      "Tikka spices",
      "Flatbread",
      "Cucumber",
      "Tomato",
      "Onion"
    ],
    instructions: [
      "Marinate chicken in yogurt and spices for at least 30 minutes",
      "Grill until cooked through and slightly charred",
      "Warm flatbreads",
      "Assemble wraps with chicken, veggies, and extra yogurt sauce"
    ],
    image: "/Assets/tikkawrap.jpg",
    favorite: false
  },
  {
    id: 4,
    title: "Avocado Smoothie",
    time: "8 mins",
    difficulty: "Easy",
    tags: ["Healthy", "Breakfast", "Vegan"],
    summary: "Creamy smoothie with avocado, banana, and a hint of honey.",
    ingredients: ["Avocado", "Banana", "Non-dairy milk", "Honey or agave", "Ice"],
    instructions: [
      "Add avocado and banana to blender",
      "Pour in milk and sweetener",
      "Add ice",
      "Blend until completely smooth",
      "Serve chilled"
    ],
    image: "/Assets/avocadosmoothie.jpg",
    favorite: false
  }
];

// === 2. Global state ===
const STORAGE_KEY = "pantryRecipes";

let recipes = [];
let uploadedImage = "";
let editingRecipeId = null;
let currentDetailRecipeId = null;

const filterState = {
  search: "",
  time: "all",
  tag: "all",
  favoriteOnly: false
};

// === 3. LocalStorage helpers ===
function saveRecipes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function loadRecipes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        recipes = parsed;
        return;
      }
    } catch (e) {
      console.error("Error parsing stored recipes:", e);
    }
  }
  // If nothing stored or invalid, initialize with base recipes
  recipes = baseRecipes.map(r => ({ ...r }));
  saveRecipes();
}

function getNextId() {
  if (!recipes.length) return 1;
  const maxId = recipes.reduce((max, r) => (r.id && r.id > max ? r.id : max), 0);
  return maxId + 1;
}

// === 4. Filtering helpers ===
function parseTimeToMinutes(timeValue) {
  if (!timeValue) return null;

  if (typeof timeValue === "number") return timeValue;

  if (typeof timeValue === "string") {
    const match = timeValue.match(/(\d+)\s*/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}

function formatTimeDisplay(timeValue) {
  if (typeof timeValue === "number") {
    return `${timeValue} mins`;
  }
  if (typeof timeValue === "string" && timeValue.trim() !== "") {
    return timeValue;
  }
  return "N/A";
}

function getFilteredRecipes() {
  return recipes.filter((recipe) => {
    // Search filter
    if (filterState.search.trim() !== "") {
      const q = filterState.search.toLowerCase();
      const haystack = [
        recipe.title,
        recipe.summary,
        Array.isArray(recipe.ingredients) ? recipe.ingredients.join(" ") : "",
        Array.isArray(recipe.instructions) ? recipe.instructions.join(" ") : ""
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    // Time filter
    const minutes = parseTimeToMinutes(recipe.time);
    if (filterState.time !== "all" && minutes !== null) {
      switch (filterState.time) {
        case "15":
          if (minutes > 15) return false;
          break;
        case "30":
          if (minutes > 30) return false;
          break;
        case "45":
          if (minutes > 45) return false;
          break;
        case "long":
          if (minutes <= 45) return false;
          break;
      }
    }

    // Tag filter
    if (filterState.tag !== "all") {
      const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
      if (!tags.includes(filterState.tag)) return false;
    }

    // Favorites filter
    if (filterState.favoriteOnly && !recipe.favorite) {
      return false;
    }

    return true;
  });
}

// === 5. Rendering ===
function renderRecipes() {
  const recipesList = document.getElementById("recipesList");
  const emptyState = document.getElementById("emptyState");
  if (!recipesList) return;

  recipesList.innerHTML = "";

  const visibleRecipes = getFilteredRecipes();

  if (!visibleRecipes.length) {
    if (emptyState) emptyState.classList.remove("d-none");
    return;
  }
  if (emptyState) emptyState.classList.add("d-none");

  visibleRecipes.forEach((recipe) => {
    const col = document.createElement("div");
    col.className = "col";

    const card = document.createElement("div");
    card.className = "recipe-card";
    card.dataset.id = recipe.id;

    if (recipe.image) {
      const img = document.createElement("img");
      img.className = "recipe-image";
      img.src = recipe.image;
      img.alt = recipe.title;
      card.appendChild(img);
    }

    const meta = document.createElement("div");
    meta.className = "recipe-meta";
    meta.innerHTML = `
      <span><i class="bi bi-clock me-1"></i>${formatTimeDisplay(recipe.time)}</span>
      <span><i class="bi bi-graph-up me-1"></i>${recipe.difficulty || "N/A"}</span>
    `;

    const title = document.createElement("h4");
    title.textContent = recipe.title;

    const summary = document.createElement("p");
    summary.textContent = recipe.summary || "";

    const tagsContainer = document.createElement("div");
    tagsContainer.className = "recipe-tags";
    if (Array.isArray(recipe.tags)) {
      recipe.tags.forEach((tag) => {
        const tagSpan = document.createElement("span");
        tagSpan.className = "recipe-tag";
        tagSpan.textContent = tag;
        tagsContainer.appendChild(tagSpan);
      });
    }

    const isFavorite = !!recipe.favorite;
    const favoriteIconClass = isFavorite ? "bi-heart-fill" : "bi-heart";
    const favoriteExtraClass = isFavorite ? " text-danger" : "";

    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.innerHTML = `
      <button class="btn-inline" data-view data-id="${recipe.id}">View details</button>
      <button class="btn-inline${favoriteExtraClass}" data-favorite data-id="${recipe.id}">
        <i class="bi ${favoriteIconClass} me-1"></i>Favorite
      </button>
    `;

    card.appendChild(meta);
    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(tagsContainer);
    card.appendChild(actions);
    col.appendChild(card);
    recipesList.appendChild(col);
  });

  attachCardEventListeners();
  applyCardAnimations();
}

function attachCardEventListeners() {
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(e.currentTarget.dataset.id, 10);
      showRecipeDetails(id);
    });
  });

  document.querySelectorAll("[data-favorite]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(e.currentTarget.dataset.id, 10);
      toggleFavorite(id, e.currentTarget);
    });
  });

  document.querySelectorAll(".recipe-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (
        e.target.closest("[data-view]") ||
        e.target.closest("[data-favorite]")
      ) {
        return;
      }
      const id = parseInt(card.dataset.id, 10);
      showRecipeDetails(id);
    });
  });
}

// === 6. Favorites ===
function toggleFavorite(id, buttonEl) {
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return;

  recipe.favorite = !recipe.favorite;
  saveRecipes();

  const heartIcon = buttonEl.querySelector("i");
  if (!heartIcon) return;

  if (recipe.favorite) {
    heartIcon.classList.remove("bi-heart");
    heartIcon.classList.add("bi-heart-fill");
    buttonEl.classList.add("text-danger");
    buttonEl.style.transform = "scale(1.2)";
    setTimeout(() => {
      buttonEl.style.transform = "scale(1)";
    }, 200);
  } else {
    heartIcon.classList.remove("bi-heart-fill");
    heartIcon.classList.add("bi-heart");
    buttonEl.classList.remove("text-danger");
  }
}

// === 7. Detail modal ===
function showRecipeDetails(id) {
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return;

  currentDetailRecipeId = id;

  const modalEl = document.getElementById("recipeDetailModal");
  if (!modalEl) return;

  const titleEl = document.getElementById("recipeDetailTitle");
  const imageEl = document.getElementById("recipeDetailImage");
  const metaEl = document.getElementById("recipeDetailMeta");
  const tagsEl = document.getElementById("recipeDetailTags");
  const summaryEl = document.getElementById("recipeDetailSummary");
  const ingredientsEl = document.getElementById("recipeDetailIngredients");
  const instructionsEl = document.getElementById("recipeDetailInstructions");

  if (titleEl) titleEl.textContent = recipe.title || "";

  if (imageEl) {
    if (recipe.image) {
      imageEl.src = recipe.image;
      imageEl.alt = recipe.title;
      imageEl.classList.remove("d-none");
    } else {
      imageEl.classList.add("d-none");
    }
  }

  if (metaEl) {
    metaEl.innerHTML = `
      <span><i class="bi bi-clock me-1"></i>${formatTimeDisplay(
        recipe.time
      )}</span>
      <span><i class="bi bi-graph-up me-1"></i>${recipe.difficulty ||
        "N/A"}</span>
    `;
  }

  if (tagsEl) {
    tagsEl.innerHTML = "";
    if (Array.isArray(recipe.tags)) {
      recipe.tags.forEach((tag) => {
        const span = document.createElement("span");
        span.className = "recipe-tag";
        span.textContent = tag;
        tagsEl.appendChild(span);
      });
    }
  }

  if (summaryEl) {
    summaryEl.textContent = recipe.summary || "";
  }

  if (ingredientsEl) {
    ingredientsEl.innerHTML = "";
    if (Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach((ing) => {
        const li = document.createElement("li");
        li.textContent = ing;
        ingredientsEl.appendChild(li);
      });
    }
  }

  if (instructionsEl) {
    instructionsEl.innerHTML = "";
    if (Array.isArray(recipe.instructions)) {
      recipe.instructions.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        instructionsEl.appendChild(li);
      });
    }
  }

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

function handleDeleteCurrentRecipe() {
  if (currentDetailRecipeId == null) return;

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this recipe?"
  );
  if (!confirmDelete) return;

  recipes = recipes.filter((r) => r.id !== currentDetailRecipeId);
  saveRecipes();
  renderRecipes();

  const modalEl = document.getElementById("recipeDetailModal");
  if (modalEl) {
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();
  }

  showNotification("Recipe deleted.", "warning");
}

// === 8. Edit flow (using the Add Recipe form modal) ===
function openEditFormForCurrentRecipe() {
  if (currentDetailRecipeId == null) return;
  const recipe = recipes.find((r) => r.id === currentDetailRecipeId);
  if (!recipe) return;

  editingRecipeId = recipe.id;

  const recipeForm = document.getElementById("recipeForm");
  if (!recipeForm) return;

  const nameInput = document.getElementById("recipe-name");
  const timeInput = document.getElementById("recipe-time");
  const difficultySelect = document.getElementById("recipe-difficulty");
  const ingredientsTextarea = document.getElementById("ingredients");
  const instructionsTextarea = document.getElementById("instructions");

  if (nameInput) nameInput.value = recipe.title || "";

  if (timeInput) {
    const mins = parseTimeToMinutes(recipe.time);
    timeInput.value = mins !== null ? mins : "";
  }

  if (difficultySelect) {
    difficultySelect.value = recipe.difficulty || "";
  }

  if (ingredientsTextarea) {
    ingredientsTextarea.value = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.join("\n")
      : "";
  }

  if (instructionsTextarea) {
    instructionsTextarea.value = Array.isArray(recipe.instructions)
      ? recipe.instructions.join("\n")
      : "";
  }

  document
    .querySelectorAll(".tag-chip input[type='checkbox']")
    .forEach((checkbox) => {
      checkbox.checked = false;
    });

  if (Array.isArray(recipe.tags)) {
    document
      .querySelectorAll(".tag-chip input[type='checkbox']")
      .forEach((checkbox) => {
        if (recipe.tags.includes(checkbox.value)) {
          checkbox.checked = true;
        }
      });
  }

  uploadedImage = "";

  const detailModalEl = document.getElementById("recipeDetailModal");
  if (detailModalEl) {
    const detailInstance = bootstrap.Modal.getInstance(detailModalEl);
    if (detailInstance) detailInstance.hide();
  }

  const recipeModalEl = document.getElementById("recipeModal");
  if (!recipeModalEl) return;

  const titleEl = document.getElementById("recipeModalLabel");
  if (titleEl) titleEl.textContent = "Edit Recipe";

  const recipeModal = new bootstrap.Modal(recipeModalEl);
  recipeModal.show();
}

// === 9. Handle Add/Edit form submit ===
function handleRecipeFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("recipe-name").value.trim();
  const timeRaw = document.getElementById("recipe-time").value.trim();
  const difficulty = document.getElementById("recipe-difficulty").value;
  const ingredientsText = document.getElementById("ingredients").value.trim();
  const instructionsText = document.getElementById("instructions").value.trim();

  const selectedTags = [];
  document
    .querySelectorAll(".tag-chip input:checked")
    .forEach((checkbox) => selectedTags.push(checkbox.value));

  if (!name || !ingredientsText || !instructionsText) {
    showNotification("Please fill in all required fields.", "warning");
    return;
  }

  let minutesValue = null;
  if (timeRaw !== "") {
    const parsed = parseInt(timeRaw, 10);
    if (!isNaN(parsed) && parsed > 0) {
      minutesValue = parsed;
    }
  }

  const ingredients = ingredientsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  const instructions = instructionsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  const baseData = {
    title: name,
    time: minutesValue !== null ? `${minutesValue} mins` : "",
    difficulty: difficulty || "",
    tags: selectedTags.length ? selectedTags : [],
    summary: "A custom recipe created by you.",
    ingredients,
    instructions
  };

  if (editingRecipeId != null) {
    const idx = recipes.findIndex((r) => r.id === editingRecipeId);
    if (idx !== -1) {
      const existing = recipes[idx];
      const imageToUse =
        uploadedImage || existing.image || "/Assets/Images/recipes/default.jpg";

      recipes[idx] = {
        ...existing,
        ...baseData,
        image: imageToUse
      };
    }
    showNotification("Recipe updated successfully!", "success");
  } else {
    const imageToUse =
      uploadedImage || "/Assets/Images/recipes/default.jpg";

    const newRecipe = {
      id: getNextId(),
      ...baseData,
      image: imageToUse,
      favorite: false
    };
    recipes.push(newRecipe);
    showNotification("Recipe added successfully!", "success");
  }

  saveRecipes();
  renderRecipes();

  const recipeForm = document.getElementById("recipeForm");
  if (recipeForm) recipeForm.reset();
  uploadedImage = "";
  editingRecipeId = null;

  const modalEl = document.getElementById("recipeModal");
  if (modalEl) {
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();
  }
}

// === 10. Notifications ===
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
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
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// === 11. Shuffle recipes ===
function shuffleRecipes() {
  const shuffleBtn = document.getElementById("shuffleBtn");
  if (!shuffleBtn) return;

  const originalHTML = shuffleBtn.innerHTML;
  shuffleBtn.innerHTML =
    '<i class="bi bi-arrow-repeat me-2"></i>Shuffling...';
  shuffleBtn.disabled = true;

  setTimeout(() => {
    for (let i = recipes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [recipes[i], recipes[j]] = [recipes[j], recipes[i]];
    }

    saveRecipes();
    renderRecipes();

    shuffleBtn.innerHTML = originalHTML;
    shuffleBtn.disabled = false;

    showNotification("Recipes shuffled!", "info");
  }, 500);
}

// === 12. Card animations ===
function applyCardAnimations() {
  const cards = document.querySelectorAll(".recipe-card");
  if (!cards.length) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  cards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(card);
  });
}

// === 13. Filters wiring ===
function setupFilters() {
  const searchInput = document.getElementById("searchRecipes");
  const timeSelect = document.getElementById("filterTime");
  const tagSelect = document.getElementById("filterTag");
  const favoriteBtn = document.getElementById("filterFavorite");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterState.search = e.target.value;
      renderRecipes();
    });
  }

  if (timeSelect) {
    timeSelect.addEventListener("change", (e) => {
      filterState.time = e.target.value;
      renderRecipes();
    });
  }

  if (tagSelect) {
    tagSelect.addEventListener("change", (e) => {
      filterState.tag = e.target.value;
      renderRecipes();
    });
  }

  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", () => {
      filterState.favoriteOnly = !filterState.favoriteOnly;
      favoriteBtn.classList.toggle("btn-secondary", filterState.favoriteOnly);
      favoriteBtn.classList.toggle(
        "btn-outline-secondary",
        !filterState.favoriteOnly
      );
      renderRecipes();
    });
  }
}

// === 14. Image upload handler ===
function setupImageUpload() {
  const imageInput = document.getElementById("recipe-image");
  if (!imageInput) return;

  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      uploadedImage = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// === 15. Detail modal buttons wiring ===
function setupDetailModalButtons() {
  const deleteBtn = document.getElementById("deleteRecipeBtn");
  const editBtn = document.getElementById("editRecipeBtn");

  if (deleteBtn) {
    deleteBtn.addEventListener("click", handleDeleteCurrentRecipe);
  }

  if (editBtn) {
    editBtn.addEventListener("click", openEditFormForCurrentRecipe);
  }
}

function renderTonightPick() {
  if (!recipes || !recipes.length) return;

  const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];

  const titleEl = document.querySelector(".preview-card h5");
  const summaryEl = document.querySelector(".preview-card p");
  const metaEl = document.querySelector(".preview-card .recipe-meta");
  const tagEl = document.querySelector(".preview-card .recipe-tags");

  if (titleEl) titleEl.textContent = randomRecipe.title;
  if (summaryEl) summaryEl.textContent = randomRecipe.summary || "A tasty pick!";

  if (metaEl) {
    metaEl.innerHTML = `
      <span><i class="bi bi-clock me-2"></i>${randomRecipe.time}</span>
      <span><i class="bi bi-graph-up me-2"></i>${randomRecipe.difficulty}</span>
    `;
  }

  if (tagEl) {
    tagEl.innerHTML = "";
    if (Array.isArray(randomRecipe.tags)) {
      randomRecipe.tags.slice(0, 3).forEach((tag) => {
        const span = document.createElement("span");
        span.className = "recipe-tag";
        span.textContent = tag;
        tagEl.appendChild(span);
      });
    }
  }
}


// === 16. Initialization ===
document.addEventListener("DOMContentLoaded", () => {
  loadRecipes();
  renderRecipes();
  renderTonightPick();
  setupFilters();
  setupImageUpload();
  setupDetailModalButtons();

  const recipeForm = document.getElementById("recipeForm");
  if (recipeForm) {
    recipeForm.addEventListener("submit", handleRecipeFormSubmit);
  }

  const shuffleBtn = document.getElementById("shuffleBtn");
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", shuffleRecipes);
  }

  const addBtn = document.querySelector('[data-bs-target="#recipeModal"]');
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      editingRecipeId = null;
      uploadedImage = "";
      const recipeForm = document.getElementById("recipeForm");
      if (recipeForm) recipeForm.reset();

      const titleEl = document.getElementById("recipeModalLabel");
      if (titleEl) titleEl.textContent = "Add a New Recipe";
    });
  }

  // Notification animations
  const style = document.createElement("style");
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
