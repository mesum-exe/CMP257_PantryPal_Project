// Work In Progress Logic: Currently Nonfunctional

// Used for loading the Navbar onto every page without needing to copy and paste it.
fetch('navbar.html')
    .then(response => response.text())  // converts navbar.html into only HTML text
    .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;
    });

// Used for loading the Footer onto every page without needing to copy and paste it.
fetch('footer.html')
    .then(response => response.text())  // converts footer.html into only HTML text
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    });
