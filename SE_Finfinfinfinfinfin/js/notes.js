// Notes Management Module - Enhanced version

const Notes = {
    // Current preview note and pagination
    currentPreviewNote: null,
    currentPreviewPage: 1,
    maxPreviewPages: CONFIG?.MAX_PREVIEW_PAGES || 3,
    
    // Configuration for API vs sample data
    config: {
        useAPI: false, // Set to true when using real backend
        apiEndpoint: '../api/endpoint.php'
    },
    
    // Render notes grid
    render: function(filteredNotes = null) {
        const notesToRender = filteredNotes || DataService.getAllNotes();
        const notesGrid = document.getElementById('notesGrid');
        
        if (!notesGrid) return;
        
        if (notesToRender.length === 0) {
            notesGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <h3>No notes found</h3>
                    <p>Try adjusting your search or filters</p>
                    <button class="btn btn-primary" onclick="Notes.clearFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }
        
        notesGrid.innerHTML = notesToRender.map(note => `
            <div class="note-card" onclick="Notes.preview(${note.id})">
                <div class="note-image">${note.icon || '📄'}</div>
                <div class="note-content">
                    <h3 class="note-title">${sanitizeHTML(note.title)}</h3>
                    <p class="note-author">by ${sanitizeHTML(note.author)}</p>
                    <div class="rating">
                        <span class="stars">${'⭐'.repeat(Math.floor(note.rating || 0))}</span>
                        <span>${(note.rating || 0).toFixed(1)}(${note.reviews || 0})</span>
                    </div>
                    <div class="note-price">${formatCurrency(note.price)}</div>
                    <div class="note-actions" onclick="event.stopPropagation()">
                        ${Auth.isLoggedIn() ? `
                            <button class="btn btn-outline" onclick="Cart.add(${note.id})">Add to Cart</button>
                            <button class="btn btn-primary" onclick="Cart.buyNow(${note.id})">Buy Now</button>
                        ` : `
                            <button class="btn btn-outline" onclick="showModal('loginModal')">Login to Buy</button>
                        `}
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Search notes with enhanced functionality
    search: function() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            this.render();
            return;
        }
        
        if (this.config.useAPI) {
            this.searchAPI(searchTerm);
        } else {
            const filteredNotes = DataService.searchNotes(searchTerm);
            this.render(filteredNotes);
            showNotification(`Found ${filteredNotes.length} notes for "${searchTerm}"`, 'info');
        }
    },

    // API search function
    searchAPI: async function(searchTerm) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}?endpoint=notes/search&q=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            
            if (data.success) {
                this.render(data.data || data.notes);
                showNotification(`Found ${data.data?.length || 0} notes for "${searchTerm}"`, 'info');
            } else {
                showNotification('Search failed', 'error');
            }
        } catch (error) {
            console.error('Search error:', error);
            showNotification('Search error occurred', 'error');
        }
    },

    // Filter notes by category and price
    filter: function() {
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        
        if (!categoryFilter || !priceFilter) return;
        
        let filteredNotes = DataService.getAllNotes();
        
        // Filter by category
        const selectedCategory = categoryFilter.value;
        if (selectedCategory) {
            filteredNotes = DataService.getNotesBySubject(selectedCategory);
        }
        
        // Filter by price
        const selectedPrice = priceFilter.value;
        if (selectedPrice) {
            const [min, max] = selectedPrice.split('-').map(Number);
            filteredNotes = filteredNotes.filter(note => {
                if (max) {
                    return note.price >= min && note.price <= max;
                } else {
                    return note.price >= min;
                }
            });
        }
        
        this.render(filteredNotes);
    },

    // Clear all filters
    clearFilters: function() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (priceFilter) priceFilter.value = '';
        
        this.render();
    },

    // Preview note in modal
    preview: function(noteId) {
        const note = DataService.getNoteById(noteId);
        if (!note) return;
        
        this.currentPreviewNote = note;
        
        // Update preview modal content
        this.updatePreviewModal(note);
        showModal('notePreviewModal');
    },

    // Update preview modal with note data
    updatePreviewModal: function(note) {
        const elements = {
            title: document.getElementById('previewTitle'),
            noteTitle: document.getElementById('previewNoteTitle'),
            author: document.getElementById('previewAuthor'),
            description: document.getElementById('previewDescription'),
            price: document.getElementById('previewPrice'),
            pages: document.getElementById('previewPages'),
            rating: document.getElementById('previewRating'),
            features: document.getElementById('previewFeatures'),
            reviews: document.getElementById('previewReviews')
        };

        if (elements.title) elements.title.textContent = 'Note Preview';
        if (elements.noteTitle) elements.noteTitle.textContent = note.title;
        if (elements.author) elements.author.textContent = `by ${note.author}`;
        if (elements.description) elements.description.textContent = note.description;
        if (elements.price) elements.price.textContent = formatCurrency(note.price);
        if (elements.pages) elements.pages.textContent = note.pages;
        
        if (elements.rating) {
            elements.rating.innerHTML = `
                <span class="stars">${'⭐'.repeat(Math.floor(note.rating))}</span>
                <span>${note.rating}(${note.reviews})</span>
            `;
        }
        
        if (elements.features && note.features) {
            elements.features.innerHTML = note.features.map(feature => 
                `<li>${sanitizeHTML(feature)}</li>`
            ).join('');
        }
        
        if (elements.reviews) {
            if (note.reviews_list && note.reviews_list.length > 0) {
                elements.reviews.innerHTML = note.reviews_list.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="user-avatar">${review.user[0]}</div>
                            <div>
                                <strong>${sanitizeHTML(review.user)}</strong>
                                <div class="stars">${'⭐'.repeat(review.rating)}</div>
                            </div>
                        </div>
                        <p>${sanitizeHTML(review.comment)}</p>
                    </div>
                `).join('');
            } else {
                elements.reviews.innerHTML = '<p>No reviews yet.</p>';
            }
        }
    },

    // Open note preview viewer (limited preview)
    openPreview: function(noteId) {
        const note = DataService.getNoteById(noteId);
        if (!note) return;
        
        this.currentPreviewNote = note;
        this.currentPreviewPage = 1;
        
        // Close the preview modal first
        closeModal('notePreviewModal');
        
        // Set up preview viewer
        const viewerTitle = document.getElementById('previewViewerTitle');
        if (viewerTitle) viewerTitle.textContent = `Preview - ${note.title}`;
        
        // Load first preview page
        this.loadPreviewPage(note, this.currentPreviewPage);
        
        // Update page controls
        this.updatePreviewPageControls();
        
        // Start preview timer
        PreviewTimer.start();
        
        // Show preview viewer
        showModal('notePreviewViewerModal');
        
        // Update purchase prompts with note data
        this.updatePreviewPurchasePrompts(note);
    },

    // Load preview page content
    loadPreviewPage: function(note, page) {
        const content = document.getElementById('previewDocumentContent');
        if (!content) return;
        
        const pageContent = this.generatePreviewPageContent(note, page);
        content.innerHTML = pageContent;
    },

    // Generate preview page content
    generatePreviewPageContent: function(note, page) {
        const chapterNumber = Math.ceil(page / 2);
        const isDeepDive = page === 3;
        
        return `
            <div class="preview-watermark-text">PREVIEW ONLY</div>
            <div class="preview-content-header">
                <h1>${sanitizeHTML(note.title)}</h1>
                <p class="author">by ${sanitizeHTML(note.author)}</p>
            </div>
            
            <div class="preview-chapter">
                <h2>Chapter ${chapterNumber} - Page ${page}</h2>
                <p>This is a preview of page ${page} from ${sanitizeHTML(note.title)}. You're seeing a limited sample of the actual content to help you make an informed purchase decision.</p>
                
                <div class="preview-key-concepts">
                    <h3>Key Concepts Covered:</h3>
                    <ul>
                        <li>Fundamental concept #${page} related to ${sanitizeHTML(note.subject)}</li>
                        <li>Detailed explanations with step-by-step examples</li>
                        <li>Practice problems and their comprehensive solutions</li>
                        <li>Visual aids, diagrams, and illustrations</li>
                        ${page === 1 ? '<li>Introduction to the subject matter</li>' : ''}
                        ${page === 2 ? '<li>Advanced concepts and applications</li>' : ''}
                        ${page === 3 ? '<li>Real-world case studies and examples</li>' : ''}
                    </ul>
                </div>
                
                <p>The full version includes much more detailed content, additional examples, practice exercises, and comprehensive explanations that are essential for mastering this subject.</p>
                
                ${isDeepDive ? `
                <div class="preview-deep-dive">
                    <h4>🔍 Deep Dive Section Preview</h4>
                    <p>This section in the full version provides advanced insights, detailed analysis, and critical thinking exercises that are crucial for truly understanding the subject matter. The preview shows only a glimpse of the comprehensive content available.</p>
                </div>
                ` : ''}
                
                <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #ffc107;">
                    <strong>⚠️ Preview Limitation:</strong> This is a simplified version. The full content includes detailed formulas, comprehensive examples, advanced concepts, and complete solutions that are not shown in this preview.
                </div>
            </div>
            
            <div class="preview-footer">
                <span>© ${new Date().getFullYear()} BINotes - Preview Mode</span>
                <span>Preview Page ${page} of ${this.maxPreviewPages} (Full version: ${note.pages} pages)</span>
            </div>
        `;
    },

    // Update preview page controls
    updatePreviewPageControls: function() {
        const pageInfo = document.getElementById('previewPageInfo');
        const prevBtn = document.getElementById('previewPrevBtn');
        const nextBtn = document.getElementById('previewNextBtn');
        
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPreviewPage} of ${this.maxPreviewPages}`;
        }
        if (prevBtn) prevBtn.disabled = this.currentPreviewPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPreviewPage >= this.maxPreviewPages;
    },

    // Navigate to previous preview page
    previousPreviewPage: function() {
        if (this.currentPreviewPage > 1) {
            this.currentPreviewPage--;
            this.loadPreviewPage(this.currentPreviewNote, this.currentPreviewPage);
            this.updatePreviewPageControls();
        }
    },

    // Navigate to next preview page
    nextPreviewPage: function() {
        if (this.currentPreviewPage < this.maxPreviewPages) {
            this.currentPreviewPage++;
            this.loadPreviewPage(this.currentPreviewNote, this.currentPreviewPage);
            this.updatePreviewPageControls();
        }
    },

    // Update purchase prompts with note data
    updatePreviewPurchasePrompts: function(note) {
        // Update all dynamic content in purchase prompts
        const pageElements = document.querySelectorAll('[data-note-pages]');
        pageElements.forEach(el => {
            el.textContent = el.textContent.replace(/\${.*?}/g, note.pages);
        });
        
        const priceElements = document.querySelectorAll('[data-note-price]');
        priceElements.forEach(el => {
            el.textContent = formatCurrency(note.price);
        });
    },

    // Handle sell note form submission
    handleSell: function(event) {
        event.preventDefault();
        
        if (!Auth.isLoggedIn()) {
            showNotification('Please login to sell notes', 'error');
            showModal('loginModal');
            return;
        }
        
        const formData = new FormData(event.target);
        const noteData = Object.fromEntries(formData);
        
        // Validate form data
        const validation = this.validateSellForm(noteData);
        if (!validation.isValid) {
            showNotification(validation.message, 'error');
            return;
        }
        
        // Process the submission
        if (this.config.useAPI) {
            this.submitNoteAPI(formData);
        } else {
            // Simulate note submission for development
            showNotification('Your note has been submitted for review! We will notify you once it\'s approved.');
            event.target.reset();
            
            // Reset file upload status
            const uploadStatus = document.getElementById('uploadStatus');
            if (uploadStatus) {
                uploadStatus.innerHTML = `
                    <div>📁 Insert File</div>
                    <p>Click to upload your notes (PDF, DOC, DOCX)</p>
                `;
                uploadStatus.parentElement.classList.remove('has-file');
            }
        }
        
        eventBus.emit('note:submitted', noteData);
    },

    // Submit note via API
    submitNoteAPI: async function(formData) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}?endpoint=notes`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Your note has been submitted for review!');
                document.getElementById('sellForm').reset();
            } else {
                showNotification(result.message || 'Submission failed', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            showNotification('Submission error occurred', 'error');
        }
    },

    // Validate sell form data
    validateSellForm: function(data) {
        const requiredFields = ['name', 'subject', 'pages', 'price'];
        
        for (let field of requiredFields) {
            if (!data[field] || data[field].toString().trim() === '') {
                return {
                    isValid: false,
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
                };
            }
        }
        
        // Validate pages
        const pages = parseInt(data.pages);
        if (isNaN(pages) || pages < 1) {
            return {
                isValid: false,
                message: 'Pages must be a positive number'
            };
        }
        
        // Validate price
        const price = parseInt(data.price);
        if (isNaN(price) || price < 1000) {
            return {
                isValid: false,
                message: 'Price must be at least Rp 1,000'
            };
        }
        
        // Check if file is uploaded
        const fileInput = document.getElementById('noteFile');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            return {
                isValid: false,
                message: 'Please upload your note file'
            };
        }
        
        // Validate file type
        const file = fileInput.files[0];
        if (!isAllowedFileType(file.name)) {
            return {
                isValid: false,
                message: 'Only PDF, DOC, and DOCX files are allowed'
            };
        }
        
        // Validate file size (check if CONFIG exists)
        const maxSize = CONFIG?.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB default
        if (file.size > maxSize) {
            return {
                isValid: false,
                message: `File size must be less than ${formatFileSize(maxSize)}`
            };
        }
        
        return { isValid: true };
    },

    // Handle file upload
    handleFileUpload: function(event) {
        const file = event.target.files[0];
        const uploadStatus = document.getElementById('uploadStatus');
        
        if (!file || !uploadStatus) return;
        
        if (!isAllowedFileType(file.name)) {
            showNotification('Only PDF, DOC, and DOCX files are allowed', 'error');
            event.target.value = '';
            return;
        }
        
        const maxSize = CONFIG?.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB default
        if (file.size > maxSize) {
            showNotification(`File size must be less than ${formatFileSize(maxSize)}`, 'error');
            event.target.value = '';
            return;
        }
        
        uploadStatus.innerHTML = `
            <div>✅ ${sanitizeHTML(file.name)}</div>
            <p>File uploaded successfully (${formatFileSize(file.size)})</p>
        `;
        uploadStatus.parentElement.classList.add('has-file');
    },

    // Initialize notes module
    init: function() {
        // Render initial notes
        this.render();
        
        // Set up search with debouncing
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            const debouncedSearch = () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.search(), 300);
            };
            
            searchInput.addEventListener('input', debouncedSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.search();
                }
            });
        }
        
        // Set up file upload handling
        const fileInput = document.getElementById('noteFile');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileUpload);
        }
        
        // Set up sell form handling
        const sellForm = document.getElementById('sellForm');
        if (sellForm) {
            sellForm.addEventListener('submit', (e) => this.handleSell(e));
        }
    }
};

