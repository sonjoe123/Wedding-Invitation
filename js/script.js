const SITE_PASSWORD = 'VT2027';
const SITE_PASSWORD_KEY = 'linh-andrew-site-unlocked';

// Menu Toggle (if using mobile menu)
function toggleMenu() {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
        return;
    }

    navbar.classList.toggle('active');
    syncHomeHeroHeight();
}

function createPasswordGate() {
    const overlay = document.createElement('div');
    overlay.className = 'password-gate';
    overlay.innerHTML = `
        <h1 class="password-gate__title">Enter Password</h1>
        <form class="password-gate__form">
            <label class="password-gate__label" for="site-password">Password</label>
            <input
                class="password-gate__input"
                id="site-password"
                name="site-password"
                type="text"
                inputmode="text"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                required
            >
            <p class="password-gate__error" aria-live="polite"></p>
            <button class="password-gate__button" type="submit">Open Site</button>
        </form>
    `;

    document.body.appendChild(overlay);
    return overlay;
}

function setupPasswordGate() {
    if (window.localStorage.getItem(SITE_PASSWORD_KEY) === 'true') {
        document.body.classList.remove('page-locked');

        window.requestAnimationFrame(() => {
            document.body.classList.add('page-ready');
            syncHeaderOffset();
            syncHomeHeroHeight();
        });

        return;
    }

    const overlay = createPasswordGate();
    const form = overlay.querySelector('.password-gate__form');
    const input = overlay.querySelector('.password-gate__input');
    const error = overlay.querySelector('.password-gate__error');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (input.value === SITE_PASSWORD) {
            window.localStorage.setItem(SITE_PASSWORD_KEY, 'true');
            document.body.classList.remove('page-locked');

            window.requestAnimationFrame(() => {
                document.body.classList.add('page-ready');
                syncHeaderOffset();
                syncHomeHeroHeight();
            });

            overlay.remove();
            return;
        }

        error.textContent = 'Incorrect password. Please try again.';
        input.value = '';
        input.focus();
    });

    window.requestAnimationFrame(() => {
        input.focus();
    });
}

function syncHeaderOffset() {
    const siteHeader = document.getElementById('site-header');
    if (!siteHeader) {
        return;
    }

    document.documentElement.style.setProperty('--header-offset', `${Math.ceil(siteHeader.offsetHeight)}px`);
}

function syncHomeHeroHeight() {
    const homeSlideshow = document.querySelector('.home-slideshow');
    const siteHeader = document.getElementById('site-header');

    if (!homeSlideshow || !siteHeader) {
        return;
    }

    const viewportHeight = window.innerHeight;
    const headerHeight = Math.ceil(siteHeader.offsetHeight);
    const heroAtTop = homeSlideshow.getBoundingClientRect().top <= 0;
    const availableHeight = heroAtTop
        ? viewportHeight
        : Math.max(420, viewportHeight - headerHeight);

    document.documentElement.style.setProperty('--home-hero-height', `${availableHeight}px`);
}

function setupHomeSlideshow() {
    const slides = Array.from(document.querySelectorAll('.home-slideshow-image'));
    if (slides.length < 2) {
        return;
    }

    let activeIndex = 0;

    window.setInterval(() => {
        slides[activeIndex].classList.remove('is-active');
        activeIndex = (activeIndex + 1) % slides.length;
        slides[activeIndex].classList.add('is-active');
    }, 3000);
}

function setupRsvpForm() {
    const form = document.querySelector('form');
    if (!form) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('RSVP submitted');
        // Add form submission logic here
    });
}

function initializePage() {
    syncHeaderOffset();
    syncHomeHeroHeight();
    setupHomeSlideshow();
    setupRsvpForm();
}

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupPasswordGate();
});

window.addEventListener('load', () => {
    syncHeaderOffset();
    syncHomeHeroHeight();
});

window.addEventListener('resize', () => {
    syncHeaderOffset();
    syncHomeHeroHeight();
});

window.addEventListener('scroll', syncHomeHeroHeight, { passive: true });

if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
        syncHeaderOffset();
        syncHomeHeroHeight();
    });
}

// Gallery lightbox functionality (placeholder)
function openGallery(imageSrc) {
    console.log('Opening image:', imageSrc);
}
