const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/church';
        const conn = await mongoose.connect(connUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 8000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        console.warn('Backend server running. Database operations will retry upon incoming connection or Atlas config.');
    }
};

module.exports = connectDB;
