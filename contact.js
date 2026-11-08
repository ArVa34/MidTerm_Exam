$(document).ready(function() {
    
    // Initialize EmailJS 
    emailjs.init("jMgm-o1JephX2xERg"); 

    $('#contactForm').on('submit', function(event) {
        event.preventDefault();
        
        let isValid = true;
        let form = $(this);
        let rawFormElement = this; // Securely grab the exact HTML form for EmailJS
        
        // jQuery validation: check if inputs are empty
        form.find('input, textarea').each(function() {
            if ($(this).val().trim() === '') {
                $(this).addClass('is-invalid');
                isValid = false;
            } else {
                $(this).removeClass('is-invalid').addClass('is-valid');
            }
        });

        // Email specific validation 
        let emailField = $('#userEmail');
        let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(emailField.val())) {
            emailField.addClass('is-invalid').removeClass('is-valid');
            isValid = false;
        }

        // If validation passes, process the email
        if (isValid) {
            let userName = $('#userName').val();
            let submitBtn = $('#submitBtn');
            let originalBtnHtml = submitBtn.html();

            // Show loading UI on the button
            submitBtn.html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...');
            submitBtn.prop('disabled', true);

            // Real EmailJS Send Function using your keys
            emailjs.sendForm('service_s4eauc7', 'template_v2i0sud', rawFormElement)
                .then(function() {
                    try {
                        showSuccessModal(userName, form, submitBtn, originalBtnHtml);
                    } catch(err) {
                        // Failsafe in case Bootstrap glitches, so the screen never freezes
                        console.error("Modal UI Error:", err);
                        alert("Transmission Sent Successfully! (Verification email dispatched)");
                        form[0].reset();
                        submitBtn.html(originalBtnHtml).prop('disabled', false);
                    }
                }, function(error) {
                    console.log('FAILED...', error);
                    alert("System Error: Could not send transmission.");
                    submitBtn.html(originalBtnHtml).prop('disabled', false);
                });
        }
    });

    // Remove the red error state as soon as the user starts typing
    $('input, textarea').on('input', function() {
        $(this).removeClass('is-invalid');
    });

    // Helper function to trigger the modal.
    function showSuccessModal(userName, form, submitBtn, originalBtnHtml) {
        // Set custom success text
        $('#modalConfirmationText').text(`Thank you, ${userName}! Your message was securely transmitted and a verification email has been sent to your inbox.`);
        
        // Trigger the Bootstrap modal safely using getOrCreateInstance to prevent frozen backdrops
        const modalElement = document.querySelector('#successModal');
        let successModal = bootstrap.Modal.getOrCreateInstance(modalElement);
        successModal.show();
        
        // Reset the form, classes, and button state
        form[0].reset();
        form.find('input, textarea').removeClass('is-valid is-invalid');
        submitBtn.html(originalBtnHtml).prop('disabled', false);
    }
});