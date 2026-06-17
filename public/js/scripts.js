// ─── API URL ───
const API = 'http://localhost:5000/api/users';

// ─── Privacy Policy Modal ───
function openModal() {
    document.getElementById('privacyModal').classList.add('open');
}

function closeModal() {
    document.getElementById('privacyModal').classList.remove('open');
}

const modal = document.getElementById('privacyModal');
if (modal) {
    modal.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// ─── Helper: Save Token ───
function saveToken(token) {
    localStorage.setItem('token', token);
}

// ─── Helper: Get Token ───
function getToken() {
    return localStorage.getItem('token');
}

// ─── Helper: Remove Token ───
function removeToken() {
    localStorage.removeItem('token');
}

// ─── Helper: Authenticated Fetch ───
async function authFetch(url, options = {}) {
    const token = getToken();
    options.headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    };
    const response = await fetch(url, options);
    const data = await response.json();
    return { response, data };
}

// ─── Login Form ───
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('loginError');

        if (!email.includes('@')) {
            errorMsg.textContent = 'Please enter a valid email address.';
            errorMsg.style.display = 'block';
            return;
        }

        if (password === '') {
            errorMsg.textContent = 'Please enter your password.';
            errorMsg.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(API + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                saveToken(data.token);
                window.location.href = 'records.html';
            } else {
                errorMsg.textContent = data.error || 'Wrong email or password.';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = 'Server error. Please try again.';
            errorMsg.style.display = 'block';
        }
    });
}

// ─── Registration Form ───
const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const winNumber = document.getElementById('win_number').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const errorMsg = document.getElementById('registrationError');

        if (!email.includes('@')) {
            errorMsg.textContent = 'Please enter a valid email address.';
            errorMsg.style.display = 'block';
            return;
        }

        if (winNumber.length !== 10) {
            errorMsg.textContent = 'WIN number must be exactly 10 digits.';
            errorMsg.style.display = 'block';
            return;
        }

        if (password !== confirmPassword) {
            errorMsg.textContent = 'Passwords do not match.';
            errorMsg.style.display = 'block';
            return;
        }

        if (password.length < 6) {
            errorMsg.textContent = 'Password must be at least 6 characters.';
            errorMsg.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(API + '/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, win_number: winNumber, phone, password })
            });

            const data = await response.json();

            if (data.success) {
                saveToken(data.token);
                window.location.href = 'records.html';
            } else {
                errorMsg.textContent = data.error || 'Registration failed. Please try again.';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = 'Server error. Please try again.';
            errorMsg.style.display = 'block';
        }
    });
}

// ─── Catch Log Form ───
const catchForm = document.getElementById('catchForm');
if (catchForm) {
    catchForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const successMsg = document.getElementById('catchSuccess');

        const weather = [];
        document.querySelectorAll('input[name="weather"]:checked').forEach(function(cb) {
            weather.push(cb.value);
        });

        const catchData = {
            fish_type: document.getElementById('fish_type').value,
            weight: parseFloat(document.getElementById('weight').value),
            length: parseFloat(document.getElementById('length').value),
            bait_type: document.querySelector('input[name="bait_type"]:checked').value,
            bait_name: document.getElementById('bait_name').value,
            location: document.getElementById('location').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            weather
        };

        try {
            const { response, data } = await authFetch(API + '/catches', {
                method: 'POST',
                body: JSON.stringify(catchData)
            });

            if (data.success) {
                successMsg.style.display = 'block';
                setTimeout(function() {
                    window.location.href = 'records.html';
                }, 2000);
            } else {
                alert(data.error || 'Failed to save catch. Please try again.');
            }
        } catch (err) {
            alert('Server error. Please try again.');
        }
    });
}

// ─── Profile Page ───
const userEmail = document.getElementById('userEmail');
if (userEmail) {
    authFetch(API + '/profile').then(function({ response, data }) {
        if (data.success) {
            document.getElementById('userEmail').textContent = data.user.email;
            document.getElementById('userWin').textContent = data.user.win_number;
            document.getElementById('userPhone').textContent = data.user.phone || '—';
        }
    });
}

