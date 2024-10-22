import { Router } from 'express';
import Product from '../models/Product.js';

const productsRouter = Router();

// Obtener todos los productos con paginación, filtros y orden
productsRouter.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filters = query ? { $or: [{ category: query }, { status: query }] } : {};

    const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {},
    };

    try {
        const result = await Product.paginate(filters, options);
        const { docs, totalPages, page, hasPrevPage, hasNextPage } = result;

        const buildLink = (targetPage) => {
            let link = `/api/products?page=${targetPage}&limit=${limit}`;
            if (sort) link += `&sort=${sort}`;
            if (query) link += `&query=${query}`;
            return link;
        };

        const response = {
            status: 'success',
            payload: docs,
            totalPages,
            prevPage: hasPrevPage ? page - 1 : null,
            nextPage: hasNextPage ? page + 1 : null,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? buildLink(page - 1) : null,
            nextLink: hasNextPage ? buildLink(page + 1) : null,
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Obtener un producto por ID
productsRouter.get('/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar un nuevo producto
productsRouter.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const newProduct = new Product({
            title,
            description,
            code,
            price,
            status: true, 
            stock,
            category,
            thumbnails,
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un producto por ID
productsRouter.put('/:pid', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.pid,
            { title, description, code, price, stock, category, thumbnails },
            { new: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un producto por ID
productsRouter.delete('/:pid', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.pid);

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default productsRouter;
