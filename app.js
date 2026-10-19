// Wait for the document to be ready before running scripts
$(document).ready(function() {
        $("#header-placeholder").load("components/header.html", function() {
        setupDarkMode();
    });

    $("#footer-placeholder").load("components/footer.html");

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
