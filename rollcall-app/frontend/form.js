
document.getElementById('record-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    user_id: document.getElementById('user_id').value,
    date: document.getElementById('date').value,
    status: document.getElementById('status').value
  };

  const res = await fetch('http://localhost:5000/api/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message || result.error);
});