// ─── Profile Password Form ───
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('current_password').value;
        const newPassword = document.getElementById('new_password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const errorMsg = document.getElementById('profileError');

        if (newPassword !== confirmPassword) {
            errorMsg.textContent = 'New passwords do not match.';
            errorMsg.style.display = 'block';
            return;
        }

        try {
            const { response, data } = await authFetch(API + '/password', {
                method: 'PUT',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            });

            if (data.success) {
                errorMsg.style.display = 'none';
                alert('Password updated successfully!');
            } else {
                errorMsg.textContent = data.error || 'Failed to update password.';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = 'Server error. Please try again.';
            errorMsg.style.display = 'block';
        }
    });
}

// ─── Records Page ───
let allCatches = [];

const recordsTable = document.getElementById('recordsTable');
if (recordsTable) {
    authFetch(API + '/catches').then(function({ response, data }) {
        if (data.success) {
            const summary = data.summary;
            document.getElementById('totalCatches').textContent = summary.totalCatches;
            document.getElementById('heaviestFish').textContent = summary.heaviestFish + ' lbs';
            document.getElementById('longestFish').textContent = summary.longestFish + ' in';
            document.getElementById('avgWeight').textContent = summary.avgWeight + ' lbs';
            document.getElementById('avgLength').textContent = summary.avgLength + ' in';

            allCatches = data.catches;
            renderTable(allCatches);
        }
    });
}

