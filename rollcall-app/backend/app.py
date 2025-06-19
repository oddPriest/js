from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from utils.storage_handler import save_record

app = Flask(__name__)
CORS(app)

# 記録エンドポイント
@app.route('/api/record', methods=['POST'])
def record_data():
    data = request.json
    with open('config/record_schema.json') as f:
        schema = json.load(f)
    
    # 簡易バリデーション
    for field in schema['fields']:
        name = field['name']
        if field['required'] and name not in data:
            return jsonify({"error": f"{name} is required"}), 400
    
    # 保存処理（local または S3）
    result = save_record(data)
    return jsonify({"message": "記録成功", "saved_to": result})