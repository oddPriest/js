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