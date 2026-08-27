const { MongoClient } = require('mongodb');

async function main() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('waterbillingdb');
    
    // Delete tickets with undefined/null/missing communityId
    const res = await db.collection('service_tickets').deleteMany({
        $or: [
            { communityId: null },
            { communityId: { $exists: false } },
            { communityId: "undefined" }
        ]
    });
    
    console.log(`Deleted ${res.deletedCount} bad tickets.`);
    
    await client.close();
}

main().catch(console.error);
