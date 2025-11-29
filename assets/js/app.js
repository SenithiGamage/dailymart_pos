console.log("app.js loaded");

const TAX_RATE = 0.10;
let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// Refresh products from storage
function refreshProducts() {
    products = window.getProducts?.() || [];
    renderProducts();
}

// Render Products Grid
function renderProducts(list = products) {
    const container = document.getElementById('product-list');
    if (!container) return;
    container.innerHTML = '';

    list.forEach(p => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 product-card border-0 shadow-sm">
                <img src="${p.imagePath || 'assets/img/placeholder.jpg'}" class="card-img-top" alt="${p.name}" style="height: 180px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title">${p.name}</h6>
                    <p class="card-text text-danger fw-bold fs-5">Rs.${p.price.toFixed(2)}</p>
                    <button class="btn btn-primary mt-auto" onclick="addToCart(${p.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// Cart Functions
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const item = cart.find(i => i.id === id);
    if (item) item.quantity += 1;
    else cart.push({ ...product, quantity: 1 });

    saveCart();
    renderCart();
}

window.increaseQuantity = (id) => { cart.find(i => i.id === id).quantity++; saveCart(); renderCart(); };
window.decreaseQuantity = (id) => {
    const item = cart.find(i => i.id === id);
    if (item.quantity > 1) item.quantity--;
    else cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
};

window.removeFromCart = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
};

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}



function calculateBill() {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const finalBill = subtotal + tax;
    return { subtotal, tax, finalBill };
}

function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart-message">Cart is empty</div>';
    } else {
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item p-3 border rounded mb-3';
            div.innerHTML = `
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>Rs.${item.price.toFixed(2)} × ${item.quantity}</small>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">×</button>
                </div>
                <div class="mt-2 d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary" onclick="decreaseQuantity(${item.id})">-</button>
                    <span class="fw-bold">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="increaseQuantity(${item.id})">+</button>
                    <strong class="ms-auto text-primary">Rs.${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
            `;
            container.appendChild(div);
        });
    }

    const bill = calculateBill();
    document.getElementById('subtotal').textContent = `Rs.${bill.subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `Rs.${bill.tax.toFixed(2)}`;
    document.getElementById('final-bill').textContent = `Rs.${bill.finalBill.toFixed(2)}`;
}

window.clearCart = () => { cart = []; saveCart(); renderCart(); };

window.checkout = function () {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    const { subtotal, tax, finalBill } = calculateBill();
    const date = new Date().toLocaleString();

    // Professional Receipt with Perfect Alignment
    const receipt = `
╔══════════════════════════════════╗
║         D A I L Y M A R T        ║
║           P O S  S Y S T E M     ║
╚══════════════════════════════════╝

Date: ${date.padEnd(28)}

────────────────────────────────────
ITEM                  QTY   PRICE  
────────────────────────────────────
${cart.map(item => {
    const name = item.name.substring(0, 18).padEnd(18);
    const qty = String(item.quantity).padStart(3);
    const total = `Rs.${(item.price * item.quantity).toFixed(2)}`.padStart(10);
    return `${name} ${qty}  ${total}`;
}).join('\n')}

────────────────────────────────────
SUBTOTAL                    Rs.${subtotal.toFixed(2).padStart(8)}
TAX (10%)                   Rs.${tax.toFixed(2).padStart(8)}
────────────────────────────────────
TOTAL AMOUNT                Rs.${finalBill.toFixed(2).padStart(8)}

╔══════════════════════════════════╗
║     THANK YOU FOR SHOPPING!      ║
║         COME AGAIN SOON!         ║
╚══════════════════════════════════╝
    `.trim();

    // Inject into modal
    document.getElementById('receiptContent').textContent = receipt;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('receiptModal'));
    modal.show();

    // Save order & clear cart
    if (typeof window.saveOrder === 'function') {
        window.saveOrder(cart, { subtotal, tax, finalBill });
    }
    clearCart();
};
// Search
document.querySelector('input[type="search"]')?.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    renderProducts(filtered);
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    refreshProducts();
    renderCart();
    document.querySelector('input[type="search"]')?.focus();
});

// Make refreshProducts global so management.js can call it
window.refreshProducts = refreshProducts;
// Filter Products based on Search Term
function filterProducts(searchTerm) {
    const lowerCaseSearch = searchTerm.toLowerCase().trim();
    if (!lowerCaseSearch) {
        return products;
    }
    return products.filter(product =>
        product.name.toLowerCase().includes(lowerCaseSearch)
    );
}
