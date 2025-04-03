$(document).ready(function() {
    // Cache DOM selectors for better performance

    $(".back-btn").click(function() {
        window.location.href = "/";  // Redirect back to start.html
    });
    const $container = $(".container, .container1, .container2");
    const $card = $(".card");
    const $triesCounter = $("#tries");
    const $winlose = $(".winlose");
    
    // Game Settings
    const difficultySettings = {
        easy: { pairs: 3, tries: 4 },
        medium: { pairs: 4, tries: 4 },
        hard: { pairs: 5, tries: 4 }
    };

    // Detect which HTML file is loading this script
    let difficulty = 'medium'; // Default to medium
    
    // Get the current HTML filename
    const currentPage = window.location.pathname.split('/').pop();
    
    // Set difficulty based on the HTML file
    if (currentPage === 'easy.html') {
        difficulty = 'easy';
    } else if (currentPage === 'index.html' || currentPage === '') {
        difficulty = 'medium';
    } else if (currentPage === 'hard.html') {
        difficulty = 'hard';
    }
    
    console.log('Game difficulty set to:', difficulty);
    
    const { pairs, tries } = difficultySettings[difficulty];

    // Game state variables
    let triesLeft = tries;
    let flippedCards = [];
    let matchedPairs = 0;
    const totalPairs = pairs;
    let animationsCompleted = false;

    // Update tries display
    $triesCounter.text(triesLeft);

    // Set up page load animations for cards
    function setupEnhancedPageLoadAnimations() {
        // Use each with direct indexing for better performance
        const cardLength = $card.length;
        for (let i = 0; i < cardLength; i++) {
            $card.eq(i).css({
                'animation-delay': (1.2 + i * 0.2) + 's'
            });
        }
        
        // Calculate total animation time
        const letterCount = $(".letter-span").length;
        const totalAnimationTime = 1.2 + (cardLength * 0.2) + 1;
        
        // After animations complete, enable game interactions
        setTimeout(() => {
            animationsCompleted = true;
            // Optional: Add a subtle effect to show cards are now interactive
            $card.css('transition', 'transform 0.4s, opacity 0.4s');
        }, totalAnimationTime * 1000);
        
        // Optimize event handling by using event delegation
        $container.each(function() {
            const originalHandlers = $._data(this, "events");
            if (originalHandlers && originalHandlers.click) {
                const originalCardHandler = originalHandlers.click[0].handler;
                $(this).off("click", ".card");
                
                $(this).on("click", ".card", function(e) {
                    if (!animationsCompleted) return;
                    originalCardHandler.call(this, e);
                });
            } else {
                // If no handlers yet, we'll add our own later
                $(this).on("click", ".card", function(e) {
                    if (!animationsCompleted) return;
                    // Click handler will be attached later
                });
            }
        });
    }

    // Efficient confetti creation with requestAnimationFrame
    function createConfetti() {
        const confettiColors = ['#F3C623', '#FF00FF', '#00BFFF', '#9b297b', '#FF69B4'];
        const $body = $('body');
        let count = 0;
        
        function createSingleConfetti() {
            if (count >= 100) return;
            
            const confetti = $('<div class="confetti"></div>');
            const size = Math.random() * 15 + 5;
            const left = Math.random() * 100 + '%';
            const animationDuration = Math.random() * 4 + 2;
            const colorIndex = Math.floor(Math.random() * confettiColors.length);
            
            // Set all styles at once for better performance
            confetti.css({
                left: left,
                width: size + 'px',
                height: size + 'px',
                backgroundColor: confettiColors[colorIndex],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                animation: `confettiFall ${animationDuration}s linear forwards`
            });
            
            $body.append(confetti);
            
            // Remove confetti after animation completes
            setTimeout(() => confetti.remove(), animationDuration * 1000);
            
            count++;
            setTimeout(createSingleConfetti, 25); // Throttle creation for better performance
        }
        
        createSingleConfetti();
    }

    // Add Letter Animation to Title - optimize with direct indexing
    const $titleSpans = $("h1 span");
    const titleSpanLength = $titleSpans.length;
    
    for (let i = 0; i < titleSpanLength; i++) {
        $titleSpans.eq(i).css({
            'animation': 'dropIn 0.6s forwards',
            'animation-delay': i * 0.1 + 's'
        });
    }

    // Call the setup function
    setupEnhancedPageLoadAnimations();
    
    // Shuffle Cards - optimize array handling
    shuffleCards();

    // Card Click Handler - use event delegation for better performance
    $container.off("click", ".card").on("click", ".card", function() {
        // Don't process if card is already flipped or we already have 2 cards flipped
        if ($(this).hasClass("flipped") || flippedCards.length >= 2) return;
    
        $(this).addClass("flipped");
        flippedCards.push($(this));
    
        if (flippedCards.length === 2) {
            const card1 = flippedCards[0];
            const card2 = flippedCards[1];
    
            const img1 = card1.find(".card-back img").attr("src");
            const img2 = card2.find(".card-back img").attr("src");
    
            if (img1 === img2) {
                matchedPairs++;
    
                setTimeout(() => {
                    // Add matched animation - batch DOM operations
                    card1.addClass("matched matched-card");
                    card2.addClass("matched matched-card");
                    
                    flippedCards = [];
                    checkWin();
                }, 500);
            } else {
                setTimeout(() => {
                    // Add shake animation
                    card1.addClass("shake");
                    card2.addClass("shake");
                    
                    setTimeout(() => {
                        // Batch DOM operations
                        card1.removeClass("flipped shake");
                        card2.removeClass("flipped shake");
                        flippedCards = [];
                        triesLeft--;
                        
                        // Animate tries counter with class toggle
                        $triesCounter.addClass("tries-animate");
                        setTimeout(() => $triesCounter.removeClass("tries-animate"), 500);
                        
                        updateTriesDisplay();
                        checkGameOver();
                    }, 600);
                }, 1000);
            }
        }
    });
    
    // Function to Shuffle Cards - optimized Fisher-Yates
    function shuffleCards() {
        // Get all available cards as array for faster manipulation
        let allCards = $card.toArray();
        const numCards = totalPairs * 2;
        
        // Fisher-Yates shuffle is already efficient
        for (let i = allCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
        }
    
        // Select only the required number of pairs
        const selectedCards = allCards.slice(0, numCards);
    
        // Handle all containers uniformly - distribute cards if multiple containers are present
        const containersExist = {
            container: $(".container").length > 0,
            container1: $(".container1").length > 0,
            container2: $(".container2").length > 0
        };
        
        const activeContainers = Object.values(containersExist).filter(exists => exists).length;
        
        if (activeContainers > 1) {
            // Calculate how many cards per container
            const cardsPerContainer = Math.ceil(selectedCards.length / activeContainers);
            let currentIndex = 0;
            
            // Create fragments for each container
            const fragments = {
                container: document.createDocumentFragment(),
                container1: document.createDocumentFragment(),
                container2: document.createDocumentFragment()
            };
            
            // Distribute cards among containers
            if (containersExist.container) {
                const containerCards = selectedCards.slice(currentIndex, currentIndex + cardsPerContainer);
                containerCards.forEach(card => fragments.container.appendChild(card));
                currentIndex += cardsPerContainer;
                $(".container").empty()[0].appendChild(fragments.container);
            }
            
            if (containersExist.container1) {
                const container1Cards = selectedCards.slice(currentIndex, currentIndex + cardsPerContainer);
                container1Cards.forEach(card => fragments.container1.appendChild(card));
                currentIndex += cardsPerContainer;
                $(".container1").empty()[0].appendChild(fragments.container1);
            }
            
            if (containersExist.container2) {
                const container2Cards = selectedCards.slice(currentIndex, currentIndex + cardsPerContainer);
                container2Cards.forEach(card => fragments.container2.appendChild(card));
                $(".container2").empty()[0].appendChild(fragments.container2);
            }
        } else {
            // If only one container exists, put all cards there
            let containerSelector = ".container";
            if (containersExist.container1) containerSelector = ".container1";
            if (containersExist.container2) containerSelector = ".container2";
            
            const fragment = document.createDocumentFragment();
            selectedCards.forEach(card => fragment.appendChild(card));
            $(containerSelector).empty()[0].appendChild(fragment);
        }
    
        // Hide all cards at once, then fade in
        $(".card").hide().fadeIn(500);
    }
    
    // Function to Update Tries Display - simple text update
    function updateTriesDisplay() {
        $triesCounter.text(triesLeft);
    }

    // Check if Player Loses - batched animations
    function checkGameOver() {
        updateTriesDisplay();
        if (triesLeft <= 0) {
            setTimeout(() => {
                $card.css({ 
                    transition: "opacity 0.8s ease", 
                    opacity: "0", 
                    visibility: "hidden" 
                });
            }, 500);

            setTimeout(() => {
                $winlose.css({ 
                    opacity: "1", 
                    visibility: "visible" 
                });
                
                // Initialize Typed.js just once
                new Typed('.typed', {
                    strings: ["Game Over! You Lose."],
                    typeSpeed: 60,
                    backSpeed: 60,
                    loop: false
                });

                setTimeout(() => {
                    if (confirm("Do you want to play again?")) {
                        location.reload();
                    }
                }, 4000);
            }, 1000);
        }
    }

    // Check if Player Wins - optimized animations
    function checkWin() {
        if (matchedPairs === totalPairs) {
            createConfetti();

            setTimeout(() => {
                $card.css({ 
                    transition: "opacity 0.5s ease", 
                    opacity: "0", 
                    visibility: "hidden" 
                });
            }, 500);

            setTimeout(() => {
                $winlose.addClass("visible");
                
                // Initialize Typed.js just once
                new Typed('.typed', {
                    strings: ["Congratulations! You Win!"],
                    typeSpeed: 60,
                    backSpeed: 60,
                    loop: false
                });

                setTimeout(() => {
                    if (confirm("Do you want to play again?")) {
                        location.reload();
                    }
                }, 4000);
            }, 500);
        }
    }

    // Floating Particles - optimize by creating in batches
    const $particles = $('.particles');
    
    function createParticles(count = 1) {
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < count; i++) {
            const size = Math.random() * 8 + 2;
            const left = Math.random() * 100 + '%';
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 5;
            const opacity = Math.random() * 0.6 + 0.2;

            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Set all styles at once
            Object.assign(particle.style, {
                width: size + 'px',
                height: size + 'px',
                left: left,
                bottom: '-50px',
                opacity: opacity.toString(),
                animation: `float ${duration}s linear infinite ${delay}s`
            });

            fragment.appendChild(particle);
            
            // Use more efficient setTimeout with function reference
            setTimeout(function() {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, (duration + delay) * 1000);
        }
        
        $particles[0].appendChild(fragment);
    }

    // Create particles in small batches for better performance
    setInterval(() => createParticles(3), 1000);
    
    // Initial particles
    createParticles(10);
});