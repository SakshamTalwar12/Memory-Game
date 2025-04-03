$(document).ready(function() {
    // Create particles
    for (let i = 0; i < 25; i++) {
        createParticle();
    }
    
    let selectedDifficulty = null;

    $('.difficulty-option').click(function() {
        $('.difficulty-option').removeClass('active');
        $(this).addClass('active');
        selectedDifficulty = $(this).data('difficulty');
        
        $('.start-button').addClass('active');
        $('.instruction-text').text('Click START to begin!').css('color', 'rgba(255, 255, 255, 0.9)');
        
        $('.letter').each(function(index) {
            $(this).css('animation', 'none');
            setTimeout(() => {
                $(this).css({
                    'animation': 'dropIn 0.4s forwards',
                    'animation-delay': index * 0.05 + 's'
                });
            }, 10);
        });
    });

    $('.start-button').click(function() {
        if (selectedDifficulty) {
            $(this).css('transform', 'scale(0.95)');

            // Send difficulty to backend via POST request
            $.post("/", { difficulty: selectedDifficulty }, function(response) {
                window.location.href = response.redirectUrl; // Redirect to game page
            }).fail(function() {
                alert("Error starting the game. Please try again.");
            });
        }
    });

    function createParticle() {
        const size = Math.random() * 8 + 2;
        const left = Math.random() * 100 + '%';
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 5;
        const opacity = Math.random() * 0.6 + 0.2;

        const $particle = $('<div class="particle"></div>');
        $particle.css({
            width: size + 'px',
            height: size + 'px',
            left: left,
            bottom: '-50px',
            opacity: opacity,
            animation: 'float ' + duration + 's linear infinite ' + delay + 's'
        });

        $('.particles').append($particle);
    }
});
