// Wait for the document to be ready before running scripts
$(document).ready(function() {
    
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

// Dark mode toggle 
function setupDarkMode() {
    $('#darkModeToggle').on('click', function() {
        $('body').toggleClass('dark-mode');
        
        // Change the icon from moon to sun based on the mode
        let icon = $(this).find('i');
        if ($('body').hasClass('dark-mode')) {
            icon.removeClass('fa-moon').addClass('fa-sun');
        } else {
            icon.removeClass('fa-sun').addClass('fa-moon');
        }
    });
}

// Nav Bar Active State Logic (Spy)
function highlightActivePage() {
    // 1. Get the current filename from the URL (e.g., "tasks.html")
    let currentPath = window.location.pathname;
    let currentPage = currentPath.split("/").pop();
    
    // Default to index.html if we are at the root domain
    if (currentPage === "") {
        currentPage = "index.html";
    }

    // 2. Loop through all nav links and add the active class to the matching one
    $('.nav-link').each(function() {
        if ($(this).attr('href') === currentPage) {
            $(this).addClass('active');
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