const express = require('express');
const bodyParser = require('body-parser');
const recommendationRoutes = require('./routes/recommendation');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/recommendation', recommendationRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
