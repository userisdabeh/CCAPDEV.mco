document.addEventListener('DOMContentLoaded', () => {
    const adminForm = document.getElementById('searchForm');

    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const room = document.getElementById('roomSelect')?.value;
        const date = document.getElementById('dateSelect')?.value;
        const time = document.getElementById('timeSelect')?.value;
        const user = document.getElementById('userSelect')?.value;
        const quantity = document.getElementById('quantity')?.value;
        const technicianId = document.getElementById('technicianId')?.value;
        const anonymous = false;

        console.log(room, date, time, user, quantity, technicianId, anonymous);

        if (!room || !date || !time || !user || !quantity) {
            alert('Please fill in all fields');
            return;
        }

        const payload = {
            userID: user,
            room,
            date,
            time,
            quantity,
            anonymous
        };

        try {
            const res = await fetch(`/tech/reserve/${technicianId}`, {
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
                console.log(data);
            } catch {
                if (res.ok) {
                    alert('Reservation successful.');
                    return;
                } else {
                    alert('Unexpected non-JSON response from server.');
                    return;
                }
            }

            if (res.ok && data.success) {
                alert('Reservation successful.');
            } else {
                alert(data.message || 'Reservation failed.');
            }
        } catch (err) {
            console.error('Reservation fetch error:', err);
            alert('Network or server error.');
        }
    });
});