// Preview Timer Module (preserved from original)
const PreviewTimer = {
    timer: null,
    timeLeft: CONFIG?.PREVIEW_TIMER || 300, // 5 minutes default
    
    start: function() {
        this.timeLeft = CONFIG?.PREVIEW_TIMER || 300;
        const timerEl = document.getElementById('previewTimeLeft');
        
        if (this.timer) clearInterval(this.timer);
        
        // Create timer display if it doesn't exist
        let timerDisplay = document.getElementById('previewTimerDisplay');
        if (!timerDisplay) {
            timerDisplay = document.createElement('div');
            timerDisplay.id = 'previewTimerDisplay';
            timerDisplay.className = 'preview-timer';
            document.body.appendChild(timerDisplay);
        }
        
        this.timer = setInterval(() => {
            const timeString = formatTime(this.timeLeft);
            
            if (timerEl) timerEl.textContent = timeString;
            timerDisplay.innerHTML = `⏰ Preview: ${timeString}`;
            
            if (this.timeLeft <= 60) {
                timerDisplay.style.background = '#dc3545';
                timerDisplay.style.animation = 'pulse 1s infinite';
            }
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.showExpired();
            }
            
            this.timeLeft--;
        }, 1000);
    },
    
    stop: function() {
        if (this.timer) clearInterval(this.timer);
        
        const timerDisplay = document.getElementById('previewTimerDisplay');
        if (timerDisplay) {
            timerDisplay.remove();
        }
    },
    
    showExpired: function() {
        const content = document.getElementById('previewDocumentContent');
        if (!content) return;
        
        const expiredOverlay = document.createElement('div');
        expiredOverlay.className = 'preview-expired show';
        expiredOverlay.innerHTML = `
            <h3>⏰ Preview Time Expired</h3>
            <p>Your 5-minute preview session has ended.</p>
            <p>Purchase the full version to continue reading all ${Notes.currentPreviewNote?.pages || 20} pages!</p>
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button class="btn btn-primary" onclick="Cart.buyNow(${Notes.currentPreviewNote?.id})">Purchase Now - ${formatCurrency(Notes.currentPreviewNote?.price || 0)}</button>
                <button class="btn btn-outline" onclick="closeModal('notePreviewViewerModal')">Close Preview</button>
            </div>
        `;
        
        content.appendChild(expiredOverlay);
        content.classList.add('preview-blur');
        
        this.stop();
    }
};

// Global functions for HTML onclick handlers
window.searchNotes = () => Notes.search();
window.filterNotes = () => Notes.filter();
window.previewNote = (id) => Notes.preview(id);
window.openNotePreview = (id) => Notes.openPreview(id);
window.previousPreviewPage = () => Notes.previousPreviewPage();
window.nextPreviewPage = () => Notes.nextPreviewPage();

// Event listener for modal close to clean up preview timer
if (typeof eventBus !== 'undefined') {
    eventBus.on('modal:closed', (modalId) => {
        if (modalId === 'notePreviewViewerModal') {
            PreviewTimer.stop();
        }
    });
}

// Initialize when DOM is ready (with safety checks)
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other modules are loaded
    setTimeout(() => {
        if (typeof Notes !== 'undefined') {
            Notes.init();
        }
    }, 100);
});