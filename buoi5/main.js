const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/user-role-db';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Routes
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');


app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
