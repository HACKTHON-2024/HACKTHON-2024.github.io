document.addEventListener('DOMContentLoaded', function () {

    // Add network status monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    const loginContainer = document.getElementById('login-container');
    const passwordContainer = document.getElementById('password-container');
    const otpContainer = document.getElementById('otp-container');

    const continueButton = document.getElementById('continue-button');
    const passwordContinueButton = document.getElementById('password-continue');
    const otpButton = document.getElementById('otp-button');
    const otpLoginButton = document.getElementById('otp-login');
    const resendButton = document.getElementById('resend1');
    const goBackLink = document.getElementById('go-back-link');
    const goBackPasswordLink = document.getElementById('go-back-password');

    let isEmail = false; // This will store whether the input is email or mobile number

    if (!navigator.onLine) {
        window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
        return;
    }else {
        checkServerStatus();
    }

    // Event listener for Continue button
    continueButton.addEventListener('click', function () {
        if (!navigator.onLine) {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
            return;
        }
        const identifier = document.getElementById('email-input').value;

        // Simple validation
        if (!identifier) {
            showMessage('error', 'Input Required', 'Please enter email or mobile number');
            return;
        }

        // Check if input is an email or mobile number
        isEmail = identifier.includes('@');

        // Show password screen
        loginContainer.classList.add('hidden');
        passwordContainer.classList.remove('hidden');
    });

    // Event listener for Password Continue button
    passwordContinueButton.addEventListener('click', async function () {
        const password = document.getElementById('password-input').value;
        const identifier = document.getElementById('email-input').value;

        if (!password) {
            showMessage('error', 'Input Required', 'Please enter your password');
            return;
        }

        // Send login request
        try {
            const response = await fetch('https://labourfieldtest.onrender.com/landowner/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            const result = await response.json();
            if (response.ok) {
                localStorage.setItem('jwt', result.token);
                showMessage('success', 'Success!', 'Logged in successfully');
                
                // Redirect after message is shown
                setTimeout(() => {
                    window.location.href = "../job_listing/index.html";
                }, 2000);
            } else {
                showMessage('error', 'Login Failed', result.message || "Invalid credentials");
            }
        } catch (error) {
            showMessage('error', 'Error', 'Error logging in. Please try again.');
        }
    });

    // Event listener for OTP button (Get OTP)
    // Event listener for OTP button (Get OTP)
otpButton.addEventListener('click', async function () {
    const identifier = document.getElementById('email-input').value;

    if (!identifier) {
        showMessage('error', 'Input Required', 'Please enter email or mobile number');
        return;
    }

    try {
        // Validate if the user exists (email or mobile number)
        const validateResponse = await fetch('https://labourfieldtest.onrender.com/landowner/validate-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
        });

        const validateResult = await validateResponse.json();

        if (!validateResponse.ok) {
            // User does not exist, show an error message
            showMessage('error', 'User Not Found', validateResult.message || 'User does not exist in the system');
            return;
        }

        // User exists, now send OTP
        const route = isEmail ? 'https://labourfieldtest.onrender.com/mail_otp/send-otp' : 'https://labourfieldtest.onrender.com/otp/send-otp';
        const response = await fetch(route, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
        });

        const result = await response.json();

        if (response.ok) {
            // Show OTP container
            passwordContainer.classList.add('hidden');
            otpContainer.classList.remove('hidden');
            showMessage('success', 'OTP Sent', 'OTP has been sent successfully');
        } else {
            showMessage('error', 'Failed', result.message || "Failed to send OTP");
        }
    } catch (error) {
        showMessage('error', 'Error', 'Error sending OTP');
    }
});

    // Event listener for OTP Login button (Verify OTP)
    otpLoginButton.addEventListener('click', async function () {
        const otp = document.getElementById('otp-input').value;
        const identifier = document.getElementById('email-input').value;

        if (!otp) {
            showMessage('error', 'Input Required', 'Please enter the OTP');
            return;
        }

        try {
            const route = isEmail ? 'https://labourfieldtest.onrender.com/mail_otp/verify-otp' : 'https://labourfieldtest.onrender.com/otp/verify-otp';
            const response = await fetch(route, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, otp })
            });

            const result = await response.json();
            if (response.ok) {
                const loginResponse = await fetch('https://labourfieldtest.onrender.com/landowner/signin_by_otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier })
                });

                const loginResult = await loginResponse.json();
                if (loginResponse.ok) {
                    localStorage.setItem('jwt', loginResult.token);
                    showMessage('success', 'Success!', 'Logged in successfully');
                    
                    // Redirect after message is shown
                    setTimeout(() => {
                        window.location.href = "../job_listing/index.html";
                    }, 2000);
                } else {
                    showMessage('error', 'Login Failed', loginResult.message || "Login failed");
                }
            } else {
                showMessage('error', 'Verification Failed', result.message || "OTP verification failed");
            }
        } catch (error) {
            showMessage('error', 'Error', 'Error verifying OTP. Please try again.');
        }
    });

    // Event listener for Resend OTP
    resendButton.addEventListener('click', async function () {
        const identifier = document.getElementById('email-input').value;

        try {
            const route = isEmail ? 'https://labourfieldtest.onrender.com/mail_otp/send-otp' : 'https://labourfieldtest.onrender.com/otp/send-otp';
            const response = await fetch(route, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier })
            });

            if (response.ok) {
                showMessage('success', 'OTP Resent', 'OTP has been resent successfully');
            } else {
                showMessage('error', 'Failed', 'Failed to resend OTP');
            }
        } catch (error) {
            showMessage('error', 'Error', 'Error resending OTP. Please try again.');
        }
    });

    // Go back links
    goBackLink.addEventListener('click', function () {
        passwordContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    goBackPasswordLink.addEventListener('click', function () {
        otpContainer.classList.add('hidden');
        passwordContainer.classList.remove('hidden');
    });

    // Add event listener for Enter key on email input
    document.getElementById('email-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            continueButton.click(); // Simulate a click on the continue button
        }
    });

    // Add event listener for Enter key on password input
    document.getElementById('password-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            passwordContinueButton.click(); // Simulate a click on the password continue button
        }
    });

    // Add event listener for Enter key on OTP input
    document.getElementById('otp-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            otpLoginButton.click(); // Simulate a click on the OTP login button
        }
    });
});

