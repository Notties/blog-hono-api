import app from '@/app';
import { config } from '@/config';

console.log(`Server is running on port ${config.port}`);

export default {
  port: config.port,
  fetch: app.fetch,
};