import json
import boto3
import os

def save_record(data):
    with open('config/storage_config.json') as f:
        config = json.load(f)

    if config['storage_type'] == 'local':
        path = config['file_path']
        os.makedirs(os.path.dirname(path), exist_ok=True)
        try:
            with open(path, 'r') as file:
                records = json.load(file)
        except FileNotFoundError:
            records = []

        records.append(data)
        with open(path, 'w') as file:
            json.dump(records, file, indent=2)
        return path

    elif config['storage_type'] == 's3':
        s3 = boto3.client('s3')
        bucket = config['s3_bucket']
        key = config['s3_key']
        try:
            obj = s3.get_object(Bucket=bucket, Key=key)
            records = json.loads(obj['Body'].read())
        except s3.exceptions.NoSuchKey:
            records = []

        records.append(data)
        s3.put_object(Bucket=bucket, Key=key, Body=json.dumps(records))
        return f"s3://{bucket}/{key}"