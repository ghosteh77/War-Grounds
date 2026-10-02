const mongoose = require('mongoose');

async function connectDatabase() {
    try {
        console.log('🔄 Connecting to MongoDB...');

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });

        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = connectDatabase;