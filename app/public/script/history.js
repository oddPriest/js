async function loadUserList() {
    const res = await fetch('/users');
    const users = await res.json();
    const select = document.getElementById('userSelect');
    select.innerHTML = '';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = user;
        select.appendChild(option);
    });
}

// ログと集計を読み込む
async function loadHistory() {
    const username = document.getElementById('userSelect').value;
    if (!username) {
        const toast = new bootstrap.Toast(document.getElementById('historyToast'));
        toast.show();
        return;
    }

    const res = await fetch(`/log/${username}`);
    if (!res.ok) {
        alert('ログが見つかりませんでした。');
        return;
    }

    const logs = await res.json();

    const late = logs.filter(log => log.type === '遅刻').length;
    const early = logs.filter(log => log.type === '早退').length;
    const absence = logs.filter(log => log.type === '欠席').length;
    const totalAbsence = Math.floor((late + early) / 3) + absence;

    document.getElementById('lateCount').textContent = `遅刻回数: ${late}`;
    document.getElementById('earlyCount').textContent = `早退回数: ${early}`;
    document.getElementById('absenceCount').textContent = `欠席回数: ${totalAbsence} `;

    const tbody = document.getElementById('logTableBody');
    tbody.innerHTML = '';
    logs.forEach(log => {
        const row = document.createElement('tr');
        const typeElm = document.createElement('td');
        const dateElm = document.createElement('td');
        const bool = log.targetDate;
  
        if (bool === null) {
            typeElm.textContent = (log.type + " " + "(指定なし)");
        
        } else {
            typeElm.textContent = 
            (log.type + " (" + log.targetDate + ")");

        } dateElm.textContent = log.recordDate || '未記録';

        row.appendChild(typeElm);
        row.appendChild(dateElm);
        tbody.appendChild(row);
    });
}

document.getElementById('loadHistoryBtn').addEventListener('click', loadHistory);
window.addEventListener('DOMContentLoaded', loadUserList);