const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
    // Prevent multiple connections
    if (mongoose.connection.readyState !== 0) {
        return;
    }

    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.close = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
    if (mongod) {
        await mongod.stop();
    }
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clear = async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    }
};
