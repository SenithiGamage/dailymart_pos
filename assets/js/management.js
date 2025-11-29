console.log("management.js loaded");

// LocalStorage Helpers
function getFromStorage(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Initial Data
const initialProducts = [
    { id: 1, name: 'Milk (1L)', price: 475.00, imagePath: 'assets/img/milk.jpg' },
    { id: 2, name: 'Bread Loaf', price: 171.00, imagePath: 'assets/img/bread.jpg' },
    { id: 3, name: 'Eggs (Dozen)', price: 435.00, imagePath: 'assets/img/eggs.jpg' },
    { id: 4, name: 'Apples (Kg)', price: 780.00, imagePath: 'assets/img/apples.jpg' },
    { id: 5, name: 'Water Bottle', price: 100.00, imagePath: 'assets/img/water bottle.jpg' },
    { id: 6, name: 'Detergent', price: 285.00, imagePath: 'assets/img/detergent.jpg' },
    { id: 7, name: 'Potato Chips', price: 220.00, imagePath: 'assets/img/potato chips.jpg' },
    { id: 8, name: 'Tomato Sauce', price: 290.00, imagePath: 'assets/img/tomato sauce.jpg' },
    { id: 9, name: 'Cheese (250g)', price: 453.00, imagePath: 'assets/img/cheese.jpg' },
    { id: 10, name: 'Sugar (1kg)', price: 230.00, imagePath: 'assets/img/sugar.jpg' },
];

const initialCustomers = [
    { id: 1, name: 'John Doe', phone: '0711234567', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', phone: '0779876543', email: 'jane@example.com' },
];

// Product CRUD (unchanged from your version)
window.getProducts = function () {
    let products = getFromStorage('products');
    if (products.length === 0) {
        products = initialProducts;
        saveToStorage('products', products);
    }
    return products;
};

window.addProduct = function (product) {
    let products = window.getProducts();
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    product.id = newId;
    products.push(product);
    saveToStorage('products', products);
    return product;
};

window.updateProduct = function (updatedProduct) {
    let products = window.getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
        products[index] = updatedProduct;
        saveToStorage('products', products);
        return true;
    }
    return false;
};

window.deleteProduct = function (id) {
    let products = window.getProducts();
    products = products.filter(p => p.id !== id);
    saveToStorage('products', products);
    return true;
};

// Render Products Table (unchanged)
function renderProductsTable() {
    const tbody = document.getElementById('product-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    window.getProducts().forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td><img src="${p.imagePath || 'assets/img/placeholder.jpg'}" width="50" height="50" class="rounded"></td>
            <td>${p.name}</td>
            <td>Rs.${p.price.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProductHandler(${p.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteProductHandler = function (id) {
    if (confirm('Delete this product permanently?')) {
        window.deleteProduct(id);
        renderProductsTable();
        if (typeof refreshProducts === 'function') refreshProducts();
    }
};

window.editProduct = function (id) {
    const product = window.getProducts().find(p => p.id === id);
    if (!product) return alert('Product not found');

    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image-path').value = product.imagePath || '';
    document.getElementById('productModalLabel').textContent = 'Edit Product';

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
};

// Product Form Handler (unchanged)
document.getElementById('productForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const imagePath = document.getElementById('product-image-path').value.trim() || 'assets/img/placeholder.jpg';

    if (!name || isNaN(price) || price <= 0) return alert('Please fill all required fields');

    if (id) {
        window.updateProduct({ id: parseInt(id), name, price, imagePath });
        alert('Product updated!');
    } else {
        window.addProduct({ name, price, imagePath });
        alert('Product added!');
    }

    renderProductsTable();
    if (typeof refreshProducts === 'function') refreshProducts();

    this.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('productModalLabel').textContent = 'Add New Product';
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
});

// Customer CRUD (unchanged from previous)
window.getCustomers = function () {
    let customers = getFromStorage('customers');
    if (customers.length === 0) {
        customers = initialCustomers;
        saveToStorage('customers', customers);
    }
    return customers;
};

window.addCustomer = function (customer) {
    let customers = window.getCustomers();
    const newId = Math.max(...customers.map(c => c.id), 0) + 1;
    customer.id = newId;
    customers.push(customer);
    saveToStorage('customers', customers);
    return customer;
};

window.updateCustomer = function (updatedCustomer) {
    let customers = window.getCustomers();
    const index = customers.findIndex(c => c.id === updatedCustomer.id);
    if (index !== -1) {
        customers[index] = updatedCustomer;
        saveToStorage('customers', customers);
        return true;
    }
    return false;
};

window.deleteCustomer = function (id) {
    let customers = window.getCustomers();
    customers = customers.filter(c => c.id !== id);
    saveToStorage('customers', customers);
    return true;
};

function renderCustomersTable() {
    const tbody = document.getElementById('customer-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const customers = window.getCustomers();

    customers.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.email || '-'}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="editCustomer(${c.id})">
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomerHandler(${c.id})">
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editCustomer = function (id) {
    const customers = window.getCustomers();
    const customer = customers.find(c => c.id === id);
    if (!customer) return alert('Customer not found');

    document.getElementById('customer-id').value = customer.id;
    document.getElementById('customer-name').value = customer.name;
    document.getElementById('customer-phone').value = customer.phone;
    document.getElementById('customer-email').value = customer.email || '';

    document.getElementById('customerModalLabel').textContent = 'Edit Customer';

    const modal = new bootstrap.Modal(document.getElementById('customerModal'));
    modal.show();
};

window.deleteCustomerHandler = function (id) {
    if (confirm('Are you sure you want to delete this customer?')) {
        if (window.deleteCustomer(id)) {
            renderCustomersTable();
            alert('Customer deleted successfully!');
        } else {
            alert('Customer not found.');
        }
    }
};

document.getElementById('customerForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const id = document.getElementById('customer-id').value;
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const email = document.getElementById('customer-email').value.trim();

    if (!name || !phone) {
        alert('Name and Phone are required!');
        return;
    }

    let success = false;
    let message = '';

    if (id) {
        const updatedCustomer = { id: parseInt(id), name, phone, email };
        success = window.updateCustomer(updatedCustomer);
        message = success ? 'Customer updated!' : 'Update failed.';
    } else {
        const newCustomer = { name, phone, email };
        const added = window.addCustomer(newCustomer);
        success = !!added;
        message = success ? 'Customer added!' : 'Failed to add customer.';
    }

    if (success) {
        alert(message);
        renderCustomersTable();

        this.reset();
        document.getElementById('customer-id').value = '';
        document.getElementById('customerModalLabel').textContent = 'Add New Customer';

        bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
    } else {
        alert(message);
    }
});

// Order Functions (Improved & Fixed)
window.getOrders = function () {
    return getFromStorage('orders', []);
};

window.saveOrder = function (cart, bill) {
    let orders = window.getOrders();
    const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1001;

    const newOrder = {
        id: newId,
        date: new Date().toISOString(),
        items: cart.map(item => ({ ...item })), // Deep copy items
        subtotal: bill.subtotal,
        tax: bill.tax,
        finalBill: bill.finalBill
    };

    orders.push(newOrder);
    saveToStorage('orders', orders);
    return newOrder;
};

window.getOrderById = function (orderId) {
    const orders = window.getOrders();
    return orders.find(o => o.id === orderId);
};

// Render Orders Table (Improved with Empty State)
window.renderOrders = function () {
    const tbody = document.getElementById('order-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const orders = window.getOrders().sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first by date

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No orders yet. Complete a checkout to create one.</td></tr>';
        return;
    }

    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${new Date(order.date).toLocaleString()}</td>
            <td>${order.items.length}</td>
            <td class="fw-bold text-success">Rs.${order.finalBill.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrderDetails(${order.id})">View</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// View Order Details Modal (Fixed IDs & Added Total)
window.viewOrderDetails = function (orderId) {
    const order = window.getOrderById(orderId);
    if (!order) return alert('Order not found');

    document.getElementById('orderIdDisplay').textContent = order.id;
    document.getElementById('orderDateDisplay').textContent = new Date(order.date).toLocaleString();
    document.getElementById('orderTotalDisplay').textContent = `Rs.${order.finalBill.toFixed(2)}`; // Added this

    const detailsBody = document.getElementById('order-details-body'); // Fixed ID
    detailsBody.innerHTML = '';

    order.items.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>Rs.${item.price.toFixed(2)}</td>
            <td>Rs.${(item.price * item.quantity).toFixed(2)}</td>
        `;
        detailsBody.appendChild(tr);
    });

    document.getElementById('orderSubtotalDisplay').textContent = `Rs.${order.subtotal.toFixed(2)}`;
    document.getElementById('orderTaxDisplay').textContent = `Rs.${order.tax.toFixed(2)}`;
    document.getElementById('orderFinalBillDisplay').textContent = `Rs.${order.finalBill.toFixed(2)}`;

    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
};

// Auto-Render on Page Load (for all management pages)
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('product-table-body')) renderProductsTable();
    if (document.getElementById('customer-table-body')) renderCustomersTable();
    if (document.getElementById('order-table-body')) window.renderOrders();
});