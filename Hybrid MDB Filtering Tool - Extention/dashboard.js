document.addEventListener('DOMContentLoaded', () => {
    
    // Globals for chart instances so we can update them
    let comparisonChartInstance = null;
    let distributionChartInstance = null;

    // 1. Initial Load from Local Storage
    chrome.storage.local.get(['filteringStats'], (data) => {
        if (data.filteringStats) {
            updateDashboard(data.filteringStats);
        } else {
            console.log("No filtering stats available yet. Run the filter on the Mock LMS first.");
            // Render empty charts
            renderCharts(0, 0, 0);
        }
    });

    // 2. Listen for real-time updates from content.js
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.filteringStats) {
            updateDashboard(changes.filteringStats.newValue);
        }
    });

    function updateDashboard(stats) {
        // Update Stats Cards
        document.getElementById('total-msgs').textContent = stats.totalMessages || 0;
        document.getElementById('academic-msgs').textContent = stats.academic || 0;
        document.getElementById('regex-flagged').textContent = stats.regexFlagged || 0;
        document.getElementById('ai-flagged').textContent = stats.aiFlagged || 0;
        document.getElementById('both-flagged').textContent = stats.bothFlagged || 0;

        // Update Charts
        renderCharts(stats.academic, stats.regexFlagged, stats.aiFlagged, stats.bothFlagged || 0);
    }

    function renderCharts(academicCount, regexCount, aiCount, bothCount) {
        const ctxComparison = document.getElementById('comparisonChart').getContext('2d');
        const ctxDistribution = document.getElementById('distributionChart').getContext('2d');

        // Destroy existing charts to prevent hover glitches
        if (comparisonChartInstance) comparisonChartInstance.destroy();
        if (distributionChartInstance) distributionChartInstance.destroy();

        // --- Bar Chart: Regex vs AI Methods ---
        comparisonChartInstance = new Chart(ctxComparison, {
            type: 'bar',
            data: {
                labels: ['Regex / Rule-Based', 'AI (Naïve Bayes)', 'Caught by Both'],
                datasets: [{
                    label: 'Number of Flagged Messages',
                    data: [regexCount, aiCount, bothCount],
                    backgroundColor: [
                        '#ffd43b', // Yellow for Regex
                        '#fd7e14', // Orange for AI
                        '#87CEFA'  // Blue for Both
                    ],
                    borderColor: [
                        '#f5c211',
                        '#e8590c',
                        '#5b9bd5'
                    ],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // --- Doughnut Chart: Overall Distribution ---
        const totalFlagged = regexCount + aiCount + bothCount;
        distributionChartInstance = new Chart(ctxDistribution, {
            type: 'doughnut',
            data: {
                labels: ['Academic (Safe)', 'Non-Academic (Flagged)'],
                datasets: [{
                    data: [academicCount, totalFlagged],
                    backgroundColor: [
                        '#20c997', // Green for Academic
                        '#fa5252'  // Red for Flagged overall
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: { family: 'Inter', size: 13 }
                        }
                    }
                }
            }
        });
    }

    // --- Authentication & Session Logic ---
    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const btnLogout = document.getElementById('btn-logout');

    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Toggle Views
    showRegisterLink.onclick = (e) => { e.preventDefault(); loginView.style.display = 'none'; registerView.style.display = 'block'; };
    showLoginLink.onclick = (e) => { e.preventDefault(); registerView.style.display = 'none'; loginView.style.display = 'block'; };

    function initAuth() {
        chrome.storage.local.get(['currentUser'], (data) => {
            if (data.currentUser) {
                showDashboard(data.currentUser);
            } else {
                showAuth();
            }
        });
    }

    function showAuth() {
        authContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';
    }

    function showDashboard(user) {
        authContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        
        // Update user display
        document.getElementById('current-user-name').textContent = user.name;
        document.getElementById('current-user-role').textContent = user.role;

        // Role-based visibility
        const managementTab = document.getElementById('nav-management');
        if (user.role === 'admin') {
            managementTab.innerHTML = 'User Management';
            managementTab.style.display = 'block';
            document.getElementById('view-as').style.display = 'block'; // Admin can simulate
        } else {
            managementTab.innerHTML = 'User Dashboard';
            managementTab.style.display = 'block';
            document.getElementById('view-as').style.display = 'none'; // Users can't simulate
            
            // Auto-set view for non-admins
            if (user.role === 'student') {
                document.getElementById('student-view').style.display = 'block';
                document.getElementById('instructor-view').style.display = 'none';
                document.getElementById('admin-view').style.display = 'none';
            } else {
                document.getElementById('student-view').style.display = 'none';
                document.getElementById('instructor-view').style.display = 'block';
                document.getElementById('admin-view').style.display = 'none';
            }
        }
        
        loadUsers(); // Refresh data
    }

    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        chrome.storage.local.get(['users'], (data) => {
            let users = data.users || [];
            
            // Self-repair: Ensure admin exists and has correct password
            let admin = users.find(u => u.email === 'admin@vu.edu.pk');
            if (!admin) {
                admin = { id: 1, name: 'Admin User', email: 'admin@vu.edu.pk', role: 'admin', password: 'password123', status: 'active' };
                users.push(admin);
                chrome.storage.local.set({ users });
            } else if (admin.password !== 'password123') {
                admin.password = 'password123'; // Fix corrupted/stale password
                chrome.storage.local.set({ users });
            }
            
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                if (user.status === 'blocked') {
                    showAuthAlert('Your account is blocked. Please contact admin.', 'danger', 'login-alerts');
                    return;
                }
                chrome.storage.local.set({ currentUser: user }, () => {
                    showDashboard(user);
                });
            } else {
                showAuthAlert('Invalid email or password.', 'danger', 'login-alerts');
            }
        });
    };

    registerForm.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;

        chrome.storage.local.get(['users'], (data) => {
            let users = data.users || [
                { id: 1, name: 'Admin User', email: 'admin@vu.edu.pk', role: 'admin', password: 'password123', status: 'active' }
            ];

            if (users.find(u => u.email === email)) {
                showAuthAlert('Email already registered.', 'danger', 'register-alerts');
                return;
            }

            const newUser = {
                id: users.length + 1,
                name,
                email,
                password,
                role,
                status: 'active'
            };

            users.push(newUser);
            chrome.storage.local.set({ users }, () => {
                showAuthAlert('Registration successful! Please login.', 'success', 'login-alerts');
                loginView.style.display = 'block';
                registerView.style.display = 'none';
            });
        });
    };

    btnLogout.onclick = () => {
        chrome.storage.local.remove(['currentUser'], () => {
            showAuth();
        });
    };

    function showGlobalToast(msg, type) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${msg}</span>`;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function showAuthAlert(msg, type, containerId) {
        showGlobalToast(msg, type);
    }
    
    // Call Init
    initAuth();

    // Existing Navigation Logic ...
    const navAnalytics = document.getElementById('nav-analytics');
    const navManagement = document.getElementById('nav-management');
    const analyticsSection = document.getElementById('analytics-section');
    const managementSection = document.getElementById('management-section');

    navAnalytics.addEventListener('click', () => {
        navAnalytics.classList.add('active');
        navManagement.classList.remove('active');
        analyticsSection.style.display = 'block';
        managementSection.style.display = 'none';
        document.getElementById('alert-container').innerHTML = '';
    });

    navManagement.addEventListener('click', () => {
        navManagement.classList.add('active');
        navAnalytics.classList.remove('active');
        analyticsSection.style.display = 'none';
        managementSection.style.display = 'block';
        
        // Ensure proper section shows based on role when clicking tab
        chrome.storage.local.get(['currentUser'], (data) => {
            const user = data.currentUser;
            if (user.role === 'admin') {
                document.getElementById('admin-view').style.display = 'block';
                document.getElementById('student-view').style.display = 'none';
                document.getElementById('instructor-view').style.display = 'none';
            } else if (user.role === 'student') {
                document.getElementById('admin-view').style.display = 'none';
                document.getElementById('student-view').style.display = 'block';
                document.getElementById('instructor-view').style.display = 'none';
            } else {
                document.getElementById('admin-view').style.display = 'none';
                document.getElementById('student-view').style.display = 'none';
                document.getElementById('instructor-view').style.display = 'block';
            }
        });

        loadUsers(); 
    });

    // User Management Logic
    const userList = document.getElementById('user-list');
    const createUserForm = document.getElementById('create-user-form');
    const alertContainer = document.getElementById('alert-container');

    function showAlert(message, type) {
        showGlobalToast(message, type);
    }

    function loadUsers() {
        chrome.storage.local.get(['users'], (data) => {
            let users = data.users;
            if (!users) {
                // First time initialization with default prototype data
                users = [
                    { id: 1, name: 'Admin User', email: 'admin@vu.edu.pk', role: 'admin', password: 'password123', status: 'active' },
                    { id: 2, name: 'Ali', email: 'ali@student.com', role: 'student', password: 'password123', status: 'active' },
                    { id: 3, name: 'Dr. Sarah', email: 'sarah@instructor.com', role: 'instructor', password: 'password123', status: 'active' }
                ];
                chrome.storage.local.set({ users });
            }
            renderUserTable(users);
        });
    }

    function renderUserTable(users) {
        if (!userList) return;
        userList.innerHTML = '';
        users.forEach(u => {
            if (u.role === 'admin') return; 

            const tr = document.createElement('tr');
            const isActive = u.status === 'active';
            
            tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <select class="role-select" data-id="${u.id}">
                            <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
                            <option value="instructor" ${u.role === 'instructor' ? 'selected' : ''}>Instructor</option>
                        </select>
                        <button class="btn-action btn-apply" data-id="${u.id}">Apply</button>
                    </div>
                </td>
                <td><span class="${isActive ? 'status-active' : 'status-blocked'}">${u.status.toUpperCase()}</span></td>
                <td>
                    <button class="btn-action ${isActive ? 'btn-block' : 'btn-unblock'}" data-id="${u.id}">
                        ${isActive ? 'Block' : 'Unblock'}
                    </button>
                    <button class="btn-action btn-delete" data-id="${u.id}">Delete</button>
                </td>
            `;
            userList.appendChild(tr);
        });

        // Add Event Listeners for actions
        document.querySelectorAll('.btn-apply').forEach(btn => btn.addEventListener('click', handleRoleUpdate));
        document.querySelectorAll('.btn-block, .btn-unblock').forEach(btn => btn.addEventListener('click', handleStatusToggle));
        document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', handleDelete));
    }

    function handleRoleUpdate(e) {
        const id = parseInt(e.target.dataset.id);
        const select = document.querySelector(`.role-select[data-id="${id}"]`);
        const newRole = select.value;
        
        chrome.storage.local.get(['users'], (data) => {
            const users = data.users.map(u => u.id === id ? { ...u, role: newRole } : u);
            chrome.storage.local.set({ users }, () => {
                showAlert('User role updated successfully.', 'success');
                renderUserTable(users);
            });
        });
    }

    function handleStatusToggle(e) {
        const id = parseInt(e.target.dataset.id);
        chrome.storage.local.get(['users'], (data) => {
            const users = data.users.map(u => {
                if (u.id === id) {
                    return { ...u, status: u.status === 'active' ? 'blocked' : 'active' };
                }
                return u;
            });
            chrome.storage.local.set({ users }, () => {
                renderUserTable(users);
            });
        });
    }

    function handleDelete(e) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        const id = parseInt(e.target.dataset.id);
        chrome.storage.local.get(['users'], (data) => {
            const users = data.users.filter(u => u.id !== id);
            chrome.storage.local.set({ users }, () => {
                showAlert('User deleted successfully.', 'success');
                renderUserTable(users);
            });
        });
    }

    if (createUserForm) {
        createUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('new-name').value;
            const email = document.getElementById('new-email').value;
            const password = document.getElementById('new-password').value;
            const role = document.getElementById('new-role').value;

            chrome.storage.local.get(['users'], (data) => {
                const users = data.users || [];
                if (users.find(u => u.email === email)) {
                    showAlert('Email already exists.', 'danger');
                    return;
                }

                const newUser = {
                    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                    name,
                    email,
                    password,
                    role,
                    status: 'active'
                };

                const updatedUsers = [...users, newUser];
                chrome.storage.local.set({ users: updatedUsers }, () => {
                    showAlert('User created successfully.', 'success');
                    createUserForm.reset();
                    renderUserTable(updatedUsers);
                });
            });
        });
    }

    // View Switcher Logic (Only for Admin to simulate)
    const viewAsSelect = document.getElementById('view-as');
    if (viewAsSelect) {
        viewAsSelect.addEventListener('change', (e) => {
            const role = e.target.value;
            document.getElementById('current-user-role').textContent = role;
            
            if (role === 'admin') {
                document.getElementById('admin-view').style.display = 'block';
                document.getElementById('student-view').style.display = 'none';
                document.getElementById('instructor-view').style.display = 'none';
            } else if (role === 'student') {
                document.getElementById('admin-view').style.display = 'none';
                document.getElementById('student-view').style.display = 'block';
                document.getElementById('instructor-view').style.display = 'none';
            } else if (role === 'instructor') {
                document.getElementById('admin-view').style.display = 'none';
                document.getElementById('student-view').style.display = 'none';
                document.getElementById('instructor-view').style.display = 'block';
            }
        });
    }

});
