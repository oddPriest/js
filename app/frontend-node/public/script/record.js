const fetchUsername = document.getElementById('username');
const userSelect = document.getElementById('userSelect'); 
const fetchTargetDate = document.getElementById('targetDate');

document.getElementById('btnCum').addEventListener('click', () => record('cum'));
document.getElementById('btnNone').addEventListener('click', () => record('none'));

async function record(type) {
  const username = fetchUsername.value.trim() || userSelect.value;
  const targetDate = fetchTargetDate.value;

  try {
    if (!username) {
      alert("ユーザー名を入力するか、選択してください。", true);
      return;
    }

    const res = await fetch('/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, type, targetDate })
    });
    
    const data = await res.json();


    if (res.ok) {
      alert(`${targetDate || "該当日：指定なし"} に ${type === 'cum' ? '発射' : type === '不能'}を記録しました。\n[累計] 可動:${data.cum} / 不動:${data.none}`);
    
    } else { // エラー時の処理
      alert(data.message || "記録に失敗しました。(エラー)", true);
    }
  } catch (error) {
    alert("予期せぬエラーが発生しました。");
    console.error(error);

  } finally {
    // 記録後の処理
    // 入力フィールドをクリア
    fetchUsername.value = '';
    fetchTargetDate.value = '';
    userSelect.value = '';
    // メニュー画面へ遷移  
    window.location.href = '/';
  }
}

async function loadUserList() {
  try {
    const res = await fetch('/users');
    const users = await res.json();
    userSelect.innerHTML = '';
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user;
      option.textContent = user;
      userSelect.appendChild(option);
    });
    
  } catch (err) {
      console.error('ユーザーリストの取得に失敗:', err);
      alert("予期せぬエラーが発生しました。");
  }
}

window.addEventListener('DOMContentLoaded', loadUserList);
