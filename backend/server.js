'use strict';
require('dotenv').config();
require('dotenv').config({ path: 'secret.env' });
require('dotenv').config({ path: 'aws.env' });
require('dotenv').config({ path: 'monday.env' });
require('dotenv').config({ path: 'google.env' });

const cors = require('cors');
//const helmet = require('helmet');
//const passport = require('passport');
//const session = require('express-session');
//const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const authRoutes = require('./auth/auth.routers');
const clientsRoutes = require('./clientes/clientes.routers');
const vehiclesRoutes = require('./vehiculos/vehiculos.routers');
const fasecoldaRoutes = require('./fasecolda/fasecolda.routes');
const suppliersRoutes = require('./proveedores/proveedores.routers');
const inventoriesRoutes = require('./inventarios/inventarios.routers');
const cuentaPagar = require('./cuentaPagar/cuentaPagar.routers');
const cuentaPagarFija = require('./cuentaPagarFija/cuentaPagarFija.routers');
const inventarioIniciales = require('./inventarioIniciales/inventarioIniciales.routers');
const generatorRoutes = require('./generador/generador.routers');
const tramitadoresRoutes = require('./tramitadores/tramitadores.routers');
const disponibleRoutes = require('./disponibleBancos/disponibleBancos.routers');
const comisionesRoutes = require('./comisiones/comisiones.routers');
const costosTramitesRouters = require('./costosTramites/costosTramites.routers');
const bancosRouters = require('./bancos/bancos.routers');
const variablesRouters = require('./variables/variables.routers');
const crediosRouters = require('./creditos/creditos.routers');
const tramitesRouters = require('./tramites/tramites.routers');
const cotizacionesRouters = require('./cotizaciones/cotizaciones.routers');
const ordenesRouters = require('./ordenDeTrabajo/ordenDeTrabajo.routers');
const sitiosWebRouters = require('./sitiosWeb/sitiosWeb.routers');
const emailRouters = require('./email/email.routers');
const express = require('express');
const http = require('http');
const conectarDB = require('./config/db');
const socket = require('./socket');

// Conexión a MongoDB
conectarDB();

const app = express();
const server = http.createServer(app);
socket.init(server);

const router = express.Router();

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bodyParserJSON = bodyParser.json({ limit: '100mb' });
const bodyParserURLEncoded = bodyParser.urlencoded({ extended: true, limit: '100mb' });

app.use(cookieParser());
app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);

// Configuraciones de seguridad
//app.use(helmet());
//app.use(cors());

app.use(cors({
    origin: ['http://localhost:4200', 'https://acstech.com.co'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


mongoose.connect(process.env.DB_MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/*
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.DB_MONGO,
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true, // true cuando se usa HTTPS
        sameSite: 'Lax'
    }
}));

// Configurar Passport
app.use(passport.initialize());
app.use(passport.session());
// Importar y configurar Passport
require('./passport-config')(passport);
*/

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use('/api', router);
authRoutes(router);
clientsRoutes(router);
vehiclesRoutes(router);
suppliersRoutes(router);
inventoriesRoutes(router);
generatorRoutes(router);
costosTramitesRouters(router);
tramitadoresRoutes(router);
comisionesRoutes(router);
bancosRouters(router);
crediosRouters(router);
tramitesRouters(router);
cotizacionesRouters(router);
sitiosWebRouters(router);
variablesRouters(router);
ordenesRouters(router);
cuentaPagar(router);
cuentaPagarFija(router);
inventarioIniciales(router);
disponibleRoutes(router);
fasecoldaRoutes(router);
emailRouters(router);

server.listen(process.env.PORT || 4000, () => {
    console.log('El servidor está arriba');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});