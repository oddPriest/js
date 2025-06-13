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
