## 以下、勤怠管理アプリをリファクタリング
# リエンジニアリングにより仕様書作成

* Djangoによる実装

Node.js (http-server ) : フロントエンド
Django(REST API) : バックエンド

(POST): Node.js + http-server (html, css)
(FETCH): Django + Django REST Framework
 (api/attendance/*エンドポイント*)


dir 構成（フロントエンド・バックエンド）

/attendance-app
├── frontend-node/
│   ├── server.js（httpサーバ）
│   ├── views/（EJSテンプレートやHTML）
│   └── public/（CSS/JSなど）
│
└── attendance-backend/
    ├── manage.py
    ├── config/                      ← プロジェクト設定（Django本体）
    │   ├── __init__.py
    │   ├── settings.py      ← 設定ファイル（CORSやDBなど）
    │   ├── urls.py          ← ルーティング定義
    │   └── wsgi.py
    │
    ├── attendance/       ← 勤怠アプリ（アプリケーション本体）
    │   ├── __init__.py
    │   ├── admin.py      ← Django管理画面用（任意）
    │   ├── apps.py
    │   ├── models.py     ← 勤怠・ユーザーモデル定義
    │   ├── serializers.py     ← Django REST Framework用
    │   ├── views.py           ← APIロジック
    │   ├── urls.py            ← エンドポイントルーティング
    │   └── tests.py
    │
    ├── db.sqlite3 ← SQLiteデータベース（またはPostgreSQL等）
    ├── requirements.txt  ← 依存パッケージリスト
    └── README.md         ← ドキュメント（任意）

async function clockIn() {
  const userId = document.getElementById('userId').value;
  const resultElem = document.getElementById('result');

  if (!userId) {
    resultElem.textContent = 'ユーザーIDを入力してください。';
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/api/attendance/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: userId,
        clock_in: new Date().toISOString()
      })
    });

    if (response.ok) {
      const data = await response.json();
      resultElem.textContent = `出勤記録完了: ${data.clock_in}`;
    } else {
      const errorData = await response.json();
      resultElem.textContent = `エラー: ${JSON.stringify(errorData)}`;
    }
  } catch (error) {
    resultElem.textContent = '通信エラーが発生しました。';
  }
}




起動手順（http-server）
	1.	npm install -g http-server （一度だけグローバルにインストール）// globalインストール
	2.	cd attendance-frontend
	3.	http-server（デフォルトで http://localhost:8080 で起動）
// もしくは、server.jsでサーバー起動構築
// * ポートやログ記録を任意で設定


Django (バックエンド)APIエンドポイント

# views.py
@api_view(['POST'])
def attendance_create(request):
    serializer = AttendanceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# urls.py
urlpatterns = [
    path('api/attendance/', attendance_create),
]


フロントが別ポートからアクセスする場合は django-cors-headers を設定します。

手順
// pipライブラリをインストール
// *ローカルもしくは仮想環境
pip install django-cors-headers


settings.py

INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOW_ALL_ORIGINS = True  # または CORS_ALLOWED_ORIGINS = ['http://localhost:8080']



起動手順
	1.	http://localhost:8080 にアクセス
	2.	ユーザーIDを入力 → 「##」クリック
	3.	http://localhost:8000/api/attendance/ にデータ送信 → DjangoがDBに保存
	4.	結果が画面に表示される



［拡張機能］
・ DBテーブル設計
・ 画面設計/遷移
・ シーケンス/ユースケース
# ユーザー要望を仕様書に反映

(試案)
・ 取得DBをもとにFastAPIを用いて、機械学習によってユーザーにレスポンス(提案やFBなど)





* Flaskによる実装


Python（Flask）でバックエンド、Node.js の http-server を用いた静的ファイルサーバーとしてフロントエンドを構成する勤怠管理アプリの基本的な構成と実装手順は以下のとおりです。

⸻

🌐 アーキテクチャ概要

[ブラウザ]
    │
    ├── HTTP リクエスト
    │
[Node.js http-server（HTML/CSS/JSの静的ファイル）]
    │      ↑ JavaScript (fetch)
    │
[Flask (Python) API サーバー（データベース処理）]
    │
[SQLite / MySQL / PostgreSQL など]


⸻

🛠️ 使用技術

機能	技術
フロントエンド	HTML / CSS / JavaScript (Fetch API)
フロント配信	Node.js http-server
バックエンド	Flask (Python)
データベース	SQLite（または任意のRDB）


⸻

📁 ディレクトリ構成例

attendance-app/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── main.js      ← FlaskにAPIリクエストを送る
├── backend/
│   ├── app.py       ← Flaskアプリ（APIエンドポイント）
│   └── db.sqlite3   ← SQLiteデータベース
└── package.json     ← http-serverの設定用（オプション）


⸻

🔧 1. Flask APIの実装（backend/app.py）

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # フロントエンドからのリクエストを許可

DB_PATH = 'db.sqlite3'

@app.route("/api/record", methods=["POST"])
def record_attendance():
    data = request.json
    user = data.get("user")
    date = data.get("date")
    status = data.get("status")  # 出勤、遅刻、早退など

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO attendance (user, date, status) VALUES (?, ?, ?)", (user, date, status))
    conn.commit()
    conn.close()

    return jsonify({"message": "記録しました"})

@app.route("/api/history", methods=["GET"])
def get_history():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT user, date, status FROM attendance")
    rows = cur.fetchall()
    conn.close()
    return jsonify(rows)

if __name__ == "__main__":
    app.run(port=5000)

🔸 SQLite用テーブル作成スクリプト（初回実行用）

CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    date TEXT,
    status TEXT
);


⸻

🖥️ 2. フロントエンド（frontend/index.html）

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>勤怠管理</title>
  <script defer src="main.js"></script>
</head>
<body>
  <h1>勤怠記録</h1>
  <form id="recordForm">
    名前: <input type="text" id="user"><br>
    日付: <input type="date" id="date"><br>
    ステータス:
    <select id="status">
      <option value="出勤">出勤</option>
      <option value="遅刻">遅刻</option>
      <option value="早退">早退</option>
    </select><br>
    <button type="submit">記録</button>
  </form>
  <div id="message"></div>
</body>
</html>


⸻

🔌 3. JavaScriptでFlaskと通信（frontend/main.js）

document.getElementById("recordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = document.getElementById("user").value;
  const date = document.getElementById("date").value;
  const status = document.getElementById("status").value;

  const res = await fetch("http://localhost:5000/api/record", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user, date, status })
  });

  const result = await res.json();
  document.getElementById("message").textContent = result.message;
});


⸻

🚀 4. 実行手順

✅ Flask（バックエンド）起動

cd backend
python app.py

✅ Node.js http-serverでフロント配信

cd frontend
npx http-server -p 8080

ブラウザで http://localhost:8080 にアクセス → 入力 → Flask API に POST → DB に保存

⸻

✅ 注意点
	•	Flask側で flask_cors を使って CORS を許可しないと、ブラウザのセキュリティ制限で通信できません。
	•	http-server は静的ファイル配信に限定されるため、APIは別ドメインになります（そのためCORSが必要）。

⸻

💡 拡張案
	•	データの取得・表示機能の追加（/api/history を JS で呼び出す）
	•	CSVエクスポートやフィルタリング機能
	•	バックエンドを FastAPI に変更して高速化
	•	データベースを PostgreSQL に切り替えて本格運用

⸻

この構成で、Node.js をあくまで静的ファイル配信専用にして、Flask がデータベース処理を担当する分業がうまく成立します。必要であれば、ログイン認証付きの構成や、FastAPIへの移行などもご案内できます。

* AWS導入


Node.js（http-server）を使ったシンプルなフロントエンドと、Flask + AWS（DynamoDB & S3）による堅牢なバックエンドの構成は、スケーラビリティが高く、柔軟な記録システムを構築するのに適しています。

以下に、ディレクトリ構成、環境構築、必要パッケージ、基本的なセットアップ手順をステップ形式で解説します。

⸻

✅ ディレクトリ構成（全体像）

record-system/
├── frontend/       # Node.js + http-server 用静的ファイル
│   ├── index.html
│   ├── main.js
│   └── style.css
├── backend/        # Flask アプリ + AWS操作ロジック
│   ├── app.py                # Flask本体
│   ├── requirements.txt      # pip依存
│   ├── config.py             # AWSキーなど環境変数の読み込み
│   └── aws/                  # AWS関連処理をモジュール化
│       ├── dynamo.py
│       └── s3.py
├── .env                # AWSアクセスキーなど（git管理除外）
├── .gitignore
└── README.md


⸻

🔧 1. Python（Flaskバックエンド）環境構築手順

必要パッケージ

cd backend/
python -m venv venv
source venv/bin/activate   
  # Windowsは venv\Scripts\activate
pip install flask boto3 python-dotenv

requirements.txt の内容

Flask
boto3
python-dotenv

.env の内容（AWS情報）

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=ap-northeast-1
DYNAMODB_TABLE_NAME=RecordTable
S3_BUCKET_NAME=record-app-files

config.py（Flask内で.envを読み込み）

from dotenv import load_dotenv
import os

load_dotenv()

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
REGION = os.getenv("AWS_DEFAULT_REGION")
DYNAMODB_TABLE = os.getenv("DYNAMODB_TABLE_NAME")
S3_BUCKET = os.getenv("S3_BUCKET_NAME")


⸻

🧩 2. AWS操作モジュール（例）

aws/dynamo.py

import boto3
from config import REGION, DYNAMODB_TABLE

dynamodb = boto3.resource('dynamodb', region_name=REGION)
table = dynamodb.Table(DYNAMODB_TABLE)

def save_record(data):
    table.put_item(Item=data)

def get_records():
    response = table.scan()
    return response['Items']

aws/s3.py

import boto3
from config import REGION, S3_BUCKET

s3 = boto3.client('s3', region_name=REGION)

def upload_file(file_obj, filename):
    s3.upload_fileobj(file_obj, S3_BUCKET, filename)

def generate_file_url(filename):
    return s3.generate_presigned_url('get_object', Params={'Bucket': S3_BUCKET, 'Key': filename}, ExpiresIn=3600)


⸻

🚀 3. Flask API本体（app.py）

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


⸻

🌐 4. フロントエンド構成（http-server）

セットアップ

cd frontend/
npm install -g http-server
http-server -p 3000

index.html 例（APIにPOST送信）

<form id="record-form">
  <input type="text" name="username" placeholder="名前" required />
  <input type="date" name="date" required />
  <button type="submit">記録</button>
</form>

<script>
document.getElementById("record-form").onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    username: form.username.value,
    date: form.date.value,
  };
  const res = await fetch('http://localhost:5000/api/record', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  alert((await res.json()).message);
};
</script>


⸻

☁️ AWS 初期準備（事前に行うこと）
	1.	S3バケット作成（例: record-app-files）
	2.	DynamoDBテーブル作成
	•	テーブル名: RecordTable
	•	主キー: id (文字列型)など
	3.	IAMユーザー or ロール作成
	•	必要なポリシー：
	•	AmazonS3FullAccess（開発用）
	•	AmazonDynamoDBFullAccess（開発用）

⸻

✅ 起動確認フロー
	1.	Flaskサーバー起動（バックエンド）

cd backend
flask run


	2.	フロントエンドサーバー起動（別ターミナル）

cd frontend
http-server -p 3000


	3.	ブラウザで http://localhost:3000 にアクセスし記録送信！

⸻

🔒 補足：セキュリティの注意
	•	.env ファイルは 必ず .gitignore に追加
	•	本番環境では IAMロールベースの認証や署名付きURLの活用が重要
	•	CORSポリシーの設定に注意（必要ならFlask-CORSの導入）

⸻

🎯 次のステップ候補
	•	ファイルアップロードUIの追加（画像 or ドキュメント）
	•	JWT認証を Flask に組み込む
	•	CloudFront + S3 による静的ホスティング導入

⸻

必要であれば、次は「DynamoDBのテーブル構成設計」や「S3の署名付きURLとセキュリティ強化」などの実装補助もできます。どこから進めたいか教えてください！