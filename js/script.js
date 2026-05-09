// Menu Toggle (if using mobile menu)
function toggleMenu() {
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('active');
}

function setupHeaderScrollBehavior() {
    const siteHeader = document.getElementById('site-header');
    if (!siteHeader) {
        return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeaderState = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 20) {
            siteHeader.classList.add('is-hidden');
        } else {
            siteHeader.classList.remove('is-hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeaderState);
            ticking = true;
        }
    }, { passive: true });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupHeaderScrollBehavior();
});

// Gallery lightbox functionality (placeholder)
function openGallery(imageSrc) {
    console.log('Opening image:', imageSrc);
}

// RSVP Form Handler (placeholder)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('RSVP submitted');
            // Add form submission logic here
        });
    }
});
