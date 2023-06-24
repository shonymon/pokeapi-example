/** src/index.ts */
import http from 'http';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import routes from './routes/pokemons';

dotenv.config();

const router: Express = express();

router.use(morgan('dev'));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

/** CORS.... */
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // CORS policy
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization'); // CORS headers
    // set the mfker CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
});

/** Routes */
router.use('/', routes);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({ message: error.message });
});

/** Server */
const httpServer = http.createServer(router);
const port: any = process.env.PORT ?? 6060;
httpServer.listen(port, () => console.log(`⚡️[server]: Server is running at http://localhost:${port}`));