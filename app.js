//This file contains all the code for header , footer , dark mode implemetaion + browser memory for all pages , along with a sxroll to top logic for the footer

// Wait for the document to be ready before running scripts
$(document).ready(function() {
    
    if (localStorage.getItem('darkMode') === 'enabled') {
        $('body').addClass('dark-mode');
    }
    // Load Header and trigger setup functions afterward
    $("#header-placeholder").load("components/header.html", function() {
        setupDarkMode();
        highlightActivePage(); // Highlights the current page in the Nav
    });

    // Load Footer and trigger setup functions afterward
    $("#footer-placeholder").load("components/footer.html", function() {
        setupScrollToTop(); // Attaches click event to the footer title
    });

});

// Dark mode toggle & Browser Memory Logic
function setupDarkMode() {
    let toggleBtn = $('#darkModeToggle');
    let icon = toggleBtn.find('i');

    // 1. Set the correct icon on page load based on current mode
    if ($('body').hasClass('dark-mode')) {
        icon.removeClass('fa-moon').addClass('fa-sun');
    } else {
        icon.removeClass('fa-sun').addClass('fa-moon');
    }

    // 2. Handle the click event (Using .off() to prevent duplicate clicks)
    toggleBtn.off('click').on('click', function() {
        $('body').toggleClass('dark-mode');
        
        // Change icon and save preference to browser memory
        if ($('body').hasClass('dark-mode')) {
            icon.removeClass('fa-moon').addClass('fa-sun');
            localStorage.setItem('darkMode', 'enabled'); 
        } else {
            icon.removeClass('fa-sun').addClass('fa-moon');
            localStorage.setItem('darkMode', 'disabled'); 
        }
    });
}

// Nav Bar Active State Logic (Spy)
function highlightActivePage() {
    // Extract the current filename from the URL
    let path = window.location.pathname;
    let page = path.split("/").pop();
    
    // Default to index.html if at the root domain
    if (page === "") {
        page = "index.html";
    }

    // Compare each nav link's href to the current page
    $('.navbar-nav .nav-link').each(function() {
        let href = $(this).attr('href');
        
        if (href === page) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });
}
// Scroll to Top Logic
function setupScrollToTop() {
    // Listen for a click on the class we added to the footer title
    $('.scroll-to-top').on('click', function(event) {
        event.preventDefault(); // Stop the link from snapping the page abruptly
        
        // Scroll the window smoothly back to 0px
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}