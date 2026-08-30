const SITE_PASSWORD = 'VT2027';
const SITE_PASSWORD_KEY = 'linh-andrew-site-unlocked';
const WEDDING_DATE = new Date('2027-01-03T00:00:00+07:00');
let countdownIntervalId = null;

function readUnlockedState() {
    try {
        if (window.localStorage.getItem(SITE_PASSWORD_KEY) === 'true') {
            return true;
        }
    } catch (error) {
        // Ignore storage access failures and fall back to cookies.
    }

    return document.cookie.split('; ').some((cookie) => cookie === `${encodeURIComponent(SITE_PASSWORD_KEY)}=true`);
}

function saveUnlockedState() {
    try {
        window.localStorage.setItem(SITE_PASSWORD_KEY, 'true');
        return;
    } catch (error) {
        // Ignore storage access failures and fall back to cookies.
    }

    document.cookie = `${encodeURIComponent(SITE_PASSWORD_KEY)}=true; path=/; max-age=2592000; samesite=lax`;
}

// Menu Toggle (if using mobile menu)
function toggleMenu() {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
        return;
    }

    navbar.classList.toggle('active');
}

function createPasswordGate() {
    const existingOverlay = document.querySelector('.password-gate');
    if (existingOverlay) {
        return existingOverlay;
    }

    const overlay = document.createElement('div');
    overlay.className = 'password-gate';
    overlay.innerHTML = `
        <p class="password-gate__eyebrow">Private invitation</p>
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
    const existingOverlay = document.querySelector('.password-gate');

    if (readUnlockedState()) {
        document.body.classList.remove('page-locked');
        document.body.classList.add('page-ready');

        if (existingOverlay) {
            existingOverlay.remove();
        }

        window.requestAnimationFrame(() => {
            syncHeaderOffset();
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
            saveUnlockedState();
            document.body.classList.remove('page-locked');
            overlay.classList.add('is-closing');

            window.requestAnimationFrame(() => {
                document.body.classList.add('page-ready');
                syncHeaderOffset();
            });

            window.setTimeout(() => {
                overlay.remove();
            }, 220);
            return;
        }

        error.textContent = 'Incorrect password. Please try again.';
        input.value = '';
        input.focus();
    });

    window.requestAnimationFrame(() => {
        input.focus({ preventScroll: true });
    });
}

function syncHeaderOffset() {
    const siteHeader = document.getElementById('site-header');
    if (!siteHeader) {
        return;
    }

    document.documentElement.style.setProperty('--header-offset', `${Math.ceil(siteHeader.offsetHeight)}px`);
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

function formatCountdownUnit(value, label) {
    return `${value} ${label}${value === 1 ? '' : 's'}`;
}

function updateCountdown() {
    const countdown = document.getElementById('countdown');
    if (!countdown) {
        return;
    }

    const now = new Date();
    const distance = WEDDING_DATE.getTime() - now.getTime();

    if (distance <= 0) {
        countdown.textContent = 'Today is the day.';
        return;
    }

    const totalSeconds = Math.floor(distance / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdown.textContent = [
        formatCountdownUnit(days, 'day'),
        formatCountdownUnit(hours, 'hour'),
        formatCountdownUnit(minutes, 'minute'),
        formatCountdownUnit(seconds, 'second')
    ].join('   ');
}

function setupCountdown() {
    const countdown = document.getElementById('countdown');
    if (countdownIntervalId) {
        window.clearInterval(countdownIntervalId);
        countdownIntervalId = null;
    }

    if (!countdown) {
        return;
    }

    updateCountdown();
    countdownIntervalId = window.setInterval(updateCountdown, 1000);
}

function setupPhotoReel() {
    const reel = document.querySelector('.home-photo-reel');
    const repeatedSet = reel?.querySelector('.home-photo-reel__set[aria-hidden="true"]');

    if (!reel || !repeatedSet) {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isDragging = false;
    let isPaused = false;
    let pointerStartX = 0;
    let scrollStartX = 0;
    let previousTime = performance.now();
    let pendingAutoScroll = 0;

    const animate = (currentTime) => {
        if (!reel.isConnected) {
            return;
        }

        const elapsedSeconds = Math.min((currentTime - previousTime) / 1000, 0.1);
        previousTime = currentTime;

        if (!prefersReducedMotion && !isDragging && !isPaused) {
            pendingAutoScroll += 50 * elapsedSeconds;
            const wholePixels = Math.floor(pendingAutoScroll);

            if (wholePixels > 0) {
                reel.scrollLeft += wholePixels;
                pendingAutoScroll -= wholePixels;
            }

            if (reel.scrollLeft >= repeatedSet.offsetLeft) {
                reel.scrollLeft -= repeatedSet.offsetLeft;
            }
        }

        window.requestAnimationFrame(animate);
    };

    reel.addEventListener('pointerdown', (event) => {
        isDragging = true;

        if (event.pointerType === 'touch') {
            return;
        }

        pointerStartX = event.clientX;
        scrollStartX = reel.scrollLeft;
        reel.classList.add('is-dragging');
        reel.setPointerCapture(event.pointerId);
    });

    reel.addEventListener('pointermove', (event) => {
        if (!isDragging || event.pointerType === 'touch') {
            return;
        }

        reel.scrollLeft = scrollStartX - (event.clientX - pointerStartX);
    });

    const stopDragging = (event) => {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        reel.classList.remove('is-dragging');

        if (reel.hasPointerCapture(event.pointerId)) {
            reel.releasePointerCapture(event.pointerId);
        }
    };

    reel.addEventListener('pointerup', stopDragging);
    reel.addEventListener('pointercancel', stopDragging);
    reel.addEventListener('mouseenter', () => {
        isPaused = true;
    });
    reel.addEventListener('mouseleave', () => {
        isPaused = false;
    });

    window.requestAnimationFrame(animate);
}

function initializePage() {
    syncHeaderOffset();
    setupRsvpForm();
    setupCountdown();
    setupPhotoReel();
}

function setBodyClasses(nextBodyClassList) {
    const persistentClasses = [];

    if (document.body.classList.contains('page-locked')) {
        persistentClasses.push('page-locked');
    }

    if (document.body.classList.contains('page-ready')) {
        persistentClasses.push('page-ready');
    }

    document.body.className = '';
    nextBodyClassList.forEach((className) => {
        if (className === 'page-locked' || className === 'page-ready') {
            return;
        }

        document.body.classList.add(className);
    });
    persistentClasses.forEach((className) => {
        document.body.classList.add(className);
    });
}

function syncNavbarState() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navbarLinks = document.querySelectorAll('#navbar a[href]');

    navbarLinks.forEach((link) => {
        const href = link.getAttribute('href');
        const isCurrentPage = href === currentPath || (currentPath === '' && href === 'index.html');

        if (isCurrentPage) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

function isInternalPageLink(link) {
    if (!link) {
        return false;
    }

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) {
        return false;
    }

    const url = new URL(link.href, window.location.href);
    const isSameOrigin = url.origin === window.location.origin;
    const isHtmlPage = url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '';

    return isSameOrigin && isHtmlPage;
}

async function loadPage(url, shouldPushState = true) {
    const response = await fetch(url, {
        headers: {
            'X-Requested-With': 'fetch'
        }
    });

    if (!response.ok) {
        throw new Error(`Navigation failed with status ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const nextDocument = parser.parseFromString(html, 'text/html');
    const nextMain = nextDocument.querySelector('main');

    if (!nextMain) {
        throw new Error('Navigation failed because the next page has no <main> content.');
    }

    const currentMain = document.querySelector('main');
    currentMain.replaceWith(nextMain);
    setBodyClasses(Array.from(nextDocument.body.classList));
    document.title = nextDocument.title || document.title;
    syncNavbarState();
    initializePage();

    if (shouldPushState) {
        window.history.pushState({ __linhSite: true }, '', url);
    }

    window.scrollTo(0, 0);
}

function setupClientNavigation() {
    if (!window.history || typeof window.history.pushState !== 'function') {
        return;
    }

    if (!window.history.state || !window.history.state.__linhSite) {
        window.history.replaceState({ __linhSite: true }, '', window.location.href);
    }

    document.addEventListener('click', async (event) => {
        const link = event.target.closest('a');

        if (!isInternalPageLink(link)) {
            return;
        }

        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        event.preventDefault();

        try {
            await loadPage(link.href);
        } catch (error) {
            window.location.href = link.href;
        }
    });

    window.addEventListener('popstate', async () => {
        try {
            await loadPage(window.location.href, false);
        } catch (error) {
            window.location.reload();
        }
    });

    syncNavbarState();
}

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupPasswordGate();
    setupClientNavigation();
});

window.addEventListener('load', () => {
    syncHeaderOffset();
});

window.addEventListener('resize', () => {
    syncHeaderOffset();
});

if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
        syncHeaderOffset();
    });
}

// Gallery lightbox functionality (placeholder)
function openGallery(imageSrc) {
    console.log('Opening image:', imageSrc);
}
