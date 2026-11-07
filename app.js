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
function setupDarkMode() {
    let toggleBtn = $('#darkModeToggle');
    let icon = toggleBtn.find('i');

    // 1. Set the correct icon on page load based on current mode
    if ($('body').hasClass('dark-mode')) {
        icon.removeClass('fa-moon').addClass('fa-sun');
    } else {
        icon.removeClass('fa-sun').addClass('fa-moon');
    }

    // 2. Handle the click event
    toggleBtn.on('click', function() {
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