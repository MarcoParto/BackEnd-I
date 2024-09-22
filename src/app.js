import express from 'express';
import { Server } from 'socket.io';
import exphbs from 'express-handlebars';
import __dirname from './utils.js';
import fs from 'fs';
import path from 'path';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';

const app = express();

// Inicializando el servidor
const httpServer = app.listen(8080, () => {
    console.log("El servidor está escuchando en el puerto 8080...");
});

// Servidor socket
const io = new Server(httpServer);

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Handlebars
const hbs = exphbs.create(); 
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

// Carpeta 'public' para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Vista "home.handlebars" para listar productos
app.get('/', (req, res) => {
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf-8'));
    res.render('home', { products });
});

// Vista "realTimeProducts.handlebars" con WebSocket
app.get('/realtimeproducts', (req, res) => {
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf-8'));
    res.render('realTimeProducts', { products });
});

// Manejo de conexión WebSocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Emitir productos al cliente
    socket.emit('updateProducts', JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf-8')));

    // Escuchar evento de agregar producto
    socket.on('newProduct', (newProduct) => {
        let products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf-8'));
        products.push(newProduct);
        fs.writeFileSync(path.join(__dirname, 'data/products.json'), JSON.stringify(products, null, 2));
        io.emit('updateProducts', products); 
    });

    // Escuchar evento de eliminar producto
    socket.on('deleteProduct', (productId) => {
        let products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf-8'));
        products = products.filter(p => p.id !== productId);
        fs.writeFileSync(path.join(__dirname, 'data/products.json'), JSON.stringify(products, null, 2));
        io.emit('updateProducts', products); 
    });
});

export { io };
