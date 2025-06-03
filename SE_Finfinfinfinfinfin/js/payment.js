// Payment Processing Module

const Payment = {
    // Show QRIS payment modal
    showQRIS: function() {
        const total = Cart.getTotal();
        
        // Update QRIS amount display
        const qrisAmount = document.getElementById('qrisAmount');
        if (qrisAmount) qrisAmount.textContent = formatCurrency(total);
        
        // Generate QR code
        this.generateQRCode(total);
        
        // Close checkout modal and show QRIS modal
        closeModal('checkoutModal');
        showModal('qrisModal');
        
        // Start QRIS countdown
        QRISTimer.start();
        
        // Simulate payment detection after random time (3-8 seconds)
        const randomDelay = Math.random() * 5000 + 3000;
        setTimeout(() => {
            this.simulateQRISSuccess();
        }, randomDelay);
    },

    // Generate QR code pattern
    generateQRCode: function(amount) {
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) return;
        
        // Create a visual QR code pattern
        qrContainer.innerHTML = `
            <div class="qr-pattern" data-amount="${amount}"></div>
        `;
        
        // In a real app, you would integrate with a QR code library like qrcode.js
        // For demo purposes, we use CSS to create a pattern that resembles a QR code
    },

    // Simulate QRIS payment success
    simulateQRISSuccess: function() {
        const statusIndicator = document.getElementById('qrisStatus');
        if (!statusIndicator) return;
        
        // Update status to success
        statusIndicator.className = 'status-indicator qris-success';
        statusIndicator.innerHTML = `<p>✅ Payment Successful!</p>`;
        
        // Clear timer
        QRISTimer.stop();
        
        // Hide timer display
        const timerSection = document.querySelector('.qris-timer');
        if (timerSection) timerSection.style.display = 'none';
        
        // Update actions
        const actionsSection = document.querySelector('.qris-actions');
        if (actionsSection) {
            actionsSection.innerHTML = `
                <button class="btn btn-primary" onclick="Payment.completeQRIS()" style="width: 100%;">Continue</button>
            `;
        }
        
        // Auto-complete after 2 seconds
        setTimeout(() => {
            this.completeQRIS();
        }, 2000);
    },

    // Complete QRIS payment
    completeQRIS: function() {
        this.completePurchase('QRIS');
        closeModal('qrisModal');
    },

    // Process regular payment methods
    processRegular: function(paymentMethod) {
        const payNowBtn = document.getElementById('payNowBtn');
        if (!payNowBtn) return;
        
        const originalText = payNowBtn.textContent;
        payNowBtn.innerHTML = '<span class="loading"></span> Processing...';
        payNowBtn.disabled = true;
        
        setTimeout(() => {
            this.completePurchase(paymentMethod.toUpperCase());
            closeModal('checkoutModal');
            
            // Reset button
            payNowBtn.textContent = originalText;
            payNowBtn.disabled = false;
        }, 2000);
    },

    // Complete purchase process
    completePurchase: function(paymentMethod) {
        const cartItems = Cart.getItems();
        const currentUser = Auth.getCurrentUser();
        
        if (!currentUser || cartItems.length === 0) {
            showNotification('Purchase failed. Please try again.', 'error');
            return;
        }
        
        // Create purchased notes with metadata
        const purchasedNotes = cartItems.map(note => ({
            ...note,
            purchaseDate: new Date().toISOString(),
            orderId: generateOrderId(),
            paymentMethod: paymentMethod,
            purchasePrice: note.price // Store price at time of purchase
        }));
        
        // Add to user's purchased notes
        if (!currentUser.purchasedNotes) {
            currentUser.purchasedNotes = [];
        }
        currentUser.purchasedNotes.push(...purchasedNotes);
        
        // Update user data in storage
        Auth.saveUserData(currentUser);
        
        // Clear cart
        Cart.clear();
        
        // Clear timers
        CheckoutTimer.stop();
        QRISTimer.stop();
        
        // Show success notification
        const totalAmount = Cart.getTotal();
        showNotification(`Payment successful! ${purchasedNotes.length} note(s) purchased for ${formatCurrency(totalAmount)}`);
        
        // Emit purchase event
        eventBus.emit('purchase:completed', {
            items: purchasedNotes,
            paymentMethod: paymentMethod,
            total: totalAmount
        });
        
        // Redirect to purchased notes page
        setTimeout(() => {
            showPage('purchased');
        }, 1000);
    },

    // Refresh QRIS code
    refreshQRIS: function() {
        // Reset status
        const statusIndicator = document.getElementById('qrisStatus');
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
            statusIndicator.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Waiting for payment...</p>
            `;
        }
        
        // Show timer again
        const timerSection = document.querySelector('.qris-timer');
        if (timerSection) timerSection.style.display = 'block';
        
        // Reset actions
        const actionsSection = document.querySelector('.qris-actions');
        if (actionsSection) {
            actionsSection.innerHTML = `
                <button class="btn btn-outline" onclick="closeModal('qrisModal')">Cancel Payment</button>
                <button class="btn btn-secondary" onclick="Payment.refreshQRIS()">Refresh QR Code</button>
            `;
        }
        
        // Regenerate QR code
        const total = Cart.getTotal();
        this.generateQRCode(total);
        
        // Restart countdown
        QRISTimer.start();
        
        // Simulate new payment detection
        const randomDelay = Math.random() * 5000 + 3000;
        setTimeout(() => {
            this.simulateQRISSuccess();
        }, randomDelay);
    },

    // Show QRIS timeout
    showQRISTimeout: function() {
        const statusIndicator = document.getElementById('qrisStatus');
        if (statusIndicator) {
            statusIndicator.innerHTML = `
                <p style="color: #dc3545;">⏰ Payment expired</p>
            `;
        }
        
        const actionsSection = document.querySelector('.qris-actions');
        if (actionsSection) {
            actionsSection.innerHTML = `
                <button class="btn btn-outline" onclick="closeModal('qrisModal')">Close</button>
                <button class="btn btn-primary" onclick="Payment.refreshQRIS()">Try Again</button>
            `;
        }
    }
};

// QRIS Timer Module
const QRISTimer = {
    timer: null,
    timeLeft: CONFIG.QRIS_TIMER,
    
    start: function() {
        this.timeLeft = CONFIG.QRIS_TIMER;
        const countdownEl = document.getElementById('qrisCountdown');
        
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            const timeString = formatTime(this.timeLeft);
            if (countdownEl) countdownEl.textContent = timeString;
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                Payment.showQRISTimeout();
            }
            
            this.timeLeft--;
        }, 1000);
    },
    
    stop: function() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
};

// Purchase validation
const PurchaseValidator = {
    // Validate purchase before processing
    validate: function(cartItems, user) {
        if (!user) {
            return { isValid: false, message: 'User must be logged in' };
        }
        
        if (!cartItems || cartItems.length === 0) {
            return { isValid: false, message: 'Cart is empty' };
        }
        
        // Check if user already owns any of the notes
        const userNotes = user.purchasedNotes || [];
        const duplicateNotes = cartItems.filter(cartItem => 
            userNotes.some(userNote => userNote.id === cartItem.id)
        );
        
        if (duplicateNotes.length > 0) {
            const duplicateTitles = duplicateNotes.map(note => note.title).join(', ');
            return { 
                isValid: false, 
                message: `You already own: ${duplicateTitles}` 
            };
        }
        
        // Validate cart items still exist and prices haven't changed significantly
        for (let cartItem of cartItems) {
            const currentNote = DataService.getNoteById(cartItem.id);
            if (!currentNote) {
                return { 
                    isValid: false, 
                    message: `Note "${cartItem.title}" is no longer available` 
                };
            }
            
            // Check if price has changed more than 10%
            const priceChange = Math.abs(currentNote.price - cartItem.price) / cartItem.price;
            if (priceChange > 0.1) {
                return { 
                    isValid: false, 
                    message: `Price for "${cartItem.title}" has changed. Please refresh your cart.` 
                };
            }
        }
        
        return { isValid: true };
    }
};

// Promo Code System
const PromoCodes = {
    codes: {
        'WELCOME20': { discount: 0.2, minAmount: 0, description: '20% off for new users' },
        'STUDENT10': { discount: 0.1, minAmount: 25000, description: '10% off for students' },
        'BULK50': { discount: 0.15, minAmount: 100000, description: '15% off on orders over 100k' }
    },
    
    applied: null,
    
    // Apply promo code
    apply: function(code, cartTotal) {
        const promoCode = this.codes[code.toUpperCase()];
        
        if (!promoCode) {
            return { success: false, message: 'Invalid promo code' };
        }
        
        if (cartTotal < promoCode.minAmount) {
            return { 
                success: false, 
                message: `Minimum order amount is ${formatCurrency(promoCode.minAmount)}` 
            };
        }
        
        this.applied = {
            code: code.toUpperCase(),
            ...promoCode,
            discountAmount: Math.round(cartTotal * promoCode.discount)
        };
        
        return { 
            success: true, 
            message: `Promo code applied! ${promoCode.description}`,
            discount: this.applied.discountAmount
        };
    },
    
    // Remove applied promo code
    remove: function() {
        this.applied = null;
    },
    
    // Get applied promo code
    getApplied: function() {
        return this.applied;
    },
    
    // Calculate discount amount
    getDiscount: function(cartTotal) {
        if (!this.applied) return 0;
        return Math.round(cartTotal * this.applied.discount);
    }
};

// Global functions for HTML onclick handlers
window.showQRISPayment = () => Payment.showQRIS();
window.refreshQRIS = () => Payment.refreshQRIS();
window.completeQRISPayment = () => Payment.completeQRIS();

// Event listeners
eventBus.on('modal:closed', (modalId) => {
    if (modalId === 'qrisModal') {
        QRISTimer.stop();
    }
});

// Initialize payment module
eventBus.on('app:ready', () => {
    // Any payment-specific initialization can go here
});