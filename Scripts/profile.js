document.addEventListener("DOMContentLoaded", () => {
  
  /* ================= PROFILE PIC =================== */

  const picInput = document.getElementById("picInput");
  const profilePic = document.getElementById("profilePic");
  const changePicBtn = document.getElementById("changePicBtn");
  const DEFAULT_PIC = "/assets/default-user.png";

  // 1. Load saved or default picture on page load
  const savedPic = localStorage.getItem("pantryProfilePic");
  profilePic.src = savedPic || DEFAULT_PIC;

  // 2. Trigger file input when button is clicked
  changePicBtn.addEventListener("click", () => picInput.click());

  // 3. Handle file selection and save to localStorage
  picInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      profilePic.src = reader.result;
      // Save the image as a data URL
      localStorage.setItem("pantryProfilePic", reader.result);
    };
    reader.readAsDataURL(file);
  });


  /* ================= PROFILE FORM =================== */

  const DEFAULT_USERNAME = "PantryUser";

  const usernameInput = document.getElementById("usernameInput");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const profileForm = document.getElementById("profileForm");

  // 1. Load existing account info
  usernameInput.value = localStorage.getItem("pantryUsername") || DEFAULT_USERNAME;
  emailInput.value = localStorage.getItem("pantryEmail") || "";
  passwordInput.value = localStorage.getItem("pantryPassword") || ""; // Load password for UX, but see save section.

  // 2. Helper function for basic email validation (kept from previous version for robustness)
  function isValidEmail(email) {
      return /\S+@\S+\.\S+/.test(email);
  }

  // 3. Save profile info
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Basic validation check (similar to previous version)
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!username) {
        alert("Please enter a username.");
        return;
    }
    
    if (email && !isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Save profile data
    localStorage.setItem("pantryUsername", username);
    localStorage.setItem("pantryEmail", email);
    
    // WARNING: In a production app, do NOT store raw passwords. 
    // For this local environment, we'll store it only to ensure the input field loads the value next time.
    // If you prefer to NOT store it, comment out the line below.
    localStorage.setItem("pantryPassword", password); 
    
    alert("Profile saved successfully ✔");
  });


  /* ================ PASSWORD TOGGLE ================= */

  document.getElementById("togglePassword").addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
    } else {
      passwordInput.type = "password";
    }
  });


  /* ================ HOUSEHOLD MEMBERS ================= */

  const householdList = document.getElementById("householdList");
  const newMemberInput = document.getElementById("newMemberInput");
  const addMemberBtn = document.getElementById("addMemberBtn");

  // Load existing list or default ones
  let members = JSON.parse(localStorage.getItem("pantryHousehold")) || [
    "Ali Ahmed (Father)",
    "Fatima Ali (Mother)",
    "Sara Ali (Sister)",
    "Omar Ali (Brother)"
  ];

  function renderMembers() {
    householdList.innerHTML = "";
    members.forEach((m, index) => {
      householdList.innerHTML += `
        <li class="list-group-item d-flex justify-content-between">
          ${m}
          <button class="btn btn-sm btn-danger" onclick="removeMember(${index})">X</button>
        </li>`;
    });
  }

  // Expose removeMember globally for the onclick attribute
  window.removeMember = function(index) {
    members.splice(index, 1);
    localStorage.setItem("pantryHousehold", JSON.stringify(members));
    renderMembers();
  };
  
  // Initial render
  renderMembers();

  // Add new member
  addMemberBtn.addEventListener("click", () => {
    if (newMemberInput.value.trim() === "") return;
    members.push(newMemberInput.value.trim());
    localStorage.setItem("pantryHousehold", JSON.stringify(members));
    newMemberInput.value = "";
    renderMembers();
  });
});