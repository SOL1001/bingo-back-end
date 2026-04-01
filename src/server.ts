import 'dotenv/config';
import { connectDB } from './lib/db';
import app from './app';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
