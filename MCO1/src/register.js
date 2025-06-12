
function userBtn(){
    const btn = document.getElementById('btn');
    const studentBtn = document.querySelectorAll('.toggle-btn')[0];
    const techBtn = document.querySelectorAll('.toggle-btn')[1];

    studentBtn.addEventListener('click', () => {
        btn.style.left = '0';
    });

    techBtn.addEventListener('click', () => {
        btn.style.left = '160px';
    });
}

