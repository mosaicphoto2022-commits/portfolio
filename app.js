document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ==========================================================================
    // THEME SWITCHER (LIGHT / DARK MODE)
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const bodyElement = document.body;

    // Check system preference or localStorage
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        bodyElement.classList.add('dark-theme');
        bodyElement.classList.remove('light-theme');
    } else {
        bodyElement.classList.add('light-theme');
        bodyElement.classList.remove('dark-theme');
    }

    themeToggleBtn.addEventListener('click', () => {
        if (bodyElement.classList.contains('dark-theme')) {
            bodyElement.classList.remove('dark-theme');
            bodyElement.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            bodyElement.classList.remove('light-theme');
            bodyElement.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    });

    // ==========================================================================
    // SCROLLING EFFECTS & ACTIVE NAVIGATION LINKS
    // ==========================================================================
    const siteHeader = document.getElementById('site-header');
    
    // Header shadow on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }
    });

    // Highlight active section link on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');

    const scrollActive = () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                }
            }
        });
    };
    window.addEventListener('scroll', scrollActive);

    // ==========================================================================
    // MOBILE MENU (DRAWER) CONTROL
    // ==========================================================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    const openDrawer = () => {
        mobileDrawer.classList.add('open');
    };

    const closeDrawer = () => {
        mobileDrawer.classList.remove('open');
    };

    mobileMenuBtn.addEventListener('click', openDrawer);
    closeDrawerBtn.addEventListener('click', closeDrawer);

    // Close drawer when clicking nav links
    drawerLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    // ==========================================================================
    // PORTFOLIO FILTERING SYSTEM
    // ==========================================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const projectCategory = card.getAttribute('data-category');

                if (filterValue === 'all' || filterValue === projectCategory) {
                    // Show animation
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    // Hide animation
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ==========================================================================
    // INTERSECTION OBSERVER FOR SCROLL REVEAL ANIMATIONS
    // ==========================================================================
    const revealElements = document.querySelectorAll('.fade-in-up');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Unobserve after showing
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================================================
    // CONTACT FORM INTERACTIVE SUCCESS POPUP
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const formSuccessOverlay = document.getElementById('form-success-overlay');
    const closeSuccessBtn = document.getElementById('btn-close-success');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page reload

        // In a real website, you would send data to server using fetch()
        // Here we simulate successful submission with modern overlay animation
        formSuccessOverlay.classList.add('show');
    });

    closeSuccessBtn.addEventListener('click', () => {
        formSuccessOverlay.classList.remove('show');
        contactForm.reset(); // Clear the form input values
    });

    // ==========================================================================
    // HAMSTER MASCOT INTERACTIVE BEHAVIOR
    // ==========================================================================
    const hamsterPet = document.getElementById('hamster-pet');
    const hamsterBubble = document.getElementById('hamster-bubble');

    const hamsterQuotes = [
        "Chít chít! Chào mừng bạn ghé thăm trang web của Hạnh Chi nhé! 🐹",
        "Bạn có biết Hạnh Chi rất thích tự tay làm bánh donut không? 🍩",
        "Hạnh Chi hiện đang học tại trường THCS Tân Định đó! 📚",
        "Hạnh Chi tập võ Karatedo đai vàng siêu ngầu luôn! 🥋",
        "Nhấp chuột vào tớ để xem tớ nhảy lò cò chào bạn nè! 💨",
        "Chúc bạn một ngày mới thật nhiều niềm vui và học tập tốt nhé! 🌟",
        "Bạn có thể gửi lời nhắn cho Hạnh Chi ở mục Liên hệ cuối trang nha! 📝",
        "Hôm nay bạn thấy thế nào? Hãy luôn nở một nụ cười thật tươi nhé! 😊",
        "Làm bánh cần sự kiên nhẫn, giống như khi tụi mình học tập vậy đó! 🍰",
        "Trong môn võ Karatedo, sự lễ phép và tôn trọng luôn đi đầu tiên đó! 🥋",
        "Hạnh Chi rất thích kết bạn mới, đừng ngần ngại gửi thư làm quen nha! 🤝",
        "Hôm nay bạn đã ăn bánh donut chưa? Nếu chưa hãy ăn một cái cho ngọt ngào nhé! 🍩",
        "Chít chít! Cảm ơn bạn rất nhiều vì đã ghé thăm góc nhỏ của Hạnh Chi! ❤️"
    ];

    let bubbleTimeout;

    // Show initial welcome after 3 seconds
    setTimeout(() => {
        if (hamsterBubble) {
            hamsterBubble.classList.add('show');
            bubbleTimeout = setTimeout(() => {
                hamsterBubble.classList.remove('show');
            }, 4000);
        }
    }, 3000);

    if (hamsterPet) {
        hamsterPet.addEventListener('click', () => {
            // Jump animation
            hamsterPet.classList.add('jump');
            setTimeout(() => {
                hamsterPet.classList.remove('jump');
            }, 500);

            // Pick a random quote
            const randomIndex = Math.floor(Math.random() * hamsterQuotes.length);
            if (hamsterBubble) {
                hamsterBubble.innerText = hamsterQuotes[randomIndex];

                // Clear existing bubble timeouts
                clearTimeout(bubbleTimeout);

                // Show bubble
                hamsterBubble.classList.add('show');

                // Hide bubble after 4 seconds
                bubbleTimeout = setTimeout(() => {
                    hamsterBubble.classList.remove('show');
                }, 4000);
            }
        });
    }
});
