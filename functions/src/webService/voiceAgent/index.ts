import { logger } from 'firebase-functions';

import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import routes from './routes';

const app = express();

// CORS and JSON parser
app.use(cors({ origin: true }));
app.use(express.json());

// Configure the trust proxy to identify the correct IPs of the users (it uses the field X-Forwarded-For that comes from the proxy)
app.set('trust proxy', true);

// Rate limiting
app.use(rateLimit({
    windowMs: 1 * 60 * 1000,    // 1 minute
    max: 60,                    // Limit each IP to 60 requests per windowMs
}));

// Add logs for debugging
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.debug(`Method: '${req.method}' Path: '${req.path}'\nHeaders: ${JSON.stringify(req.headers, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}\n`);
    next();
});

// Routes
app.use('/api/voice-agent', routes);

export default app;
