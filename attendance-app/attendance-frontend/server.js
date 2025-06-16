// サーバー起動 & ルーティング
// ルーティング用(Webサイトより参照)

const http = require('http'); // HTTPサーバー定義 
const fs = require('fs'); //ファイル操作
const path = require('path'); // パス指定
const url = require('url');
const axios = require('axios');
const bodyParser = require('body-parser');

// ポートとパスを指定
const PORT = 8080; // ポート番号指定 or 3000

const app = http();

app.use(http.static('views')); // HTML/CSS/JSを入れるフォルダ
app.use(bodyParser.json());

// 勤怠データ送信エンドポイント
app.post('/submit', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:8000/api/attendance/', req.body);
    res.json({ message: '成功', data: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(400).json({ error: '送信エラー' });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js フロントエンドサーバー起動中：http://localhost:${PORT}`);
});





/**
            const { 
                username,
                type,
                targetDate
            } = JSON.parse(body);

            const typeMap = {
                cum: '発射',
                none: '不能'
            };

            const jpType = typeMap[type];
            if (!username || !jpType) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: '入力されたデータが不正です。' 
            }));
            }

            const logs = loadUserLog(username);
            const recordDate = new Date().toLocaleString('ja-JP', {
                timeZone: 'Asia/Tokyo',
            });

            logs.push({
                recordDate: recordDate,
                targetDate: targetDate || null, // 選択なければ空値
                type: jpType
            });
*/