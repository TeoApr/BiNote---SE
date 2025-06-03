// Essential Functions - Save as js/basic-functions.js

// Sample Notes Data
const sampleNotes = [
    {
        id: 1,
        title: "Computational Biology",
        author: "Jonathan Tristan",
        subject: "Computer Science",
        price: 19999,
        rating: 4.8,
        reviews: 51,
        icon: "📊"
    },
    {
        id: 2,
        title: "Code Reengineering", 
        author: "Jonathan Tristan",
        subject: "Computer Science",
        price: 14999,
        rating: 4.7,
        reviews: 35,
        icon: "🔧"
    },
    {
        id: 3,
        title: "Agile Software Development",
        author: "Jonathan Tristan", 
        subject: "Computer Science",
        price: 9999,
        rating: 5.0,
        reviews: 28,
        icon: "⚡"
    }
];

// Utility Functions
function formatCurrency(amount) {
    return `Rp ${amount.toLocaleString('id-ID')}`;
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal not found:', modalId);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Initialize page content
        if (pageId === 'home') {
            renderNotes();
        }
    }
}

// Notes Rendering
function renderNotes() {
    const notesGrid = document.getElementById('notesGrid');
    if (!notesGrid) return;
    
    notesGrid.innerHTML = sampleNotes.map(note => `
        <div class="note-card" onclick="previewNote(${note.id})">
            <div class="note-image">${note.icon}</div>
            <div class="note-content">
                <h3 class="note-title">${note.title}</h3>
                <p class="note-author">by ${note.author}</p>
                <div class="rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(note.rating))}</span>
                    <span>${note.rating}(${note.reviews})</span>
                </div>
                <div class="note-price">${formatCurrency(note.price)}</div>
                <div class="note-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-outline" onclick="addToCart(${note.id})">Add to Cart</button>
                    <button class="btn btn-primary" onclick="buyNow(${note.id})">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Basic Cart Functions
let cart = [];

function addToCart(noteId) {
    const note = sampleNotes.find(n => n.id === noteId);
    if (note) {
        cart.push(note);
        showNotification(`${note.title} added to cart!`);
    }
}

function buyNow(noteId) {
    const note = sampleNotes.find(n => n.id === noteId);
    if (note) {
        showNotification(`Redirecting to purchase ${note.title}...`, 'info');
    }
}

// Note Preview
function previewNote(noteId) {
    const note = sampleNotes.find(n => n.id === noteId);
    if (note) {
        showNotification(`Preview for ${note.title}`, 'info');
    }
}

// Search Function
function searchNotes() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const query = searchInput.value.trim();
        if (query) {
            showNotification(`Searching for: ${query}`, 'info');
        }
    }
}

// Filter Function
function filterNotes() {
    showNotification('Filtering notes...', 'info');
}

// Auth Object (Basic)
const Auth = {
    isLoggedIn: function() {
        return false; // For now, always return false
    },
    
    getCurrentUser: function() {
        return null;
    }
};

// Initialize App
function initializeApp() {
    console.log('🚀 App initializing...');
    
    // Render notes on home page
    renderNotes();
    
    // Test notification
    setTimeout(() => {
        showNotification('Welcome to BINotes! 🎉');
    }, 1000);
    
    console.log('✅ App initialized successfully');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing app...');
    initializeApp();
});

// Click outside modal to close
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
});

console.log('📦 Basic functions loaded successfully');

