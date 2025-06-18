from dotenv import load_dotenv
import os

load_dotenv()

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
REGION = os.getenv("AWS_DEFAULT_REGION")
DYNAMODB_TABLE = os.getenv("DYNAMODB_TABLE_NAME")
S3_BUCKET = os.getenv("S3_BUCKET_NAME")