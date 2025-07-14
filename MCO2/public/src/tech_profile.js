document.addEventListener('DOMContentLoaded', () => {
    const editProfileBtn = document.getElementById('editProfileBtn');

    let isEditing = false;

    editProfileBtn.addEventListener('click', () => {
        const profileForm = document.getElementById('profileForm');

        if (!isEditing) {
            // Enable inputs
            ['firstName', 'lastName', 'phoneNumber', 'specialty'].forEach(id => {
                document.getElementById(id).disabled = false;
            });

            editProfileBtn.textContent = 'Save Changes';
            isEditing = true;
        } else {
            profileForm.submit(); // 👈 instantly submit
        }
    });

});