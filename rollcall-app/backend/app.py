from flask import Flask, request, jsonify
from aws import dynamo, s3

app = Flask(__name__)

@app.route("/api/record", methods=["POST"])
def record_data():
    data = request.json
    dynamo.save_record(data)
    return jsonify({"message": "記録を保存しました"})

@app.route("/api/records", methods=["GET"])
def list_records():
    records = dynamo.get_records()
    return jsonify(records)

@app.route("/api/upload", methods=["POST"])
def upload_file():
    file = request.files['file']
    s3.upload_file(file, file.filename)
    return jsonify({"url": s3.generate_file_url(file.filename)})

if __name__ == "__main__":
    app.run(port=5000)