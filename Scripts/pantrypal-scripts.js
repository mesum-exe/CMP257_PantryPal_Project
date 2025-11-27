//  AUTH PAGES 

// Login Form Validation
function initLoginForm() {
  const loginForm = document.querySelector('#loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!validateEmail(email)) {
      showAlert('Please enter a valid email address', 'danger');
      return;
    }
    
    if (password.length < 6) {
      showAlert('Password must be at least 6 characters', 'danger');
      return;
    }
    
    // Simulate login
    showAlert('Logging in...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  });
}

// Create Account Form Validation
function initSignupForm() {
  const signupForm = document.querySelector('#signupForm');
  if (!signupForm) return;

  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('nameInput').value;
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    
    if (name.trim().length < 2) {
      showAlert('Please enter your full name', 'danger');
      return;
    }
    
    if (!validateEmail(email)) {
      showAlert('Please enter a valid email address', 'danger');
      return;
    }
    
    if (password.length < 6) {
      showAlert('Password must be at least 6 characters', 'danger');
      return;
    }
    
    if (password !== confirmPassword) {
      showAlert('Passwords do not match', 'danger');
      return;
    }
    
    // Simulate account creation
    showAlert('Creating your account...', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  });
}

// Forgot Password Form
function initForgotPasswordForm() {
  const forgotForm = document.querySelector('#forgotPasswordForm');
  if (!forgotForm) return;

  forgotForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    
    if (!validateEmail(email)) {
      showAlert('Please enter a valid email address', 'danger');
      return;
    }
    
    showAlert('Reset link sent to your email!', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  });
}

// Email Validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show Alert
function showAlert(message, type) {
  // Remove existing alerts
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) existingAlert.remove();
  
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} custom-alert`;
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    animation: slideInRight 0.3s ease;
  `;
  alertDiv.textContent = message;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .custom-alert {
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    font-weight: 600;
  }
`;
document.head.appendChild(style);

// ========== RECIPES PAGE ==========

// Generate Recipes
function initGenerateRecipes() {
  const generateBtn = document.querySelector('.btn-generate, button[type="submit"]');
  if (!generateBtn) return;
  
  // Only attach to generate button, not all submit buttons
  if (generateBtn.textContent.includes('Generate')) {
    generateBtn.addEventListener('click', function(e) {
      e.preventDefault();
      generateRecipes();
    });
  }
}

function generateRecipes() {
  const button = event.target;
  const originalText = button.textContent;
  
  button.disabled = true;
  button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
  
  // Simulate API call
  setTimeout(() => {
    button.disabled = false;
    button.textContent = originalText;
    showAlert('3 new recipes generated based on your inventory!', 'success');
    
    // Scroll to recipes section
    document.querySelector('.recipe-card')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }, 2000);
}

// Add Recipe Form
function initRecipeForm() {
  const recipeForm = document.querySelector('#recipeForm');
  if (!recipeForm) return;

  recipeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const recipeName = document.getElementById('recipe-name').value;
    const ingredients = document.getElementById('ingredients').value;
    const instructions = document.getElementById('instructions').value;
    
    if (!recipeName.trim()) {
      showAlert('Please enter a recipe name', 'danger');
      return;
    }
    
    if (!ingredients.trim()) {
      showAlert('Please list the ingredients', 'danger');
      return;
    }
    
    if (!instructions.trim()) {
      showAlert('Please provide cooking instructions', 'danger');
      return;
    }
    
    // Get selected tags
    const tags = [];
    document.querySelectorAll('.form-check-input:checked').forEach(checkbox => {
      tags.push(checkbox.value);
    });
    
    // Simulate saving recipe
    const button = this.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    
    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
      showAlert('Recipe saved successfully!', 'success');
      this.reset();
    }, 1000);
  });
}

// View Recipe Details
function initRecipeCards() {
  const recipeButtons = document.querySelectorAll('.recipe-card button');
  
  recipeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const recipeName = this.closest('.recipe-card').querySelector('h4').textContent;
      viewRecipeDetails(recipeName);
    });
  });
}

function viewRecipeDetails(recipeName) {
  // Create modal dynamically
  const modalHTML = `
    <div class="modal fade" id="recipeModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 20px; border: none;">
          <div class="modal-header" style="background: linear-gradient(135deg, #bae673 0%, #a8d65e 100%); border: none;">
            <h5 class="modal-title fw-bold">${recipeName}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
            <h6 class="fw-bold mb-3">Ingredients:</h6>
            <ul class="mb-4">
              <li>Sample ingredient 1</li>
              <li>Sample ingredient 2</li>
              <li>Sample ingredient 3</li>
            </ul>
            
            <h6 class="fw-bold mb-3">Instructions:</h6>
            <ol>
              <li class="mb-2">Step 1: Prepare ingredients</li>
              <li class="mb-2">Step 2: Cook according to directions</li>
              <li class="mb-2">Step 3: Serve and enjoy!</li>
            </ol>
            
            <div class="mt-4 p-3" style="background: #f5f5f0; border-radius: 12px;">
              <small class="text-muted">
                <strong>Cooking Time:</strong> 30 mins | 
                <strong>Servings:</strong> 4 | 
                <strong>Difficulty:</strong> Easy
              </small>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-success">Add to Favorites</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.getElementById('recipeModal');
  if (existingModal) existingModal.remove();
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
  modal.show();
}

//  DASHBOARD ANIMATIONS 

// Animate cards on scroll
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe all cards
  document.querySelectorAll('.recipe-card, .mission-card, .step-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ========== INITIALIZE ALL ==========

document.addEventListener('DOMContentLoaded', function() {
  // Auth pages
  initLoginForm();
  initSignupForm();
  initForgotPasswordForm();
  
  // Recipes page
  initGenerateRecipes();
  initRecipeForm();
  initRecipeCards();
  
  // General
  initScrollAnimations();
  initSmoothScroll();
  
  console.log('PantryPal initialized successfully! 🥘');
});