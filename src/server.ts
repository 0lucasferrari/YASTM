import app from './app';
import { env } from './shared/config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.warn(`[YASTM] Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

