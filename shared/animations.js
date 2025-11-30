/* ========================================
   BENTO BUDDIES - APPLE-STYLE ANIMATIONS JS
   Scroll-based animations using Intersection Observer
   ======================================== */

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initParallax();
    initSmoothScroll();
});

/* ========================================
   SCROLL-BASED FADE-IN ANIMATIONS
   ======================================== */

function initScrollAnimations() {
    // Select all elements with animation classes
    const animatedElements = document.querySelectorAll(
        '.fade-in, .fade-in-up, .fade-in-left, .fade-in-right, .scale-in'
    );

    // Intersection Observer options
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
        threshold: 0.1 // Trigger when 10% of element is visible
    };

    // Create observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add 'visible' class to trigger animation
                entry.target.classList.add('visible');

                // Optional: Stop observing after animation (one-time animation)
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/* ========================================
   PARALLAX SCROLLING EFFECT
   ======================================== */

function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-layer');

    if (parallaxElements.length === 0) return;

    // Update parallax on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
            // Get parallax speed (default 0.5)
            const speed = element.dataset.parallaxSpeed || 0.5;

            // Calculate transform based on scroll position
            const yPos = -(scrolled * speed);

            // Apply transform
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

/* ========================================
   SMOOTH SCROLL TO ANCHOR LINKS
   ======================================== */

function initSmoothScroll() {
    // Select all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if href is just "#" or empty
            if (href === '#' || href === '') return;

            const targetElement = document.querySelector(href);

            if (targetElement) {
                e.preventDefault();

                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ========================================
   STAGGER ANIMATION HELPER
   Apply staggered delays to child elements
   ======================================== */

function applyStaggerAnimation(containerSelector, delay = 100) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const children = container.children;
    Array.from(children).forEach((child, index) => {
        child.style.transitionDelay = `${index * delay}ms`;
    });
}

/* ========================================
   NUMBER COUNTER ANIMATION
   Animate numbers counting up (for stats)
   ======================================== */

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    // Format number with spaces for thousands (e.g., 1 000)
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(target) + '+';
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
        }
    }, 16);
}

// Auto-initialize counters on scroll
function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.counter);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// Initialize counter animations
document.addEventListener('DOMContentLoaded', initCounterAnimations);

/* ========================================
   VIEWPORT HEIGHT FIX (for mobile)
   ======================================== */

function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setViewportHeight);
window.addEventListener('load', setViewportHeight);

/* ========================================
   SCROLL PROGRESS INDICATOR
   ======================================== */

function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
    });
}

document.addEventListener('DOMContentLoaded', initScrollProgress);

/* ========================================
   EXPORT FUNCTIONS FOR MANUAL USE
   ======================================== */

window.BentoAnimations = {
    applyStagger: applyStaggerAnimation,
    animateCounter: animateCounter,
    initScrollAnimations: initScrollAnimations,
    initParallax: initParallax,
    initSmoothScroll: initSmoothScroll
};
