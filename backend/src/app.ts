import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoute } from './routes/health.route.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
  });

  await app.register(healthRoute);

  return app;
}
