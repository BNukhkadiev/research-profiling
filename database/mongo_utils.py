# mongo_utils.py
from pymongo import MongoClient

# If you run MongoDB locally:
MONGO_URI = "mongodb://localhost:27017/"
# Or if you have MongoDB Atlas:
# MONGO_URI = "mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)

# Name your database:
db = client["myDatabase"]
