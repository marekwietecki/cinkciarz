require('dotenv').config
const express = require('express');
const app = express();
const PORT = process.env.PORT || 19000;

// Middleware
app.use(express.json());


// Routes
const authRoutes = require('./routes/authRoutes');
const nbpRoutes = require('./routes/nbpRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/nbp', nbpRoutes);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});