import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const cartsRouter = Router();

// Crear nuevo carrito
cartsRouter.post('/', async (req, res) => {
    try {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar los productos de un carrito
cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
        res.json(cart.products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar/Actualizar cantidad de un producto a un carrito
cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    const { quantity = 1 } = req.body;  
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        const product = await Product.findById(req.params.pid);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        const existingProduct = cart.products.find(p => p.product.toString() === req.params.pid);
        if (existingProduct) {
            existingProduct.quantity = quantity;
        } else {
            cart.products.push({ product: req.params.pid, quantity });
        }
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un producto del carrito
cartsRouter.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        await cart.save();
        res.status(200).json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar productos de un carrito (agregar multiples productos con cantidades especificas)
cartsRouter.put('/:cid', async (req, res) => {
    const { products } = req.body; 
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        cart.products = products;
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar todos los productos de un carrito
cartsRouter.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        cart.products = [];
        await cart.save();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Populating productos en un carrito
cartsRouter.get('/:cid/populate', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default cartsRouter;

