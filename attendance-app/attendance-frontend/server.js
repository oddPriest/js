// サーバー起動 & ルーティング
// ルーティング用(Webサイトより参照)

const http = require('http'); // HTTPサーバー定義 
const fs = require('fs'); //ファイル操作
const path = require('path'); // パス指定
const url = require('url');

// ポートとパスを指定
const PORT = 8080; // ポート番号指定 or 3000
const logDir = path.join(__dirname, 'logs'); // ログディレクトリのパス
const dataDir = path.join(__dirname, 'logs'); // ユーザーデータのディレクトリパス
const publicDir = path.join(__dirname, 'public'); // 静的ファイルのディレクトリパス
const viewsDir = path.join(__dirname, 'views'); // 動的ファイル

// 記録のないユーザーは新規でjsonファイル形式で作成 (app/logs/**(username).json)
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// ユーザーの記録を取得
function loadUserLog(username) {
    const filePath = path.join(dataDir, `${username}.json`);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveUserLog(username, logs) {
    const filePath = path.join(dataDir, `${username}.json`);
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 3)); 
}
// 遅刻と早退(計3回)を欠席1回として計上する
function calculateAbsences(logs) {
    const cum = logs.filter(log => log.type === '遅刻').length;
    const none = logs.filter(log => log.type === '早退').length;
    // 不能数の連続により警告
    const emergencyMsg = Math.floor(none);
    return { cum, none, emergencyMsg };
}

const sendFile = (res, filePath, contentType) => {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('ファイルが見つかりませんでした。');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

if (method === 'POST' && parsedUrl.pathname === '/log') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
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

            saveUserLog(username, logs);

            const summary = calculateAbsences(logs);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(summary));

            } catch (err) {
                console.error(err);
                res.writeHead(500);
                res.end('サーバー起動エラー (error)');
            }
        });

    // サーバー停止
    } else if (method === 'POST' && parsedUrl.pathname === '/shutdown') {
        try {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('サーバーを停止中');
            console.log('サーバー停止リクエストを受信');
            alert('システムを終了します')
            
            // 処理完了を待機
            setTimeout(() => {
                server.close(() => {
                    console.log(`
                    以下のサーバーを停止しました。
                    http://localhost:${PORT}
                    `)
                    process.exit(0);
                });
            }, 500);

            return;

        } catch (err) {
            console.log(err, 'サーバー停止に失敗しました。')
      }

    } else if (method === 'GET' && parsedUrl.pathname === '/users') {
        const files = fs.readdirSync(dataDir);
        const users = files.filter(f => f.endsWith('.json')).map(f => path.basename(f, '.json'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));

    } else if (method === 'GET' && parsedUrl.pathname.startsWith('/log/')) {

        const username = decodeURIComponent(parsedUrl.pathname.split('/')[2]);
        const logs = loadUserLog(username);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(logs));

    } else {
        let filePath = path.join(viewsDir, publicDir, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css'
        };
        const contentType = contentTypes[ext] || 'text/plain';
        sendFile(res, filePath, contentType);
    }
});

// モジュールとしてエクスポート
module.exports = {
    start: () => {
        server.listen(PORT, () => {
            console.log(`サーバー起動: http://localhost:${PORT}`);
        });
    }
};