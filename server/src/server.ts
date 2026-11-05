import { ENV } from './config/env.js';
import app from './app.js';

const PORT = ENV.PORT;
const server = app.listen(PORT, () => {
  console.log(`HelpDesk AI API server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
