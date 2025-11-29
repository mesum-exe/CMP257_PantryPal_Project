const API_ENDPOINT = 'http://localhost:8080/PantryPal/api/recipes';
let recipes = []; 
let uploadedImage = "";
let favoriteIds = new Set(); 
let showFavoritesOnly = false;

let editingRecipeId = null; 
const modalTitle = document.getElementById('recipeModalLabel'); 
const submitBtn = document.querySelector('button[form="recipeForm"]'); 

async function fetchRecipes() {
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error('Network response was not ok');
        recipes = await response.json();
        filterRecipes(); 
        updateTonightsPick();
    } catch (error) {
        console.error("Error fetching recipes:", error);
        const list = document.getElementById('recipesList');
        if(list) list.innerHTML = '<p class="text-danger text-center w-100">Failed to load recipes from server.</p>';
    }
}

function renderRecipes(recipesToRender) {
   const recipesList = document.getElementById('recipesList');
   const emptyState = document.getElementById('emptyState');
   const countLabel = document.getElementById('total-recipes-count');
   
   if (!recipesList) return;
   recipesList.innerHTML = '';
   
   const count = recipesToRender ? recipesToRender.length : 0;
   if(countLabel) countLabel.textContent = `${recipes.length} recipes`;

   if (!recipesToRender || recipesToRender.length === 0) {
       if (emptyState) {
           emptyState.classList.remove('d-none');
           emptyState.textContent = showFavoritesOnly ? "No favorite recipes found." : "Nothing saved yet. Add your first recipe to see it here.";
       }
       return;
   }
   
   if (emptyState) emptyState.classList.add('d-none');
   
   recipesToRender.forEach((recipe) => {
       const originalIndex = recipes.indexOf(recipe);
       const isFav = favoriteIds.has(originalIndex); 
       
       const col = document.createElement('div');
       col.className = 'col fade-in'; 
       
       const card = document.createElement('div');
       card.className = 'recipe-card h-100';

       if (recipe.image) {
           const img = document.createElement('img');
           img.className = 'recipe-image';
           img.src = recipe.image;
           img.alt = recipe.title;
           img.onerror = function() { this.style.display='none'; };
           card.appendChild(img);
       }
       
       const meta = document.createElement('div');
       meta.className = 'recipe-meta';
       meta.innerHTML = `
           <span><i class="bi bi-clock me-1"></i>${recipe.time || '30 mins'}</span>
           <span><i class="bi bi-graph-up me-1"></i>${recipe.difficulty || 'Medium'}</span>
       `;
       
       const title = document.createElement('h4');
       title.textContent = recipe.title;
       
       const summary = document.createElement('p');
       summary.textContent = recipe.summary;
       
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
       
       const heartClass = isFav ? 'bi-heart-fill text-danger' : 'bi-heart';
       const btnStyle = isFav ? 'color: #dc3545;' : '';

       const actions = document.createElement('div');
       actions.className = 'card-actions mt-auto d-flex justify-content-between align-items-center';
       actions.innerHTML = `
           <button class="btn-inline" onclick="showRecipeDetails(${originalIndex})">View details</button>
           <div class="d-flex align-items-center gap-2">
               <button class="btn-inline" style="${btnStyle}" onclick="toggleHeart(this, ${originalIndex})">
                   <i class="bi ${heartClass} me-1"></i>Favorite
               </button>
               <button class="btn btn-danger btn-sm" onclick="deleteRecipe(${recipe.id})">
                   <i class="bi bi-trash"></i>
               </button>
           </div>
       `;
       
       card.appendChild(meta);
       card.appendChild(title);
       card.appendChild(summary);
       card.appendChild(tagsContainer);
       card.appendChild(actions);
       col.appendChild(card);
       recipesList.appendChild(col);
   });
}

function filterRecipes() {
    const searchText = document.getElementById('searchRecipes').value.toLowerCase();
    const timeFilter = document.getElementById('filterTime').value;
    const tagFilter = document.getElementById('filterTag').value;

    const filtered = recipes.filter((recipe, index) => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchText) || 
                              (recipe.ingredients && recipe.ingredients.some(i => i.toLowerCase().includes(searchText)));

        let matchesTime = true;
        if (timeFilter !== 'all') {
            const timeVal = parseInt(recipe.time) || 0; 
            if (timeFilter === 'long') matchesTime = timeVal > 45;
            else matchesTime = timeVal <= parseInt(timeFilter);
        }

        let matchesTag = true;
        if (tagFilter !== 'all') {
            matchesTag = recipe.tags && recipe.tags.includes(tagFilter);
        }

        let matchesFav = true;
        if (showFavoritesOnly) {
            matchesFav = favoriteIds.has(index);
        }

        return matchesSearch && matchesTime && matchesTag && matchesFav;
    });

    renderRecipes(filtered);
}

