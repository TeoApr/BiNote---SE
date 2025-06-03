// Cart/Bucket Management System
let cart = [];
let currentUser = null;

// Sample notes data (you can replace this with your actual data source)
const sampleNotes = [
    {
        id: 1,
        title: "Biologi Molekuler - Transkripsi & Translasi",
        subject: "Biology",
        author: "Sarah Chen",
        price: 25000,
        rating: 4.8,
        reviewCount: 24,
        pages: 15,
        description: "Catatan lengkap tentang proses transkripsi dan translasi dalam biologi molekuler dengan diagram dan contoh soal.",
        thumbnail: "📚"
    },
    {
        id: 2,
        title: "Algoritma dan Struktur Data",
        subject: "Computer Science",
        author: "Ahmad Rizky",
        price: 35000,
        rating: 4.9,
        reviewCount: 18,
        pages: 22,
        description: "Panduan komprehensif algoritma sorting, searching, dan struktur data dengan implementasi code.",
        thumbnail: "💻"
    },
    {
        id: 3,
        title: "Kalkulus Diferensial",
        subject: "Mathematics",
        author: "Diana Putri",
        price: 30000,
        rating: 4.7,
        reviewCount: 31,
        pages: 18,
        description: "Penjelasan detail tentang limit, turunan, dan aplikasinya dengan contoh soal step-by-step.",
        thumbnail: "📊"
    }
];

