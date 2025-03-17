import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Load environment variables from a .env file (if present)
load_dotenv()

# Load CSV file path from an environment variable or default filename
csv_file = os.getenv("CSV_FILE_PATH", "articles_list.csv")

# Database connection details from environment variables
DB_USER = os.getenv("DB_USER", "your_username")
DB_PASSWORD = os.getenv("DB_PASSWORD", "your_password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "your_database")
TABLE_NAME = os.getenv("TABLE_NAME", "articles")  # Change if needed

# Construct the database connection URL
db_url = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

try:
    # Load CSV into Pandas DataFrame
    data = pd.read_csv(csv_file)
    print(f"✅ Successfully loaded '{csv_file}' with {data.shape[0]} rows and {data.shape[1]} columns.")

    # Connect to the PostgreSQL database
    engine = create_engine(db_url)

    # Write DataFrame to PostgreSQL table
    data.to_sql(TABLE_NAME, engine, if_exists="replace", index=False)
    print(f"🚀 Data from '{csv_file}' successfully loaded into the '{TABLE_NAME}' table!")

except FileNotFoundError:
    print(f"❌ Error: CSV file '{csv_file}' not found. Please check the path.")
except Exception as e:
    print(f"❌ Error: {e}")