function updateTonightsPick() {
   const card = document.getElementById('tonights-pick');
   
   if (!card || !recipes || recipes.length === 0) {
       if(card) card.innerHTML = `
           <div class="d-flex justify-content-between align-items-center mb-3">
               <h5 class="mb-0">Tonight's pick</h5>
               <span class="pill">Suggestion</span>
           </div>
           <p class="text-white">Add some recipes to your library to see a suggestion here!</p>
       `;
       return;
   }

   const randomIndex = Math.floor(Math.random() * recipes.length);
   const r = recipes[randomIndex];

   const tagsHTML = (r.tags || []).slice(0, 2).map(tag => 
       `<span class="recipe-tag">${tag}</span>`
   ).join('');

   card.innerHTML = `
       <div class="d-flex justify-content-between align-items-center mb-3">
           <h5 class="mb-0">Tonight's pick</h5>
           <span class="pill">Chef-crafted</span>
       </div>
       
       <h3 class="mb-2 text-white" style="cursor: pointer;" onclick="showRecipeDetails(${randomIndex})">
           ${r.title}
       </h3>
       
       <p class="mb-3 text-white-50">${r.summary || ''}</p>
       
       <div class="recipe-meta mb-2 text-white">
           <span><i class="bi bi-clock me-2"></i>${r.time || '30 mins'}</span>
           <span><i class="bi bi-graph-up me-2"></i>${r.difficulty || 'Medium'}</span>
       </div>
       
       <div class="recipe-tags mb-3">
           ${tagsHTML}
       </div>
       
       <div class="d-flex justify-content-between align-items-center mt-auto">
           <small class="text-light opacity-75">Serving suggestion.</small>
           <button class="btn btn-sm btn-light text-dark fw-bold" onclick="showRecipeDetails(${randomIndex})">View</button>
       </div>
   `;
}

window.showRecipeDetails = function(index) {
   const recipe = recipes[index];
   if (!recipe) return;

   const imageHTML = recipe.image
       ? `<img src="${recipe.image}" alt="${recipe.title}" class="img-fluid rounded mb-3" style="max-height:300px; width:100%; object-fit:cover;">`
       : "";
   
   const modalHTML = `
       <div class="modal fade" id="recipeDetailModal" tabindex="-1" aria-hidden="true">
           <div class="modal-dialog modal-lg modal-dialog-centered">
               <div class="modal-content">
                   <div class="modal-header">
                       <h5 class="modal-title">${recipe.title}</h5>
                       <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                   </div>
                   <div class="modal-body">
                       ${imageHTML}
                       <div class="d-flex gap-3 mb-3 text-muted">
                           <span><i class="bi bi-clock me-1"></i>${recipe.time}</span>
                           <span><i class="bi bi-graph-up me-1"></i>${recipe.difficulty}</span>
                       </div>
                       <p class="mb-4">${recipe.summary}</p>
                       
                       <h6 class="fw-bold mb-2">Ingredients:</h6>
                       <ul class="mb-4 list-group list-group-flush">
                           ${(recipe.ingredients || []).map(ing => `<li class="list-group-item ps-0 border-0"><i class="bi bi-dot"></i> ${ing}</li>`).join('')}
                       </ul>
                       
                       <h6 class="fw-bold mb-2">Instructions:</h6>
                       <ol class="list-group list-group-numbered list-group-flush">
                           ${(recipe.instructions || []).map(inst => `<li class="list-group-item ps-0 border-0">${inst}</li>`).join('')}
                       </ol>
                   </div>
                   <div class="modal-footer">
                       <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                       <button type="button" class="btn btn-warning" onclick="openEditModal(${index})">Edit Recipe</button>
                   </div>
               </div>
           </div>
       </div>
   `;
   
   const existing = document.getElementById('recipeDetailModal');
   if (existing) existing.remove();
   
   document.body.insertAdjacentHTML('beforeend', modalHTML);
   const modal = new bootstrap.Modal(document.getElementById('recipeDetailModal'));
   modal.show();
};

window.openEditModal = function(index) {
    const recipe = recipes[index];
    if (!recipe) return;
    
    const detailModalEl = document.getElementById('recipeDetailModal');
    const detailModal = bootstrap.Modal.getInstance(detailModalEl);
    if(detailModal) detailModal.hide();

    editingRecipeId = recipe.id;
    
    document.getElementById('recipe-name').value = recipe.title;
    
    const timeNum = parseInt(recipe.time) || 30;
    document.getElementById('recipe-time').value = timeNum;
    
    document.getElementById('recipe-difficulty').value = recipe.difficulty;
    document.getElementById('ingredients').value = (recipe.ingredients || []).join('\n');
    document.getElementById('instructions').value = (recipe.instructions || []).join('\n');
    
    const tags = recipe.tags || [];
    document.querySelectorAll('.tag-chip input').forEach(cb => {
        cb.checked = tags.includes(cb.value);
    });
    
    uploadedImage = recipe.image || "";

    if(modalTitle) modalTitle.textContent = "Edit Recipe";
    
    const btn = document.querySelector('button[form="recipeForm"]');
    if(btn) {
        btn.textContent = "Update Recipe";
        btn.classList.add('btn-warning');
    }

    const formModal = new bootstrap.Modal(document.getElementById('recipeModal'));
    formModal.show();
    
    document.getElementById('recipeModal').addEventListener('hidden.bs.modal', () => {
        resetFormState();
    });
}

