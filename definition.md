## 以下、勤怠管理アプリをリファクタリング
# リエンジニアリングにより仕様書作成

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
    │   ├── settings.py              ← 設定ファイル（CORSやDBなど）
    │   ├── urls.py                  ← ルーティング定義
    │   └── wsgi.py
    │
    ├── attendance/                  ← 勤怠アプリ（アプリケーション本体）
    │   ├── __init__.py
    │   ├── admin.py                 ← Django管理画面用（任意）
    │   ├── apps.py
    │   ├── models.py                ← 勤怠・ユーザーモデル定義
    │   ├── serializers.py           ← Django REST Framework用
    │   ├── views.py                 ← APIロジック
    │   ├── urls.py                  ← エンドポイントルーティング
    │   └── tests.py
    │
    ├── db.sqlite3                   ← SQLiteデータベース（またはPostgreSQL等）
    ├── requirements.txt             ← 依存パッケージリスト
    └── README.md                    ← ドキュメント（任意）

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>管理</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>##システム</h1>
  <label>ユーザーID: <input type="text" id="userId"></label>
  <button onclick="##linkClass()">##</button>
  <p id="retVal"></p>

  <script src="script.js"></script>
</body>
</html>


script.js
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

styles.css

body {
  font-family: sans-serif;
  padding: 2rem;
}

label {
  display: block;
  margin-bottom: 1rem;
}

button {
  padding: 0.5rem 1rem;
}

#result {
  margin-top: 1rem;
  font-weight: bold;
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
