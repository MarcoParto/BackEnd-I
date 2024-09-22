const socket = io();

// Actualizar lista de productos en tiempo real
socket.on('updateProducts', (products) => {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    products.forEach(product => {
        const li = document.createElement('li');
        li.innerHTML = `${product.title} - $${product.price} <button onclick="deleteProduct('${product.id}')">Eliminar</button>`;
        productList.appendChild(li);
    });
});

// Agregar producto mediante HTTP + WebSocket
document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        code: document.getElementById('code').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        category: document.getElementById('category').value
    };

    fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    });
});

// Eliminar producto mediante HTTP + WebSocket
function deleteProduct(id) {
    fetch(`/api/products/${id}`, {
        method: 'DELETE'
    }).then(() => {
        socket.emit('deleteProduct', id);
    });
}
