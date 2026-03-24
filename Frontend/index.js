const BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Sign In logic
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('idEmail').value.trim();
            const password = document.getElementById('idPassword').value.trim();

            if (!email || !password) {
                alert("Please fill in all required fields.");
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/auth/signIn`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || 'Login failed');
                }

                const data = await response.json();
                
                // Store the auth token for future authenticated requests
                localStorage.setItem('token', data.refresh_token);
                alert('Login successful! Welcome back.');
                window.location.href = 'videogame.html';
            } catch (error) {
                alert('Login error: ' + error.message);
            }
        });
    }

    // Sign Up logic
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('idPassword').value.trim();
            const confirmPassword = document.getElementById('idConfirmPassword').value.trim();

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            const payload = {
                name: document.getElementById('idName').value.trim(),
                last_name: document.getElementById('idLastName').value.trim(),
                email: document.getElementById('idEmail').value.trim(),
                password: password,
                birthday: new Date(document.getElementById('idDateOfBirth').value).toISOString(),
                gender: document.getElementById('idGender').value,
            };

            const company = document.getElementById('idCompany').value.trim();
            if (company) {
                payload.company = company;
            }

            try {
                const response = await fetch(`${BASE_URL}/auth/signUp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || 'Signup failed');
                }

                const data = await response.json();
                
                // Store the auth token for future authenticated requests
                localStorage.setItem('token', data.refresh_token);
                alert('Account created successfully!');
                window.location.href = 'videogame.html';
            } catch (error) {
                alert('Signup error: ' + error.message);
            }
        });
    }
});
