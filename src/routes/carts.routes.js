import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const cartsRouter = Router();

//Leer productos de carts.json
const readCartsFile = () => {
    const data = fs.readFileSync('./data/carts.json', 'utf-8');
    return JSON.parse(data);
};

//Guardar productos en carts.json
const writeCartsFile = (data) => {
    fs.writeFileSync('./data/carts.json', JSON.stringify(data, null, 2));
};

//Crear nuevo carrito
cartsRouter.post('/', (req, res) => {
    const carts = readCartsFile();
    const newCart = {
        id: uuidv4(),
        products: []
    };
    carts.push(newCart);
    writeCartsFile(carts);
    res.status(201).json(newCart);
});

//Listar los productos de un carrito
cartsRouter.get('/:cid', (req, res)  => {
    const carts = readCartsFile();
    const cart = carts.find(c => c.id === req.params.cid);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado'})
    };
    res.json(cart.products);
});

//Agregar productos a un carrito
cartsRouter.post('/:cid/product/:pid', (req, res) =>{
    const carts = readCartsFile();
    const cart = carts.find(c => c.id === req.params.cid);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado'})
    };
    const existingProduct = cart.products.find(p => p.product === req.params.pid);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }
    writeCartsFile(carts);
    res.status(200).json(cart);
});

export default cartsRouter