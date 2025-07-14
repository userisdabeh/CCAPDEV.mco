
    document.getElementById('editProfileBtn').addEventListener('click', () => {
        const form = document.getElementById('profileForm');
        const inputs = form.querySelectorAll('input, textarea');
        const saveBtn = document.getElementById('saveProfileBtn');

        inputs.forEach(input => {
            if (input.id !== 'technicianID' && input.id !== 'yearsOfService') {
                input.disabled = false;
            }
        });

        document.getElementById('profilePictureInput').style.display = 'block';
        saveBtn.style.display = 'inline-block';
    });

    document.getElementById('profilePictureInput').addEventListener('change', function(event) {
        const preview = document.getElementById('previewImage');
        const file = event.target.files[0];
        if (file) {
            preview.src = URL.createObjectURL(file);
        }
    });
