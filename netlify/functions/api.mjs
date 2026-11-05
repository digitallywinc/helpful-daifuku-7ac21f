import serverless from 'serverless-http';
import app from '../../server/dist/app.js';

const expressHandler = serverless(app);

// Netlify removes the function prefix during a rewrite. Restore /api so the
// existing Express routes continue to receive their expected URL paths.
export const handler = async (event, context) => {
  const originalPath = event.path || '/';
  const cleanPath = originalPath.replace(/^\/.netlify\/functions\/api/, '') || '/';
  event.path = cleanPath.startsWith('/api')
    ? cleanPath
    : `/api${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
  return expressHandler(event, context);
};