function resetFormState() {
    editingRecipeId = null;
    document.getElementById('recipeForm').reset();
    uploadedImage = "";
    if(modalTitle) modalTitle.textContent = "Add a New Recipe";
    
    const btn = document.querySelector('button[form="recipeForm"]');
    if(btn) {
        btn.textContent = "Save recipe";
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-hero');
    }
    
    document.querySelectorAll('.tag-chip input').forEach(cb => cb.checked = false);
}

window.deleteRecipe = async function(id) {
    if(!confirm("Are you sure you want to delete this recipe?")) return;

    try {
        const response = await fetch(`${API_ENDPOINT}?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Recipe deleted.");
            const el = document.getElementById('recipeDetailModal');
            if (el) {
                const modal = bootstrap.Modal.getInstance(el);
                if(modal) modal.hide();
            }
            
            fetchRecipes(); 
        } else {
            alert("Failed to delete recipe.");
        }
    } catch (error) {
        console.error("Delete Error:", error);
    }
}

window.toggleHeart = function(btn, index) {
    const icon = btn.querySelector('i');
    
    if (favoriteIds.has(index)) {
        favoriteIds.delete(index);
        icon.classList.replace('bi-heart-fill', 'bi-heart');
        icon.classList.remove('text-danger');
        btn.style.color = 'inherit';
    } else {
        favoriteIds.add(index);
        icon.classList.replace('bi-heart', 'bi-heart-fill');
        icon.classList.add('text-danger');
        btn.style.color = '#dc3545';
    }

    if (showFavoritesOnly) filterRecipes();
}

document.addEventListener('DOMContentLoaded', function() {
    fetchRecipes();

    const searchInput = document.getElementById('searchRecipes');
    const timeFilter = document.getElementById('filterTime');
    const tagFilter = document.getElementById('filterTag');
    const favBtn = document.getElementById('filterFavorite');

    if(searchInput) searchInput.addEventListener('keyup', filterRecipes);
    if(timeFilter) timeFilter.addEventListener('change', filterRecipes);
    if(tagFilter) tagFilter.addEventListener('change', filterRecipes);

    if (favBtn) {
        favBtn.addEventListener('click', function() {
            showFavoritesOnly = !showFavoritesOnly;
            if (showFavoritesOnly) {
                this.classList.replace('btn-outline-secondary', 'btn-danger');
                this.innerHTML = '<i class="bi bi-heart-fill me-1"></i> Showing Favorites';
            } else {
                this.classList.replace('btn-danger', 'btn-outline-secondary');
                this.innerHTML = '<i class="bi bi-heart me-1"></i> Favorites only';
            }
            filterRecipes();
        });
    }

    const imageInput = document.getElementById('recipe-image');
    if (imageInput) {
        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => { uploadedImage = reader.result; };
            reader.readAsDataURL(file);
        });
    }

    const form = document.getElementById('recipeForm');
    if(form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('recipe-name').value.trim();
            const ingredientsText = document.getElementById('ingredients').value.trim();
            const instructionsText = document.getElementById('instructions').value.trim();
            const timeVal = document.getElementById('recipe-time').value + " mins";
            const diffVal = document.getElementById('recipe-difficulty').value || "Medium";
            
            const selectedTags = [];
            document.querySelectorAll('.tag-chip input:checked').forEach(checkbox => {
                selectedTags.push(checkbox.value);
            });
            
            const recipeData = {
                title: name,
                time: timeVal, 
                difficulty: diffVal,
                tags: selectedTags,
                summary: ingredientsText.substring(0, 50) + "...", 
                ingredients: ingredientsText.split('\n').filter(line => line.trim()),
                instructions: instructionsText.split('\n').filter(line => line.trim()),
                image: uploadedImage 
            };
            
            try {
                let url = API_ENDPOINT;
                let method = 'POST';

                if (editingRecipeId) {
                    url += `?id=${editingRecipeId}`;
                    method = 'PUT';
                }

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(recipeData)
                });

                if (response.ok) {
                    alert(editingRecipeId ? 'Recipe updated!' : 'Recipe added!');
                    
                    const modalEl = document.getElementById('recipeModal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if(modal) modal.hide(); 

                    fetchRecipes(); 
                } else {
                    alert('Failed to save recipe');
                }
            } catch (error) {
                console.error("Error saving:", error);
            }
        });
    }

    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            for (let i = recipes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [recipes[i], recipes[j]] = [recipes[j], recipes[i]];
            }
            renderRecipes(recipes); 
        });
    }
    
    const recipeModal = document.getElementById('recipeModal');
    if(recipeModal) {
        recipeModal.addEventListener('hidden.bs.modal', resetFormState);
    }
});