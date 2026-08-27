from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['water-management']
tickets = db['service_tickets'].find()

print(f"{'ID':<25} | {'COMM_ID':<25} | {'FLAT':<10} | {'ISSUE'}")
for t in tickets:
    comm_id = str(t.get('communityId', 'MISSING'))
    print(f"{str(t['_id']):<25} | {comm_id:<25} | {t.get('flatNumber', 'N/A'):<10} | {t.get('issueType', 'N/A')}")
