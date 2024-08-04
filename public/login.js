function sendcred() {
    const uname = document.getElementById('uname').value;
    const pass = document.getElementById('pass').value;

    fetch('/LOGIN', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uname, pass })
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            return response.json();
        }
    })
    .then(data => {
        console.log("Success: ", data);
        // Handle success, e.g., show success message, redirect to another page
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle error, e.g., show error message
    });
}
