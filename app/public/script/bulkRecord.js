async function loadUsersList() {
  const res = await fetch('/users');
  const users = await res.json();
  const select = document.getElementById('userSelect');
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user;
    option.textContent = user;
    select.appendChild(option);
  });
}

document.getElementById('submitBtn').addEventListener('click', async () => {
  const username = document.getElementById('userSelect').value;
  const late = parseInt(document.getElementById('lateCount').value) || 0;
  const early = parseInt(document.getElementById('earlyCount').value) || 0;
  const absent = parseInt(document.getElementById('absentCount').value) || 0;

  if (!username) return alert('ユーザーを選択してください');

  const entries = [];
  const bulkInput = "一括入力";

  for (let i = 0; i < late; i++) entries.push({ username, type: 'late', targetDate: bulkInput });
  for (let i = 0; i < early; i++) entries.push({ username, type: 'early', targetDate: bulkInput });
  for (let i = 0; i < absent; i++) entries.push({ username, type: 'absence', targetDate: bulkInput });

  for (const entry of entries) {
    await fetch('/log', {
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  }

  alert("一括記録が完了しました！");
  location.reload();
  window.location.href = '/';
});

window.addEventListener('DOMContentLoaded', loadUsersList);