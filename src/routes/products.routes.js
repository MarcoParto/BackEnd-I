import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { io } from '../app.js';
import __dirname from '../utils.js';

const productsRouter = Router();

// Leer productos de products.json
const readProductsFile = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al leer el archivo de productos:", error);
        return [];
    }
};

// Guardar productos en products.json
const writeProductsFile = (data) => {
    fs.writeFileSync(path.join(__dirname, 'data/products.json'), JSON.stringify(data, null, 2));
};

// Obtener todos los productos
productsRouter.get('/', (req, res) => {
    const limit = parseInt(req.query.limit) || null;
    let products = readProductsFile();
    if (limit) {
        products = products.slice(0, limit);
    };
    res.json(products);
});

// Obtener producto por ID
productsRouter.get('/:pid', (req, res) => {
    const products = readProductsFile();
    const product = products.find(p => p.id === req.params.pid);
    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    };
    res.json(product);
});

// Agregar producto
productsRouter.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const products = readProductsFile();
    const newProduct = {
        id: uuidv4(),
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails
    };
    products.push(newProduct);
    writeProductsFile(products);
    io.emit('updateProducts', products);
    res.status(201).json(newProduct);
});

// Actualizar producto
productsRouter.put('/:pid', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    let products = readProductsFile();
    const productIndex = products.findIndex(p => p.id === req.params.pid);
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    };
    const updatedProduct = { ...products[productIndex], title, description, code, price, stock, category, thumbnails };
    products[productIndex] = updatedProduct;
    writeProductsFile(products);
    io.emit('updateProducts', products);
    res.json(updatedProduct);
});

// Eliminar producto
productsRouter.delete('/:pid', (req, res) => {
    let products = readProductsFile();
    const productIndex = products.findIndex(p => p.id === req.params.pid);
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    };
    products.splice(productIndex, 1);
    writeProductsFile(products);
    io.emit('updateProducts', products);
    res.status(204).send();
});

export default productsRouter;
