async function loadUsersList() {
  const res = await fetch('/users');
  const users = await res.json();
  const select = document.getElementById('userSelect');
  select.innerHTML = "";
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user;
    option.textContent = user;
    select.appendChild(option);
  });
}



// 端数を計算するメソッド
document.getElementById('calcBtn').addEventListener('click', async () => {
    // {username}の記録を取得
  const username = document.getElementById('userSelect').value;
    if (!username) return alert('ユーザーを選択してください');

  const res = await fetch(`/log/${username}`);
    if (!res.ok) return alert('ログが見つかりませんでした。');
  // 記録を取得
  const logs = await res.json();
    const late = logs.filter(log => log.type === '遅刻').length;
    const early = logs.filter(log => log.type === '早退').length;
    const absent = logs.filter(log => log.type === '欠席').length;
  // 計算
  const total = Math.floor((late + early) / 3) + absent;
  const nextAbsenceThreshold = 3 - ((late + early) % 3);
  // 端数計算の結果を出力
  const resultText = `
    <p>遅刻: ${late} 回</p>
    <p>早退: ${early} 回</p>
    <p>欠席: ${absent} 回</p>
    <p><strong>換算欠席数: ${total} 回</strong></p>
    <p>次の欠席まであと <strong>${nextAbsenceThreshold}</strong> 回の遅刻または早退</p>
  `;
  document.getElementById('upperResult').innerHTML = resultText;
  });



// 指定回数までの残数を計算
document.getElementById('calcRemain').addEventListener('click', async() => {
  
  // {username}の記録を取得
  const username = document.getElementById('userSelect').value;
    if (!username) return alert('ユーザーを選択してください');
  
    // 記録がない場合の処理
  const res = await fetch(`/log/${username}`);
    if (!res.ok) return alert('ログが見つかりませんでした。');

  // 記録を取得
  const logs = await res.json();
    const late = logs.filter(log => log.type === '遅刻').length;
    const early = logs.filter(log => log.type === '早退').length;
    const absent = logs.filter(log => log.type === '欠席').length;

  // 指定回数(計算数値)の判定
  const targetCount = parseInt(document.getElementById('calcCount').value);
    if (isNaN(targetCount) || targetCount <= 0) {
      return alert('計算する欠席回数を正しく入力してください');
    }
  // 出力値の定義
  const converted = Math.floor((late + early) / 3);
  const totalAbsence = converted + absent;
  const remainAbsence = Math.max(targetCount - totalAbsence, 0);
  const remainderLateEarly = 3 - ((late + early) % 3);

// 計算結果を表示
  const remainText = `
    <p>現在の欠席: ${absent} 回</p>
    <p>遅刻: ${late} 回</p>
    <p>早退: ${early} 回</p>
    <p>換算欠席: ${converted} 回</p>
    <p><strong>合計欠席数: ${totalAbsence} 回</strong></p>
    <p><strong>指定数： ${targetCount} 回までに残された欠席: ${remainAbsence} 回</strong></p>
    <p>※次の欠席換算までの遅刻または早退: ${remainderLateEarly} 回</p>
    `;
  document.getElementById('calcResult').innerHTML = remainText;
 });



window.addEventListener('DOMContentLoaded', loadUsersList);
