import express from 'express';
import productsRouter from './routes/products.routes';
import cartsRouter from './routes/carts.routes';

const app = express();

//Inicializando el servidor
app.listen(8080, () => {
    console.log("El servidor esta escuchando...")
})

//Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//Implementamos routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);