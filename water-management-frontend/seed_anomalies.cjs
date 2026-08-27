const { MongoClient } = require('mongodb');

async function main() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('waterbillingdb');
    
    // Get community
    const comm = await db.collection('communities').findOne({ name: 'Green Valley Estates' });
    if (!comm) {
        console.log("Community not found!");
        return;
    }
    const commId = comm._id.toString();

    // Insert anomalies
    const readings = [
        {
            communityId: commId,
            flatNumber: 'H-101',
            readingValue: 5000.5,
            readingDate: new Date().toISOString().split('T')[0],
            status: 'PENDING_REVIEW',
            isAnomaly: true,
            anomalyReason: 'Usage spiked by 450% compared to last month',
            source: 'IOT_SMART_METER'
        },
        {
            communityId: commId,
            flatNumber: 'H-105',
            readingValue: -15.0,
            readingDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            status: 'PENDING_REVIEW',
            isAnomaly: true,
            anomalyReason: 'Negative consumption detected (Meter Rollback?)',
            source: 'IOT_SMART_METER'
        },
        {
            communityId: commId,
            flatNumber: 'H-202',
            readingValue: 0.0,
            readingDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            status: 'PENDING_REVIEW',
            isAnomaly: true,
            anomalyReason: 'Zero usage for 30 consecutive days (Dead Meter?)',
            source: 'IOT_SMART_METER'
        }
    ];

    const res = await db.collection('meter_readings').insertMany(readings);
    
    console.log(`Inserted ${res.insertedCount} anomaly meter readings.`);
    
    await client.close();
}

main().catch(console.error);
