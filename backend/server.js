require('dotenv').config
const express = require('express');
const app = express();
const PORT = process.env.PORT || 19000;

// Middleware
app.use(express.json());


// Routes
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});