document.addEventListener('DOMContentLoaded', () => {

       
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other open items
            const currentlyActive = document.querySelector('.faq-item.active');
            if (currentlyActive && currentlyActive !== item) {
                currentlyActive.classList.remove('active');
            }
          
            item.classList.toggle('active');
        });
    });

    const modals = {
        product: document.getElementById('product-modal'),
        cart: document.getElementById('cart-modal'),
        checkout: document.getElementById('checkout-modal'),
    };
    const modalOverlay = document.getElementById('modalOverlay');
    const allCloseButtons = document.querySelectorAll('.close-modal-btn');

    const openModal = (modalName) => {
        if (modals[modalName]) {
            modals[modalName].classList.add('active');
            if(modalOverlay) modalOverlay.classList.add('active');
        }
    };

    const closeModal = () => {
        Object.values(modals).forEach(modal => {
            if (modal) modal.classList.remove('active');
        });
        if(modalOverlay) modalOverlay.classList.remove('active');
    };

    allCloseButtons.forEach(button => button.addEventListener('click', closeModal));
    if(modalOverlay) modalOverlay.addEventListener('click', closeModal);

    let cart = JSON.parse(localStorage.getItem('freshFuelCart')) || [];
    const cartCountElement = document.querySelector('.cart-count');
    const cartIcon = document.getElementById('cartIcon');

    const saveCart = () => {
        localStorage.setItem('freshFuelCart', JSON.stringify(cart));
        updateCartUI();
    };

    const updateCartUI = () => {
        if (!cartCountElement) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;

        renderCartItems();

        if (cartIcon) {
            cartIcon.classList.add('animate');
            setTimeout(() => cartIcon.classList.remove('animate'), 300);
        }
    };
    
    const mealCards = document.querySelectorAll('.meal-card');
    mealCards.forEach(card => {
        card.addEventListener('click', () => {
            const product = {
                name: card.dataset.name,
                price: parseFloat(card.dataset.price),
                image: card.dataset.image,
                description: card.querySelector('.meal-description')?.textContent || '',
            };
            populateProductModal(product);
            openModal('product');
        });
    });

    const populateProductModal = (product) => {
        const modalImg = document.getElementById('modal-product-img');
        const modalTitle = document.getElementById('modal-product-title');
        const modalDesc = document.getElementById('modal-product-desc');
        const modalPrice = document.getElementById('modal-product-price');
        const extraInstructions = document.getElementById('extra-instructions');
        const addToCartBtn = document.getElementById('modal-add-to-cart-btn');

        if (modalImg) modalImg.src = product.image;
        if (modalTitle) modalTitle.textContent = product.name;
        if (modalDesc) modalDesc.textContent = product.description;
        if (modalPrice) modalPrice.textContent = `Php ${product.price.toFixed(2)}`;
        if (extraInstructions) extraInstructions.value = '';
        if (addToCartBtn) addToCartBtn.dataset.product = JSON.stringify(product);
    };

    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');
    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', (e) => {
            const product = JSON.parse(e.target.dataset.product);
            const instructions = document.getElementById('extra-instructions').value.trim();

            addToCart({ ...product, instructions });
            closeModal();
        });
    }
    
    const addToCart = (newItem) => {
        newItem.cartItemId = Date.now().toString();
        newItem.quantity = 1;
        cart.push(newItem);
        saveCart();
    };

    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            renderCartItems();
            openModal('cart');
        });
    }
    
    const renderCartItems = () => {
        const container = document.getElementById('cart-items-container');
        const totalPriceEl = document.getElementById('cart-total-price');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        if (!container || !totalPriceEl || !checkoutBtn) return;

        container.innerHTML = '';
        
        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
            checkoutBtn.disabled = true;
        } else {
            checkoutBtn.disabled = false;
        }
        
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        ${item.instructions ? `<div class="cart-item-instructions">Notes: ${item.instructions}</div>` : ''}
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-item-price">Php ${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-id="${item.cartItemId}" data-action="decrease">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" data-id="${item.cartItemId}" data-action="increase">+</button>
                        </div>
                        <button class="remove-item-btn" data-id="${item.cartItemId}">Remove</button>
                    </div>
                </div>
            `;
            container.innerHTML += itemHTML;
        });
        
        totalPriceEl.textContent = `Php ${total.toFixed(2)}`;
    };

    const cartItemsContainer = document.getElementById('cart-items-container');
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            const cartItemId = target.dataset.id;
            if (!cartItemId) return;

            if (target.classList.contains('quantity-btn')) {
                const action = target.dataset.action;
                updateQuantity(cartItemId, action);
            }
            if (target.classList.contains('remove-item-btn')) {
                removeFromCart(cartItemId);
            }
        });
    }

    const updateQuantity = (cartItemId, action) => {
        const item = cart.find(i => i.cartItemId === cartItemId);
        if (item) {
            if (action === 'increase') {
                item.quantity++;
            } else if (action === 'decrease') {
                item.quantity--;
                if (item.quantity <= 0) {
                    removeFromCart(cartItemId);
                    return;
                }
            }
            saveCart();
        }
    };
    
    const removeFromCart = (cartItemId) => {
        cart = cart.filter(item => item.cartItemId !== cartItemId);
        saveCart();
    };

      const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                closeModal();
                openModal('checkout');
                
                document.getElementById('checkout-address-step').style.display = 'block';
                document.getElementById('checkout-receipt-step').style.display = 'none';
                document.getElementById('delivery-name').value = ''; 
                document.getElementById('delivery-address').value = ''; 
            }
        });
    }

      const generateReceiptContent = (deliveryName, deliveryAddress) => {
        const container = document.getElementById('receipt-container');
        if (!container) return;
        let total = 0;
        let receiptHTML = `
            <div class="receipt-header">
                <div class="logo">Nutri<span>Prep</span></div>
                <div>Order Summary</div>
                <div>${new Date().toLocaleString()}</div>
            </div>
            <div class="receipt-delivery-info">
                <strong>Deliver to:</strong>
                <p><strong>${deliveryName}</strong></p>
                <p>${deliveryAddress.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            receiptHTML += `
                <div class="receipt-item with-image">
                    <img src="${item.image}" alt="${item.name}" class="receipt-item-img">
                    <div class="receipt-item-info">
                        <div class="receipt-item-line">
                            <span>${item.quantity}x ${item.name}</span>
                            <span>Php ${itemTotal.toFixed(2)}</span>
                        </div>
                        ${item.instructions ? `<div class="receipt-item-instructions">Notes: ${item.instructions}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        receiptHTML += `
            <div class="receipt-total">
                <span>TOTAL</span>
                <span>Php ${total.toFixed(2)}</span>
            </div>
        `;

        container.innerHTML = receiptHTML;
        container.style.display = 'block';
    };

  document.getElementById('confirm-address-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('delivery-name');
    const addressInput = document.getElementById('delivery-address');
    const nameError = document.getElementById('name-error');
    const addressError = document.getElementById('address-error');

    const deliveryName = nameInput.value.trim();
    const deliveryAddress = addressInput.value.trim();

    nameError.style.display = 'none';
    addressError.style.display = 'none';

    let isValid = true;

    if (deliveryName === '') {
        nameError.style.display = 'block';
        isValid = false;
    }

    if (deliveryAddress === '') {
        addressError.style.display = 'block';
        isValid = false;
    }

    if (!isValid) {
        return; 
    }
    
    generateReceiptContent(deliveryName, deliveryAddress);

    document.getElementById('checkout-address-step').style.display = 'none';
    document.getElementById('checkout-receipt-step').style.display = 'block';
});
    
  document.getElementById('download-receipt-btn').addEventListener('click', async () => {
        const receiptNode = document.getElementById('receipt-container');
        if (!receiptNode) return;

        const printWidth = '580px'; 
        
        const originalStyle = receiptNode.style.cssText;

        try {
            
            receiptNode.style.width = printWidth;
            receiptNode.style.boxSizing = 'border-box'; 

            const canvas = await html2canvas(receiptNode, {
                useCORS: true,
                backgroundColor: '#ffffff',
                scale: 2,
            });

            const link = document.createElement('a');
            link.download = `NutriPrep_Receipt_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            cart = [];
            saveCart();
            setTimeout(closeModal, 500);

        } catch (error) {
            console.error('Oops, something went wrong with html2canvas!', error);
            alert('Sorry, there was an error creating your receipt image.'); 
        } finally {
           
            receiptNode.style.cssText = originalStyle;
        }
    });

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuBtn && mainNav && closeMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => { mainNav.classList.add('active'); });
        closeMenuBtn.addEventListener('click', () => { mainNav.classList.remove('active'); });
    }

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            mealCards.forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.category.includes(filter)) ? 'flex' : 'none';
            });
        });
    });

    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        observer.observe(el);
    });
    
    updateCartUI();

     const modalInputs = document.querySelectorAll('.modal input[type="text"], .modal textarea');

    const smoothScrollToInput = (e) => {
        
        setTimeout(() => {
            e.target.scrollIntoView({
                behavior: 'smooth',
                block: 'center', 
            });
        }, 100);
    };

    modalInputs.forEach(input => {
        input.addEventListener('focus', smoothScrollToInput);
    });
});