// Initialize cart from localStorage (if available)
function initializeCart() {
    const savedCart = localStorage.getItem('binotes_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartDisplay();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('binotes_cart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(noteId) {
    // Check if user is logged in
    if (!currentUser) {
        showNotification('Please login to add items to cart', 'error');
        return;
    }

    // Find the note
    const note = sampleNotes.find(n => n.id === noteId);
    if (!note) {
        showNotification('Note not found', 'error');
        return;
    }

    // Check if item already in cart
    const existingItem = cart.find(item => item.id === noteId);
    if (existingItem) {
        showNotification('Item already in your bucket!', 'warning');
        return;
    }

    // Add to cart
    cart.push({
        id: note.id,
        title: note.title,
        subject: note.subject,
        author: note.author,
        price: note.price,
        pages: note.pages,
        thumbnail: note.thumbnail,
        addedAt: new Date().toISOString()
    });

    saveCart();
    updateCartDisplay();
    showNotification('Added to bucket successfully!', 'success');
}

// Remove item from cart
function removeFromCart(noteId) {
    cart = cart.filter(item => item.id !== noteId);
    saveCart();
    updateCartDisplay();
    showNotification('Removed from bucket', 'info');
}

// Update cart display
function updateCartDisplay() {
    updateBucketPage();
    updateCartCounter();
}

// Update cart counter in navigation
function updateCartCounter() {
    const cartCount = cart.length;
    let cartCounterElement = document.getElementById('cartCounter');
    
    if (!cartCounterElement && cartCount > 0) {
        // Create cart counter element
        cartCounterElement = document.createElement('span');
        cartCounterElement.id = 'cartCounter';
        cartCounterElement.className = 'cart-counter';
        cartCounterElement.textContent = cartCount;
        
        // Add to navigation (you may need to adjust the selector based on your nav structure)
        const bucketLink = document.querySelector('a[onclick*="bucket"]');
        if (bucketLink) {
            bucketLink.style.position = 'relative';
            bucketLink.appendChild(cartCounterElement);
        }
    } else if (cartCounterElement) {
        if (cartCount > 0) {
            cartCounterElement.textContent = cartCount;
            cartCounterElement.style.display = 'inline';
        } else {
            cartCounterElement.style.display = 'none';
        }
    }
}

// Update bucket page content
function updateBucketPage() {
    const bucketItemsContainer = document.getElementById('bucketItems');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!bucketItemsContainer) return;

    if (cart.length === 0) {
        bucketItemsContainer.innerHTML = `
            <div class="empty-bucket">
                <div class="empty-icon">🛒</div>
                <h3>Your bucket is empty</h3>
                <p>Add some notes to get started!</p>
                <button class="btn btn-primary" onclick="showPage('home')">Browse Notes</button>
            </div>
        `;
        
        // Reset totals
        if (subtotalElement) subtotalElement.textContent = 'Rp 0';
        if (taxElement) taxElement.textContent = 'Rp 0';
        if (totalElement) totalElement.textContent = 'Rp 1,500';
        if (checkoutBtn) checkoutBtn.disabled = true;
        
        return;
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const adminFee = 1500;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + adminFee + tax;

    // Update bucket items
    bucketItemsContainer.innerHTML = cart.map(item => `
        <div class="bucket-item">
            <div class="item-thumbnail">${item.thumbnail}</div>
            <div class="item-details">
                <h4>${item.title}</h4>
                <p>Subject: ${item.subject}</p>
                <p>Author: ${item.author}</p>
                <p>Pages: ${item.pages}</p>
            </div>
            <div class="item-price">
                <span class="price">Rp ${item.price.toLocaleString('id-ID')}</span>
                <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove from bucket">
                    ×
                </button>
            </div>
        </div>
    `).join('');

    // Update totals
    if (subtotalElement) subtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    if (taxElement) taxElement.textContent = `Rp ${tax.toLocaleString('id-ID')}`;
    if (totalElement) totalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    if (checkoutBtn) checkoutBtn.disabled = false;
}

// Add to cart from preview modal
function addToCartFromPreview() {
    const noteId = parseInt(document.getElementById('previewModal').dataset.noteId);
    addToCart(noteId);
}

// Buy now from preview modal
function buyNowFromPreview() {
    const noteId = parseInt(document.getElementById('previewModal').dataset.noteId);
    addToCart(noteId);
    closePreview();
    showPage('bucket');
}

// Generate notes grid with add to cart buttons
function generateNotesGrid() {
    const notesGrid = document.getElementById('notesGrid');
    if (!notesGrid) return;

    notesGrid.innerHTML = sampleNotes.map(note => `
        <div class="note-card">
            <div class="note-thumbnail">${note.thumbnail}</div>
            <div class="note-info">
                <h3 class="note-title">${note.title}</h3>
                <p class="note-subject">${note.subject}</p>
                <p class="note-author">By ${note.author}</p>
                <div class="note-rating">
                    ⭐⭐⭐⭐⭐ ${note.rating} (${note.reviewCount} reviews)
                </div>
                <p class="note-pages">${note.pages} pages</p>
                <div class="note-price">Rp ${note.price.toLocaleString('id-ID')}</div>
            </div>
            <div class="note-actions">
                <button class="btn btn-outline" onclick="previewNote(${note.id})">Preview</button>
                <button class="btn btn-primary" onclick="addToCart(${note.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Preview note function
function previewNote(noteId) {
    const note = sampleNotes.find(n => n.id === noteId);
    if (!note) return;

    const modal = document.getElementById('previewModal');
    modal.dataset.noteId = noteId;
    
    // Update modal content
    document.getElementById('previewNoteTitle').textContent = note.title;
    document.getElementById('previewSubject').textContent = note.subject;
    document.getElementById('previewAuthor').textContent = note.author;
    document.getElementById('previewRating').textContent = `⭐⭐⭐⭐⭐ ${note.rating} (${note.reviewCount} reviews)`;
    document.getElementById('previewPrice').textContent = `Rp ${note.price.toLocaleString('id-ID')}`;
    document.getElementById('previewDescription').textContent = note.description;
    document.getElementById('previewThumbnail').textContent = note.thumbnail;
    
    modal.style.display = 'flex';
}

// Close preview modal
function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Mock user authentication (replace with your actual auth system)
function mockLogin() {
    currentUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
    };
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Mock login for demo purposes
    mockLogin();
    
    // Initialize cart
    initializeCart();
    
    // Generate notes grid
    generateNotesGrid();
    
    // Show home page by default
    showPage('home');
});

// Note: Add the corresponding CSS styles to your CSS file