// ==========================================
// Global Variables
// ==========================================
const images = [
    'images/apartment-main.png',
    'images/apartment-kitchen.png',
    'images/apartment-bedroom.png',
    'images/apartment-bathroom.png'
];

let currentImageIndex = 0;
const PRICE_PER_NIGHT = 85;
const CLEANING_FEE = 30;

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initDateInputs();
    initBookingForm();
    initScrollAnimations();
});

// ==========================================
// Navigation
// ==========================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('visible');
        } else {
            navbar.classList.remove('visible');
        }

        lastScroll = currentScroll;
    });
}

function scrollToBooking() {
    const bookingSection = document.getElementById('booking');
    bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==========================================
// Lightbox Gallery
// ==========================================
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const counter = document.getElementById('lightbox-counter');

    lightboxImage.src = images[currentImageIndex];
    counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    lightbox.classList.add('active');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    currentImageIndex += direction;

    if (currentImageIndex < 0) {
        currentImageIndex = images.length - 1;
    } else if (currentImageIndex >= images.length) {
        currentImageIndex = 0;
    }

    const lightboxImage = document.getElementById('lightbox-image');
    const counter = document.getElementById('lightbox-counter');

    lightboxImage.style.opacity = '0';

    setTimeout(() => {
        lightboxImage.src = images[currentImageIndex];
        counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
        lightboxImage.style.opacity = '1';
    }, 150);
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
    }
});

// Close lightbox on background click
document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});

// ==========================================
// Date Inputs
// ==========================================
function initDateInputs() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    checkinInput.min = today;
    checkoutInput.min = today;

    // Update checkout min date when checkin changes
    checkinInput.addEventListener('change', () => {
        const checkinDate = new Date(checkinInput.value);
        checkinDate.setDate(checkinDate.getDate() + 1);
        checkoutInput.min = checkinDate.toISOString().split('T')[0];

        // Reset checkout if it's before new minimum
        if (checkoutInput.value && new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
            checkoutInput.value = '';
        }

        calculatePrice();
    });

    checkoutInput.addEventListener('change', calculatePrice);
}

// ==========================================
// Price Calculation
// ==========================================
function calculatePrice() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const nightsCount = document.getElementById('nights-count');
    const subtotal = document.getElementById('subtotal');
    const total = document.getElementById('total');

    if (!checkinInput.value || !checkoutInput.value) {
        nightsCount.textContent = '0';
        subtotal.textContent = '0€';
        total.textContent = CLEANING_FEE + '€';
        return;
    }

    const checkin = new Date(checkinInput.value);
    const checkout = new Date(checkoutInput.value);
    const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        nightsCount.textContent = '0';
        subtotal.textContent = '0€';
        total.textContent = CLEANING_FEE + '€';
        return;
    }

    const nightsPrice = nights * PRICE_PER_NIGHT;
    const totalPrice = nightsPrice + CLEANING_FEE;

    nightsCount.textContent = nights;
    subtotal.textContent = nightsPrice + '€';
    total.textContent = totalPrice + '€';
}

// ==========================================
// Booking Form
// ==========================================
function initBookingForm() {
    const form = document.getElementById('booking-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        showPaymentModal();
    });
}

function validateForm() {
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (!checkin || !checkout) {
        alert('Veuillez sélectionner les dates de votre séjour.');
        return false;
    }

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        alert('La date de départ doit être après la date d\'arrivée.');
        return false;
    }

    if (!guests) {
        alert('Veuillez indiquer le nombre de personnes.');
        return false;
    }

    if (!name.trim()) {
        alert('Veuillez entrer votre nom.');
        return false;
    }

    if (!email.trim() || !isValidEmail(email)) {
        alert('Veuillez entrer une adresse email valide.');
        return false;
    }

    if (!phone.trim()) {
        alert('Veuillez entrer votre numéro de téléphone.');
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ==========================================
// Payment Modal
// ==========================================
function showPaymentModal() {
    const modal = document.getElementById('payment-modal');
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;
    const name = document.getElementById('name').value;

    // Calculate nights and total
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    const totalPrice = (nights * PRICE_PER_NIGHT) + CLEANING_FEE;

    // Format dates
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Update modal content
    document.getElementById('modal-total').textContent = totalPrice + '€';
    document.getElementById('summary-dates').textContent =
        `${formatDate(checkin)} - ${formatDate(checkout)}`;
    document.getElementById('summary-nights').textContent =
        `${nights} nuit${nights > 1 ? 's' : ''}`;
    document.getElementById('summary-guests').textContent =
        `${guests} personne${guests > 1 ? 's' : ''}`;
    document.getElementById('summary-name').textContent = name;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on background click
document.getElementById('payment-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'payment-modal') {
        closePaymentModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('payment-modal');
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closePaymentModal();
    }
});

// ==========================================
// Payment Processing
// ==========================================
function processPayment() {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    const totalPrice = (nights * PRICE_PER_NIGHT) + CLEANING_FEE;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    if (paymentMethod === 'revolut-link') {
        // Revolut.Me link
        // Replace 'YOUR_REVOLUT_USERNAME' with actual Revolut.Me username
        const revolutUsername = 'YOUR_REVOLUT_USERNAME';
        const amount = totalPrice;
        const description = encodeURIComponent(`Réservation appartement - ${name} - ${nights} nuits`);

        // Revolut.Me URL format
        const revolutUrl = `https://revolut.me/${revolutUsername}/${amount}`;

        // Show confirmation
        if (confirm(`Vous allez être redirigé vers Revolut pour effectuer un paiement de ${amount}€.\n\nUne fois le paiement effectué, vous recevrez une confirmation par email à ${email}.`)) {
            // In a real application, you would:
            // 1. Save the booking to a database
            // 2. Send confirmation email
            // 3. Redirect to Revolut

            console.log('Booking details:', {
                name,
                email,
                checkin,
                checkout,
                nights,
                total: totalPrice,
                paymentMethod: 'revolut-link'
            });

            alert(`Pour cette démonstration, configurez votre lien Revolut.Me dans le code JavaScript.\n\nURL à utiliser: ${revolutUrl}\n\nDans une application réelle, vous seriez redirigé automatiquement.`);

            // window.location.href = revolutUrl;
        }
    } else if (paymentMethod === 'bank-transfer') {
        // Bank transfer instructions
        const message = `Instructions pour le virement bancaire:\n\n` +
            `Montant: ${totalPrice}€\n` +
            `Bénéficiaire: [Votre nom]\n` +
            `IBAN: [Votre IBAN Revolut]\n` +
            `Référence: ${name} - ${checkin}\n\n` +
            `Vous recevrez une confirmation par email à ${email} une fois le paiement reçu.`;

        console.log('Booking details:', {
            name,
            email,
            checkin,
            checkout,
            nights,
            total: totalPrice,
            paymentMethod: 'bank-transfer'
        });

        alert(message);
    }

    // Close modal
    closePaymentModal();
}

// ==========================================
// Scroll Animations
// ==========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.gallery-item, .amenity-card, .spec-item, .info-card'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ==========================================
// Smooth Image Loading
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';

        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        }
    });
});

// ==========================================
// Utility Functions
// ==========================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ==========================================
// Performance Optimization
// ==========================================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