function renderTable(catches) {
    if (catches.length === 0) {
        recordsTable.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #555;">No catches found.</td></tr>';
        return;
    }

    recordsTable.innerHTML = catches.map(function(c) {
        return `<tr>
            <td>${c.fish_type.replace(/_/g, ' ')}</td>
            <td>${c.weight}</td>
            <td>${c.length}</td>
            <td>${c.bait_type.replace(/_/g, ' ')}</td>
            <td>${c.bait_name}</td>
            <td>${c.location.replace(/_/g, ' ')}</td>
            <td>${new Date(c.date).toLocaleDateString()}</td>
            <td>${c.time}</td>
            <td>${c.weather.join(', ')}</td>
            <td>
                <button class="btn-edit" onclick="openEditModal('${c._id}')">Edit</button>
                <button class="btn-delete" onclick="openDeleteModal('${c._id}')">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

// ─── Search ───
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const query = searchInput.value.toLowerCase();

        const filtered = allCatches.filter(function(c) {
            return c.fish_type.toLowerCase().includes(query) ||
                   c.location.toLowerCase().includes(query) ||
                   c.bait_name.toLowerCase().includes(query) ||
                   c.bait_type.toLowerCase().includes(query);
        });

        renderTable(filtered);
    });
}

// ─── Edit Modal ───
function openEditModal(id) {
    const catchToEdit = allCatches.find(function(c) { return c._id === id; });
    if (!catchToEdit) return;

    document.getElementById('edit_id').value = catchToEdit._id;
    document.getElementById('edit_fish_type').value = catchToEdit.fish_type;
    document.getElementById('edit_weight').value = catchToEdit.weight;
    document.getElementById('edit_length').value = catchToEdit.length;
    document.getElementById('edit_bait_name').value = catchToEdit.bait_name;
    document.getElementById('edit_location').value = catchToEdit.location;
    document.getElementById('edit_date').value = catchToEdit.date.split('T')[0];
    document.getElementById('edit_time').value = catchToEdit.time;

    document.querySelectorAll('input[name="edit_bait_type"]').forEach(function(radio) {
        radio.checked = radio.value === catchToEdit.bait_type;
    });

    document.querySelectorAll('input[name="edit_weather"]').forEach(function(cb) {
        cb.checked = catchToEdit.weather.includes(cb.value);
    });

    document.getElementById('editModal').classList.add('open');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('open');
}

const editModalOverlay = document.getElementById('editModal');
if (editModalOverlay) {
    editModalOverlay.addEventListener('click', function(e) {
        if (e.target === this) closeEditModal();
    });
}

const editForm = document.getElementById('editForm');
if (editForm) {
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const id = document.getElementById('edit_id').value;

        const weather = [];
        document.querySelectorAll('input[name="edit_weather"]:checked').forEach(function(cb) {
            weather.push(cb.value);
        });

        const baitTypeRadio = document.querySelector('input[name="edit_bait_type"]:checked');

        const updatedCatch = {
            fish_type: document.getElementById('edit_fish_type').value,
            weight: parseFloat(document.getElementById('edit_weight').value),
            length: parseFloat(document.getElementById('edit_length').value),
            bait_type: baitTypeRadio ? baitTypeRadio.value : '',
            bait_name: document.getElementById('edit_bait_name').value,
            location: document.getElementById('edit_location').value,
            date: document.getElementById('edit_date').value,
            time: document.getElementById('edit_time').value,
            weather
        };

        try {
            const { response, data } = await authFetch(API + '/catches/' + id, {
                method: 'PUT',
                body: JSON.stringify(updatedCatch)
            });

            if (data.success) {
                closeEditModal();
                location.reload();
            } else {
                alert(data.error || 'Failed to update catch.');
            }
        } catch (err) {
            alert('Server error. Please try again.');
        }
    });
}

// ─── Delete Modal ───
function openDeleteModal(id) {
    document.getElementById('delete_id').value = id;
    document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('open');
}

const deleteModalOverlay = document.getElementById('deleteModal');
if (deleteModalOverlay) {
    deleteModalOverlay.addEventListener('click', function(e) {
        if (e.target === this) closeDeleteModal();
    });
}

async function confirmDelete() {
    const id = document.getElementById('delete_id').value;

    try {
        const { response, data } = await authFetch(API + '/catches/' + id, {
            method: 'DELETE'
        });

        if (data.success) {
            closeDeleteModal();
            location.reload();
        } else {
            alert(data.error || 'Failed to delete catch.');
        }
    } catch (err) {
        alert('Server error. Please try again.');
    }
}

// ─── Statistics Charts ───
const speciesCanvas = document.getElementById('speciesChart');
if (speciesCanvas) {
    authFetch(API + '/statistics').then(function({ response, data }) {
        if (data.success) {
            const stats = data.statistics;

            new Chart(speciesCanvas, {
                type: 'pie',
                data: {
                    labels: stats.species.map(s => s.name.replace(/_/g, ' ')),
                    datasets: [{
                        data: stats.species.map(s => s.percentage),
                        backgroundColor: ['#0f6e56', '#1a9e7a', '#2dc996', '#85e0c4', '#c8ead8']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' },
                        datalabels: {
                            color: 'white',
                            formatter: function(value) { return value + '%'; },
                            font: { size: 13, weight: 'bold' }
                        }
                    }
                }
            });

            new Chart(document.getElementById('locationChart'), {
                type: 'pie',
                data: {
                    labels: stats.locations.map(l => l.name.replace(/_/g, ' ')),
                    datasets: [{
                        data: stats.locations.map(l => l.percentage),
                        backgroundColor: ['#0f6e56', '#1a9e7a', '#2dc996']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' },
                        datalabels: {
                            color: 'white',
                            formatter: function(value) { return value + '%'; },
                            font: { size: 13, weight: 'bold' }
                        }
                    }
                }
            });

            new Chart(document.getElementById('baitChart'), {
                type: 'pie',
                data: {
                    labels: stats.baitTypes.map(b => b.name.replace(/_/g, ' ')),
                    datasets: [{
                        data: stats.baitTypes.map(b => b.percentage),
                        backgroundColor: ['#0f6e56', '#1a9e7a', '#2dc996']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' },
                        datalabels: {
                            color: 'white',
                            formatter: function(value) { return value + '%'; },
                            font: { size: 13, weight: 'bold' }
                        }
                    }
                }
            });

            new Chart(document.getElementById('timeChart'), {
                type: 'bar',
                data: {
                    labels: stats.timeOfDay.map(t => t.slot),
                    datasets: [{
                        label: 'Number of Catches',
                        data: stats.timeOfDay.map(t => t.count),
                        backgroundColor: '#0f6e56',
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
        }
    });
}

// ─── Logout ───
const logoutLinks = document.querySelectorAll('.logout-link');
logoutLinks.forEach(function(link) {
    link.addEventListener('click', function() {
        removeToken();
    });
});