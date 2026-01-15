// ==============================================
// MAIN JAVASCRIPT - Bandarawela Dairy Cooperative
// ==============================================

// Global state management
const AppState = {
    currentLanguage: 'en',
    isMenuOpen: false,
    scrollPosition: 0,
    formSubmissions: new Map() // For rate limiting
};

// Language data structure
const translations = {
    en: {
        // Navigation and common elements are handled via data attributes in HTML
    },
    si: {
        // Sinhala translations handled via data attributes
    }
};

// ==============================================
// INITIALIZATION
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initLanguageToggle();
    initSmoothScroll();
    initBackToTop();
    initStatCounters();
    initProductFilters();
    initContactForm();
    initScrollAnimations();
    generateCSRFToken();
    updateCopyrightYear();

    console.log('🐄 Bandarawela Dairy website initialized successfully');
});

// ==============================================
// NAVIGATION
// ==============================================

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            AppState.isMenuOpen = !AppState.isMenuOpen;
            navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', AppState.isMenuOpen);

            // Prevent body scroll when menu is open
            document.body.style.overflow = AppState.isMenuOpen ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (AppState.isMenuOpen && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target)) {
                AppState.isMenuOpen = false;
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // Close mobile menu when nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (AppState.isMenuOpen) {
                AppState.isMenuOpen = false;
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    });

    // Sticky navigation with scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', throttle(() => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        updateActiveNavLink();

        lastScroll = currentScroll;
    }, 100));
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollPosition = window.pageYOffset + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ==============================================
// LANGUAGE TOGGLE
// ==============================================

function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            AppState.currentLanguage = AppState.currentLanguage === 'en' ? 'si' : 'en';
            updateLanguage();
        });
    }

    // Check for saved language preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'en' || savedLang === 'si')) {
        AppState.currentLanguage = savedLang;
        updateLanguage();
    }
}

function updateLanguage() {
    const lang = AppState.currentLanguage;

    // Update all elements with data-en and data-si attributes
    document.querySelectorAll('[data-en][data-si]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            // Check if it's an input/textarea placeholder
            if (element.hasAttribute(`data-placeholder-${lang}`)) {
                element.placeholder = element.getAttribute(`data-placeholder-${lang}`);
            } else {
                element.innerHTML = text;
            }
        }
    });

    // Update language toggle button
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const currentSpan = langToggle.querySelector('.lang-current');
        const altSpan = langToggle.querySelector('.lang-alt');

        if (lang === 'en') {
            currentSpan.textContent = 'EN';
            altSpan.textContent = 'සිං';
        } else {
            currentSpan.textContent = 'සිං';
            altSpan.textContent = 'EN';
        }
    }

    // Update HTML lang attribute
    document.documentElement.lang = lang === 'en' ? 'en' : 'si';

    // Update meta tags
    updateMetaTags(lang);

    // Save preference
    localStorage.setItem('preferredLanguage', lang);

    console.log(`Language switched to: ${lang}`);
}

function updateMetaTags(lang) {
    const metaDescription = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');

    if (lang === 'si') {
        if (metaDescription) {
            metaDescription.content = 'බණ්ඩාරවෙල කිරි නිෂ්පාදක සමුපකාර සංගමය - 1979 සිට සහතික කිරි මිල සහ ගුණාත්මක කිරි නිෂ්පාදන සහතික කිරීම.';
        }
        if (ogTitle) {
            ogTitle.content = 'බණ්ඩාරවෙල කිරි නිෂ්පාදක සමුපකාර සංගමය';
        }
        if (ogDescription) {
            ogDescription.content = '1979 සිට ගොවීන්ට ගුණාත්මක කිරි නිෂ්පාදන සහ සහතික මිල';
        }
    } else {
        if (metaDescription) {
            metaDescription.content = 'Bandarawela Dairy Producers Cooperative Society Ltd. - Ensuring guaranteed milk prices and quality dairy products since 1979.';
        }
        if (ogTitle) {
            ogTitle.content = 'Bandarawela Dairy Producers Cooperative Society Ltd.';
        }
        if (ogDescription) {
            ogDescription.content = 'Quality dairy products and guaranteed prices for farmers since 1979';
        }
    }
}

// ==============================================
// SMOOTH SCROLLING
// ==============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const targetElement = document.querySelector(href);

            if (targetElement) {
                e.preventDefault();

                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==============================================
// BACK TO TOP BUTTON
// ==============================================

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', throttle(() => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }, 100));

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Keyboard accessibility
        backToTopBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// ==============================================
// ANIMATED STATISTICS COUNTERS
// ==============================================

function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }

    function animateCounters() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            stat.classList.add('counting');

            const updateCounter = () => {
                current += increment;

                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target;
                    stat.classList.remove('counting');
                }
            };

            updateCounter();
        });
    }
}

// ==============================================
// PRODUCT FILTERS
// ==============================================

function initProductFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter products
            productCards.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// ==============================================
// CONTACT FORM
// ==============================================

function initContactForm() {
    const form = document.getElementById('contactForm');

    if (form) {
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
            });
        });

        // Form submission
        form.addEventListener('submit', handleFormSubmit);
    }
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Required field check
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = AppState.currentLanguage === 'en' 
            ? 'This field is required' 
            : 'මෙම ක්ෂේත්‍රය අවශ්‍ය වේ';
    }

    // Email validation
    else if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = AppState.currentLanguage === 'en' 
                ? 'Please enter a valid email address' 
                : 'කරුණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න';
        }
    }

    // Phone validation (Sri Lankan numbers)
    else if (fieldName === 'phone' && value) {
        const phoneRegex = /^(\+?94[0-9]{9}|0[0-9]{9})$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = AppState.currentLanguage === 'en' 
                ? 'Please enter a valid Sri Lankan phone number' 
                : 'කරුණාකර වලංගු ශ්‍රී ලංකා දුරකථන අංකයක් ඇතුළත් කරන්න';
        }
    }

    // Update UI
    const errorElement = field.parentElement.querySelector('.error-message');

    if (!isValid) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
        field.classList.add('shake');
        setTimeout(() => field.classList.remove('shake'), 500);
    } else {
        field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    return isValid;
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    // Validate all fields
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isFormValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) {
        return;
    }

    // Check rate limiting (max 3 submissions per 5 minutes)
    if (!checkRateLimit()) {
        showFormMessage(
            'error',
            AppState.currentLanguage === 'en' 
                ? 'Too many submissions. Please try again later.' 
                : 'බොහෝ ඉල්ලීම්. කරුණාකර පසුව නැවත උත්සාහ කරන්න.'
        );
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="spinner"></span> ' + (AppState.currentLanguage === 'en' ? 'Sending...' : 'යවමින්...');

    try {
        // In a real implementation, this would send to a backend API
        // For now, we'll simulate an API call
        await simulateAPICall(formData);

        // Success
        showFormMessage(
            'success',
            AppState.currentLanguage === 'en' 
                ? 'Thank you! Your message has been sent successfully.' 
                : 'ස්තූතියි! ඔබගේ පණිවිඩය සාර්ථකව යවන ලදී.'
        );

        form.reset();

    } catch (error) {
        // Error
        showFormMessage(
            'error',
            AppState.currentLanguage === 'en' 
                ? 'Sorry, there was an error sending your message. Please try again.' 
                : 'සමාවන්න, ඔබගේ පණිවිඩය යැවීමේදී දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.'
        );
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function checkRateLimit() {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    const maxSubmissions = 3;

    // Clean old entries
    for (const [timestamp] of AppState.formSubmissions) {
        if (now - timestamp > fiveMinutes) {
            AppState.formSubmissions.delete(timestamp);
        }
    }

    // Check if limit exceeded
    if (AppState.formSubmissions.size >= maxSubmissions) {
        return false;
    }

    // Add current submission
    AppState.formSubmissions.set(now, true);
    return true;
}

function simulateAPICall(formData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Form data:', Object.fromEntries(formData));
            resolve();
        }, 1500);
    });
}

function showFormMessage(type, message) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type} fade-in`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        padding: 1rem;
        margin-top: 1rem;
        border-radius: 8px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
    `;

    const form = document.getElementById('contactForm');
    form.appendChild(messageDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// ==============================================
// SCROLL ANIMATIONS
// ==============================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.fade-in, .fade-in-up, .fade-in-down, .fade-in-left, .fade-in-right, .reveal'
    );

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active', 'animated');
                // Optional: Stop observing after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(element => observer.observe(element));
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// Throttle function for performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function for search/input handlers
function debounce(func, delay) {
    let timeoutId;
    return function() {
        const args = arguments;
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
}

// Generate CSRF token for forms
function generateCSRFToken() {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    const csrfInput = document.getElementById('csrfToken');
    if (csrfInput) {
        csrfInput.value = token;
        sessionStorage.setItem('csrfToken', token);
    }
}

// Update copyright year
function updateCopyrightYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ==============================================
// PARALLAX EFFECT (Desktop only)
// ==============================================

if (window.innerWidth > 768) {
    window.addEventListener('scroll', throttle(() => {
        const parallaxSections = document.querySelectorAll('.parallax-section');
        parallaxSections.forEach(section => {
            const scrolled = window.pageYOffset;
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrolled > sectionTop - window.innerHeight && scrolled < sectionTop + sectionHeight) {
                const parallaxOffset = (scrolled - sectionTop) * 0.5;
                section.style.backgroundPositionY = `${parallaxOffset}px`;
            }
        });
    }, 10));
}

// ==============================================
// ERROR HANDLING
// ==============================================

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // In production, you might want to send errors to a logging service
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});