function showMessage(type, title, message) {
    const overlay = document.getElementById('messageOverlay');
    const messageBox = overlay.querySelector('.message-box');
    const icon = overlay.querySelector('.message-icon i');
    const titleElement = overlay.querySelector('h3');
    const messageElement = overlay.querySelector('p');

    // Set message type (success or error)
    icon.className = type === 'success' 
        ? 'fas fa-check-circle success-icon'
        : 'fas fa-exclamation-circle error-icon';

    // Set content
    titleElement.textContent = title;
    messageElement.textContent = message;

    // Show overlay
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('show'), 10);

    // Auto hide after 3 seconds
    setTimeout(() => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }, 3000);
}

// Usage examples:
// Success message
// showMessage('success', 'Success!', 'You have successfully logged in.');

// Error message
// showMessage('error', 'Error!', 'Invalid credentials. Please try again.');

// Function to handle network changes
function handleNetworkChange(event) {
    if (!navigator.onLine) {
        // Redirect to network error page when offline
        window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
    } else {
        const currentPath = window.location.pathname;
        if (currentPath.includes('network-error') || currentPath.includes('server-error')) {
            checkServerStatus().then(isServerRunning => {
                if (isServerRunning) {
                    window.history.back();
                }
            });
        }
    }
}

// Function to check if server is running
async function checkServerStatus() {
    try {
        const response = await fetch('https://labourfieldtest.onrender.com/api/users/check-auth', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000)
        });
        return true;
    } catch (error) {
        if (!window.location.pathname.includes('server-error.html')) {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/server-error.html';
        }
        return false;
    }
}
