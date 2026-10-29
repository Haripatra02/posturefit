import { createApp } from './app.js';
import { config } from './config.js';
import { isSupabaseConfigured } from './db/supabase.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 PostureFit API server running on http://localhost:${config.port}`);
  console.log(`🌐 Environment: ${config.nodeEnv}`);
  console.log(`🗄️ Database: ${isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Built-in Local Store (Offline Mode)'}`);
  console.log(`=======================================================`);
});
