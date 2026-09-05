import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import carsRouter from './routes/cars.js';
import leadsRouter from './routes/leads.js';
import featuredRouter from './routes/featured.js';
import brandsShowcaseRouter from './routes/brands.js';

const app = express();
app.use(cors());
app.use(express.json());

// featured/brands-showcase смонтированы ДО carsRouter, иначе GET /api/cars/:id
// перехватит /api/cars/featured и /api/cars/brands-showcase как id.
app.use('/api/cars/featured', featuredRouter);
app.use('/api/cars/brands-showcase', brandsShowcaseRouter);
app.use('/api/cars', carsRouter);
app.use('/api/leads', leadsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ error: 'not_found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`AJ Import API запущен на :${port}`));
