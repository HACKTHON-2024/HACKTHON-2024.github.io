        feather.replace();

        document.addEventListener('DOMContentLoaded', async function () {
            await fetchProfileData();
            await fetchJobData();
        });
       
        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const year = String(date.getFullYear()).slice(-4); // Full year
            return `${day}/${month}/${year}`;
        }

        async function fetchProfileData() {
            try {
                const token = getToken();  // Get JWT token
            
                if (!token) {
                    showAuthPopup(); // Show login/signup popup if not logged in
                    return;
                }
                const response = await fetch('http://localhost:3000/labour/view_profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                console.log(data)
                const dob = new Date(data.DOB);
                const formattedDOB = dob.toISOString().split('T')[0];
                console.log(data)
                // Check if job_history exists and calculate its length
                const number_of_jobs_posted = data.job_history ? data.job_history.length : 0;

                // Display the number of jobs posted
                document.getElementById('no-of-posts').innerText = number_of_jobs_posted;
                document.getElementById('nameDisplay1').innerText = data.username;
                document.getElementById('nameDisplay2').innerText = data.username;
                document.getElementById('genderDisplay').innerText = data.gender;
                document.getElementById('DOBDisplay').innerText = formattedDOB;
                document.getElementById('phoneDisplay').innerText = data.mobile_number;
                document.getElementById('alt-phoneDisplay').innerText = data.alternate_mobile_number;
                document.getElementById('aadhaarDisplay').innerText = data.aadhaar_ID;
                document.getElementById('emailDisplay').innerText = data.email;
                document.getElementById('addressDisplay').innerText = data.address;
                document.getElementById('stateDisplay').innerText = data.state;
                document.getElementById('cityDisplay').innerText = data.city;
                document.getElementById('talukDisplay').innerText = data.taluk;
                
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        }

        // Fetch job data and display dynamically
        async function fetchJobData() {
            try {
                const token = getToken();  // Get JWT token
            
                if (!token) {
                    showAuthPopup(); // Show login/signup popup if not logged in
                    return;
                }
                                   const response = await fetch('http://localhost:3000/labour/get_job_history', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header
                        'Content-Type': 'application/json'
                    }
                });
                const jobs = await response.json();
                console.log(jobs)
                const jobContainer = document.querySelector('.job-created-section');

                jobContainer.innerHTML = '<h2>Jobs History:</h2>';

                jobs.forEach(job => {
                    const jobElement = document.createElement('div');
                    jobElement.classList.add('job-container');

                    jobElement.innerHTML = `
                        <div class="job-summary" onclick="toggleJobDetails(this)">
                            <div class="job-header">
                                <p><strong>Job Title:</strong> ${job.title}</p>
                                <p><strong>Start Date:</strong> ${formatDate(job.start_date)}</p>
                                <p><strong>End Date:</strong> ${formatDate(job.end_date)}</p>
                                <span class="arrow">▼</span>
                            </div>
                        </div>
                        <div class="job-details" style="display: none;">
                            <p><strong>Job Description:</strong></p>
                            <div class="editable-box">
                                <span>${job.description}</span>
                            </div>
                            <p><strong>Job Location:</strong></p>
                            <div class="editable-box">
                                <span>${job.location}</span>
                            </div>
                            <p><strong>Amount:</strong></p>
                            <div class="editable-box">
                                <span>${job.amount}</span>
                            </div>
                        </div>
                    `;
                    jobContainer.appendChild(jobElement);
                });
            } catch (error) {
                console.error('Error fetching job data:', error);
            }
        }

        // This function toggles between view mode and edit mode
        function toggleEdit() {
            const isEditing = document.getElementById('editButton').style.display === 'none';
            document.querySelectorAll('span[id]').forEach(span => {
                const inputId = span.id.replace('Display', 'Input');
                const inputField = document.getElementById(inputId);
                if (inputField) {
                    if (isEditing) {
                        span.innerText = inputField.value.trim();
                        inputField.style.display = 'none';
                        span.style.display = 'block';
                    } else {
                        // Populate the input field with current value
                        inputField.value = span.innerText.trim();
                        inputField.style.display = 'block';
                        span.style.display = 'none';
                    }
                }
            });
            document.getElementById('editButton').style.display = isEditing ? 'block' : 'none';
            document.getElementById('saveButton').style.display = isEditing ? 'none' : 'block';
        }
        

        async function saveChanges() {
            // Collect data from input fields
            

            const profileData = {
                username: document.getElementById('nameInput2').value,
                gender: document.getElementById('genderInput').value,
                DOB: document.getElementById('DOBInput').value,
                mobile_number: document.getElementById('phoneInput').value,
                alternate_mobile_number: document.getElementById('alt-phoneInput').value,
                aadhaar_ID: document.getElementById('aadhaarInput').value,
                email: document.getElementById('emailInput').value,
                address: document.getElementById('addressInput').value,
                land_location: document.getElementById('land_locationInput').value,
                land_size: document.getElementById('land_sizeInput').value,
                land_type: document.getElementById('land_typeInput').value,
                state: document.getElementById('stateInput').value,
                city: document.getElementById('cityInput').value,
                taluk: document.getElementById('talukInput').value
            };
            console.log(profileData)
            try {
                const token = getToken();  // Get JWT token
                // Send the updated data to the server
                const response = await fetch('http://localhost:3000/labour/update_profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,  // Add JWT to Authorization header

                    },
                    body: JSON.stringify(profileData),
                });
                if (response.ok) {
                    alert('Profile updated successfully');
                    toggleEdit();
                } else {
                    // Read and log the error response from the server
                    const errorData = await response.json();
                    console.error('Failed to update profile data:', errorData);
                    alert('Error updating profile: ' + (errorData.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while updating the profile.');
            }
        }
        // Toggle display of job details
        function toggleJobDetails(jobSummaryElement) {
            const jobDetails = jobSummaryElement.nextElementSibling;
            const arrow = jobSummaryElement.querySelector('.arrow');

            if (jobDetails.style.display === 'none') {
                jobDetails.style.display = 'block';
                arrow.textContent = '▲';
            } else {
                jobDetails.style.display = 'none';
                arrow.textContent = '▼';
            }
        }

// Function to check the login status and update the button
function updateAuthButton() {
    const authBtnContainer = document.getElementById('auth-btn-container');
    authBtnContainer.innerHTML = ''; // Clear any previous button
    const token = getToken(); // Check if token is available (user is logged in)
    if (token) {
        // User is logged in        
        // Create 'Logout' button
        const logoutButton = document.createElement('button');
        logoutButton.classList.add('auth-btn');
        logoutButton.textContent = 'Logout';
        logoutButton.addEventListener('click', function () {
            handleLogout(); // Handle logout process
        });
        
        // Append both buttons to the container
        authBtnContainer.appendChild(logoutButton);
        
    } 
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('jwt'); // Remove JWT token from localStorage
    alert('You have been logged out.');
    updateAuthButton(); // Update the button to reflect the login state
    window.location.href = 'http://localhost:3000/frontend/static/home_page/index.html'; // Redirect to login page after logout
}
// Function to show login/signup popup
function showAuthPopup() {
    const authPopup = document.getElementById('auth-popup');
    const popupOverlay = document.querySelector('.popup-overlay');

    authPopup.classList.remove('hidden');
    popupOverlay.classList.remove('hidden');

    // Add event listeners for login and signup buttons
    document.getElementById('login-btn').addEventListener('click', function () {
        window.location.href = '../signin/index.html'; // Redirect to login page
    });

    document.getElementById('signup-btn').addEventListener('click', function () {
        window.location.href = '../signup/index.html'; // Redirect to signup page
    });
}

// Close popup function (optional)
function closeAuthPopup() {
    const authPopup = document.getElementById('auth-popup');
    const popupOverlay = document.querySelector('.popup-overlay');

    authPopup.classList.add('hidden');
    popupOverlay.classList.add('hidden');
}
function getToken() {
    return localStorage.getItem('jwt');  // Retrieve JWT token from localStorage
}