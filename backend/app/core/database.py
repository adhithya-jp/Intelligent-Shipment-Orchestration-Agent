import os
import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure
import certifi

logger = logging.getLogger(__name__)

class MongoDBClient:
    """Singleton pattern implementation for MongoDB connection."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
            cls._instance._client: Optional[MongoClient] = None
            cls._instance._db: Optional[Database] = None
        return cls._instance

    def connect(self, uri: str, db_name: str):
        """Initialize the single MongoDB connection and DB instance."""
        if self._client is None:
            try:
                # serverSelectionTimeoutMS ensures fast failure if DB is unreachable
                self._client = MongoClient(uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
                # Verify connection
                self._client.admin.command('ping')
                self._db = self._client[db_name]
                logger.info(f"Successfully connected to MongoDB database: '{db_name}'")
            except ConnectionFailure as e:
                logger.error(f"Could not connect to MongoDB: {e}")
                raise e
        return self._db

    def disconnect(self):
        """Close the MongoDB connection pool safely."""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("MongoDB connection closed.")

    @property
    def db(self) -> Database:
        """Get the database instance securely."""
        if self._db is None:
            raise RuntimeError("Database not initialized. Call connect() first.")
        return self._db

# Create the single instance that will be shared across the entire app
mongo_singleton = MongoDBClient()

def get_db() -> Database:
    """FastAPI dependency to inject the database instance into routes."""
    return mongo_singleton.db

