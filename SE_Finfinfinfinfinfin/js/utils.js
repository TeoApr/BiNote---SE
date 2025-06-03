// Modal functions (add these to your existing utils.js)
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Emit event for other modules
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('modal:opened', modalId);
        }
    } else {
        console.error(`Modal with ID '${modalId}' not found`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Emit event for other modules
        if (typeof eventBus !== 'undefined') {
            eventBus.emit('modal:closed', modalId);
        }
    }
}

// Page navigation function
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Update URL hash (optional)
        window.location.hash = pageId;
        
        // Emit page change event
        eventBus.emit('page:changed', pageId);
        
        // Special handling for specific pages
        if (pageId === 'profile' && typeof initializeProfile === 'function') {
            initializeProfile();
        }
        
        if (pageId === 'bucket' && typeof Cart !== 'undefined') {
            Cart.render();
        }
        
        if (pageId === 'purchased' && typeof initializePurchasedNotes === 'function') {
            initializePurchasedNotes();
        }
    } else {
        console.error(`Page with ID '${pageId}' not found`);
    }
}

// Setup modal close functionality
function setupModalHandlers() {
    // Close modal when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            const modalId = event.target.id;
            closeModal(modalId);
        }
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
    
    // Setup close buttons
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Initialize modal handlers when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupModalHandlers();
});

// Make modal functions available globally
window.showModal = showModal;
window.closeModal = closeModal;
window.showPage = showPage;