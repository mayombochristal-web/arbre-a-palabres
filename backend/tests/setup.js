const dbHandler = require('./db-handler');

jest.setTimeout(30000); // Increase timeout to 30s


beforeAll(async () => {
    await dbHandler.connect();
});

afterEach(async () => {
    await dbHandler.clear();
});

afterAll(async () => {
    await dbHandler.close();
});
