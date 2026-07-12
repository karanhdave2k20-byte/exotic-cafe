const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aura';
const client = new MongoClient(uri);

let db = null;

async function connectDb() {
  if (db) return db;
  
  try {
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB successfully');
    
    // Auto-seed the tables collection
    await seedTables(db);
    
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

async function seedTables(database) {
  try {
    const tablesCol = database.collection('tables');
    const count = await tablesCol.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding default tables in MongoDB...');
      const defaultTables = [
        { id: 1, status: 'Free', seats: 4, guestNames: [] },
        { id: 2, status: 'Free', seats: 2, guestNames: [] },
        { id: 3, status: 'Free', seats: 6, guestNames: [] },
        { id: 4, status: 'Free', seats: 4, guestNames: [] },
        { id: 5, status: 'Free', seats: 4, guestNames: [] },
        { id: 6, status: 'Free', seats: 2, guestNames: [] },
        { id: 7, status: 'Free', seats: 8, guestNames: [] },
        { id: 8, status: 'Free', seats: 4, guestNames: [] }
      ];
      await tablesCol.insertMany(defaultTables);
      console.log('✅ Tables seeded successfully');
    }
  } catch (err) {
    console.error('❌ Error seeding tables:', err.message);
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDb() first.');
  }
  return db;
}

module.exports = {
  connectDb,
  getDb,
  client
};
