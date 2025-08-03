document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reserveForm');
  const messageEl = document.getElementById('formMessage');
  let isSubmitting = false;

  function setMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.style.color = type === 'error' ? '#e74c3c' : type === 'success' ? '#1f7d1f' : '#333';
  }

  if (!form) {
    console.error('reserveForm not found in DOM');
    return;
  }

  const getStudentId = () => {
    return form.dataset.studentId || (window.STUDENT_ID ?? null);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setMessage('');
    if (isSubmitting) return;
    
    isSubmitting = true;

    const room = document.getElementById('roomSelect')?.value;
    const time = document.getElementById('timeSelect')?.value;
    const date = document.getElementById('dateSelect')?.value;
    const anonymous = document.getElementById('anonymous')?.checked;
    let name = document.getElementById('nameInput')?.value.trim();
    if (anonymous || !name) name = 'Anonymous';

    if (!room || !time || !date) {
      setMessage('Room, date, and time are required.', 'error');
      return;
    }

    const payload = { room, date, time, name, anonymous };
    const studentId = getStudentId();

    if (!studentId) {
      setMessage('Missing student identifier.', 'error');
      console.error('Missing studentId. Form HTML:', form.outerHTML);
      return;
    }

    try {
      const res = await fetch(`/student/reserve/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      console.log('Raw reservation response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        if (res.ok) {
          setMessage('Reservation successful.', 'success');
          return;
        } else {
          setMessage('Unexpected non-JSON response from server.', 'error');
          return;
        }
      }

      if (res.ok && data.success) {
        setMessage('Reservation successful.', 'success');
      } else {
        setMessage(data.message || 'Reservation failed.', 'error');
      }
    } catch (err) {
      console.error('Reservation fetch error:', err);
      setMessage('Network or server error.', 'error');
    }
  });
});
