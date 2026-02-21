const mongoose = require('mongoose');
const Contact = require('./models/Contact'); // Ensure this path is correct relative to where you run the script

async function verify() {
    try {
        await mongoose.connect('mongodb://localhost:27017/church');
        console.log('Connected to DB');

        const count = await Contact.countDocuments();
        console.log(`Count in collection '${Contact.collection.name}': ${count}`);

        const docs = await Contact.find().sort({ createdAt: -1 }).limit(1);
        console.log('Latest document:', docs);

        // Optional: Create a test document if empty
        if (count === 0) {
            console.log('Collection is empty. Creating test document...');
            const testContact = new Contact({
                name: 'Verification Bot',
                email: 'verify@bot.com',
                message: 'This is a verification message to ensure persistence.'
            });
            await testContact.save();
            console.log('Test document saved.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

verify();
