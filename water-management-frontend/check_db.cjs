const { MongoClient } = require('mongodb');

async function main() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('waterbillingdb');
    const tickets = await db.collection('service_tickets').find().toArray();
    
    console.log('ID | COMM_ID | FLAT | ISSUE');
    tickets.forEach(t => {
        console.log(`${t._id} | ${t.communityId} | ${t.flatNumber} | ${t.issueType}`);
    });
    
    await client.close();
}

main().catch(console.error);
