document.getElementById("submit").addEventListener("click", async (e) => {
      e.preventDefault();
      const user_id = document.getElementById("userId").value;

      await fetch("http://localhost:8000/api/add/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });

      alert("記録を送信しました");
});


document.getElementById('shutdownBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  const confirmed = confirm("本当にサーバーを停止しますか？");
  if (!confirmed) return;

    const res = await fetch('/shutdown', { method: 'POST' });
    const data = await res.text();

});

const closeBtn = document.getElementById('close')
closeBtn.addEventListener('click', function () {
  window.close();

  if (!window.closed) {
    this.textContent = "ウィンドウを閉じられませんでした。" 
    console.log(console.error());
    }

  });

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