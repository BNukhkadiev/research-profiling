# test_mongo.py
from pymongo import MongoClient

# Connect to the local MongoDB server
client = MongoClient("mongodb://localhost:27017/")

# Create or select a database named 'myDatabase'
db = client["myDatabase"]

# Insert a test document into a collection named 'testCollection'
result = db.testCollection.insert_one({"message": "Hello, MongoDB!"})
print("Inserted document ID:", result.inserted_id)

# Query all documents in 'testCollection'
documents = list(db.testCollection.find({}))
print("All documents:", documents)
