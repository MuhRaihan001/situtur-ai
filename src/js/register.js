document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const error = document.getElementById("error");

    if (password !== confirmPassword) {
        error.textContent = "Password dan konfirmasi password tidak sama!";
        return;
    }
});

