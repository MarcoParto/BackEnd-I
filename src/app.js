import express from 'express';
import { Server } from 'socket.io';
import exphbs from 'express-handlebars';
import path from 'path';
import mongoose from 'mongoose';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import __dirname from './utils.js';
import Product from './models/Product.js';

const app = express();

// Conectar a la base de datos de MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce')
    .then(() => {
        console.log('Conectado a MongoDB');
    })
    .catch((error) => {
        console.error('Error al conectar a MongoDB', error);
    });


// Iniciar el servidor en el puerto 8080
const httpServer = app.listen(8080, () => {
    console.log("El servidor está escuchando en el puerto 8080...");
});

// Inicializar servidor WebSocket con socket.io
const io = new Server(httpServer);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);   

// Configuración de Handlebars
const hbs = exphbs.create({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,  
        allowProtoMethodsByDefault: true      
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));;

app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la vista "home"
app.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('home', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al cargar productos' });
    }
});

// Ruta para la vista "realTimeProducts" con WebSocket
app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('realTimeProducts', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al cargar productos en tiempo real' });
    }
});

// Configuración de WebSocket para conexión y eventos en tiempo real
io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    const products = await Product.find();
    socket.emit('updateProducts', products);

    socket.on('newProduct', async (newProductData) => {
        try {
            const newProduct = new Product(newProductData);
            await newProduct.save();
            const updatedProducts = await Product.find();  
            io.emit('updateProducts', updatedProducts);   
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            await Product.findByIdAndDelete(productId);
            const updatedProducts = await Product.find();
            io.emit('updateProducts', updatedProducts);  
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    });
});

export { io };
