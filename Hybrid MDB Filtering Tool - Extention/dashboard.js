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
        
        // Merge Regex and AI into one box separate by hyphen
        const regexVal = stats.regexFlagged || 0;
        const aiVal = stats.aiFlagged || 0;
        const combEl = document.getElementById('non-academic-combined');
        if (combEl) combEl.textContent = `${regexVal} - ${aiVal}`;

        // Update Charts
        renderCharts(stats.academic, regexVal, aiVal);
    }

    function renderCharts(academicCount, regexCount, aiCount) {
        const ctxComparison = document.getElementById('comparisonChart').getContext('2d');
        const ctxDistribution = document.getElementById('distributionChart').getContext('2d');

        // Destroy existing charts to prevent hover glitches
        if (comparisonChartInstance) comparisonChartInstance.destroy();
        if (distributionChartInstance) distributionChartInstance.destroy();

        // --- Bar Chart: Regex vs AI Methods ---
        comparisonChartInstance = new Chart(ctxComparison, {
            type: 'bar',
            data: {
                labels: ['Regex / Rule-Based', 'AI (Naïve Bayes)'],
                datasets: [{
                    label: 'Number of Flagged Messages',
                    data: [regexCount, aiCount],
                    backgroundColor: [
                        '#ffd43b', // Yellow for Regex
                        '#fd7e14'  // Orange for AI
                    ],
                    borderColor: [
                        '#f5c211',
                        '#e8590c'
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
        const totalFlagged = regexCount + aiCount;
        distributionChartInstance = new Chart(ctxDistribution, {
            type: 'doughnut',
            data: {
                labels: ['Academic', 'Non-Academic (Flagged)'],
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

        const analyticsTab = document.getElementById('nav-analytics');
        const managementTab = document.getElementById('nav-management');
        const analyticsSection = document.getElementById('analytics-section');
        const managementSection = document.getElementById('management-section');

        // Role-based visibility and Header Update
        const mainTitle = document.getElementById('dashboard-main-title');
        const subTitle = document.getElementById('dashboard-subtitle');

        if (user.role === 'admin') {
            if (mainTitle) mainTitle.textContent = 'Filtering Performance Dashboard';
            if (subTitle) subTitle.style.display = 'block';
            
            managementTab.innerHTML = 'User Management';
            managementTab.style.display = 'block';
            analyticsTab.style.display = 'block'; // Admin sees analytics

            document.getElementById('admin-view').style.display = 'block';
            document.getElementById('student-view').style.display = 'none';
            document.getElementById('instructor-view').style.display = 'none';
        } else {
            if (subTitle) subTitle.style.display = 'none';
            managementTab.innerHTML = 'User Dashboard';
            managementTab.style.display = 'block';

            if (user.role === 'student') {
                if (mainTitle) mainTitle.textContent = 'Student Dashboard';
                analyticsTab.style.display = 'none'; // Student CANNOT see analytics
                document.getElementById('student-view').style.display = 'block';
                document.getElementById('instructor-view').style.display = 'none';
                document.getElementById('admin-view').style.display = 'none';
                const greetingName = document.getElementById('student-greeting-name');
                if (greetingName) greetingName.textContent = user.name;
                loadStudentQueries();
            } else if (user.role === 'instructor') {
                if (mainTitle) mainTitle.textContent = 'Instructor Dashboard';
                analyticsTab.style.display = 'block'; // Instructor sees analytics
                document.getElementById('student-view').style.display = 'none';
                document.getElementById('instructor-view').style.display = 'block';
                document.getElementById('admin-view').style.display = 'none';
                
                // Show instructor username in the header
                const instrHeader = document.querySelector('#instructor-view h3');
                if (instrHeader) instrHeader.innerHTML = `Instructor Panel: ${user.name}`;

                loadAllQueries();
            }
        }

        // --- PRIMARY FOCUS PIVOT: Default to Management/User Dashboard ---
        analyticsTab.classList.remove('active');
        managementTab.classList.add('active');
        analyticsSection.style.display = 'none';
        managementSection.style.display = 'block';
        
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
                const greetingName = document.getElementById('student-greeting-name');
                if (greetingName) greetingName.textContent = user.name;
                loadStudentQueries();
            } else {
                document.getElementById('admin-view').style.display = 'none';
                document.getElementById('student-view').style.display = 'none';
                document.getElementById('instructor-view').style.display = 'block';
                loadAllQueries();
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

    // Query Management for Students
    const queryForm = document.getElementById('query-form');
    const queryHistoryList = document.getElementById('query-history-list');
    const noQueriesMsg = document.getElementById('no-queries-msg');
    
    // Toggle Query Form Visibility
    const btnShowQueryForm = document.getElementById('btn-show-query-form');
    const btnCancelQuery = document.getElementById('btn-cancel-query');
    const queryFormContainer = document.getElementById('query-form-container');

    if (btnShowQueryForm) {
        btnShowQueryForm.addEventListener('click', () => {
            queryFormContainer.style.display = 'block';
            btnShowQueryForm.style.display = 'none';
        });
    }

    if (btnCancelQuery) {
        btnCancelQuery.addEventListener('click', () => {
            queryFormContainer.style.display = 'none';
            btnShowQueryForm.style.display = 'block';
        });
    }

    if (queryForm) {
        queryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const queryText = document.getElementById('query-text').value.trim();
            
            if (!queryText) {
                showAlert('Please enter a query.', 'danger');
                return;
            }

            chrome.storage.local.get(['currentUser', 'studentQueries'], (data) => {
                const user = data.currentUser;
                let queries = data.studentQueries || [];
                
                // Get keywords for rule-based check
                chrome.storage.sync.get(['keywords', 'aiFilteringEnabled'], async (syncData) => {
                    const keywords = syncData.keywords || ["good", "present", "done", "sir"];
                    const aiEnabled = syncData.aiFilteringEnabled === true;
                    
                    let classification = 'academic';
                    
                    // 1. Rule-based check
                    const regexPatterns = keywords.map(k => new RegExp(k, 'i'));
                    const flaggedByRegex = regexPatterns.some(p => p.test(queryText));
                    
                    if (flaggedByRegex) {
                        classification = 'non-academic';
                    } else if (aiEnabled) {
                        // 2. AI-based check
                        try {
                            const aiRes = await fetch('http://localhost:3000/predict', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text: queryText })
                            });
                            if (aiRes.ok) {
                                const aiData = await aiRes.json();
                                classification = aiData.label; // 'academic' or 'non-academic'
                            }
                        } catch (e) {
                            console.error("AI Server unreachable for classification", e);
                        }
                    }

                    const newQuery = {
                        id: Date.now(),
                        studentId: user.id,
                        studentName: user.name,
                        text: queryText,
                        timestamp: new Date().toISOString(),
                        status: 'submitted',
                        category: classification // 'academic' or 'non-academic'
                    };

                    queries.unshift(newQuery);
                    chrome.storage.local.set({ studentQueries: queries }, () => {
                        document.getElementById('query-text').value = '';
                        showAlert(`Query submitted successfully! (Classified as: ${classification})`, 'success');
                        
                        // Hide form and show button again
                        if (queryFormContainer) queryFormContainer.style.display = 'none';
                        if (btnShowQueryForm) btnShowQueryForm.style.display = 'block';

                        loadStudentQueries();

                        // Sync with Mock LMS
                        fetch('http://localhost:5501/api/queries', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newQuery)
                        }).catch(() => {});
                    });
                });
            });
        });
    }

    // Instructor queries — load all from storage and render
    function loadAllQueries() {
        chrome.storage.local.get(['studentQueries'], (data) => {
            const queries = data.studentQueries || [];
            renderInstructorQueries(queries);
        });
    }

    function renderInstructorQueries(queries) {
        const academicList = document.getElementById('academic-query-list');
        const nonAcademicList = document.getElementById('non-academic-query-list');
        const academicCountEl = document.getElementById('academic-count');
        const nonAcademicCountEl = document.getElementById('non-academic-count');

        if (!academicList || !nonAcademicList) return;

        academicList.innerHTML = '';
        nonAcademicList.innerHTML = '';

        const academicQueries = queries.filter(q => q.category !== 'non-academic');
        const nonAcademicQueries = queries.filter(q => q.category === 'non-academic');

        academicCountEl.textContent = academicQueries.length;
        nonAcademicCountEl.textContent = nonAcademicQueries.length;

        if (academicQueries.length === 0) {
            academicList.innerHTML = '<p style="color: #6c757d; font-style: italic; text-align: center; padding: 20px;">No academic queries.</p>';
        } else {
            academicQueries.forEach(q => academicList.appendChild(createQueryItem(q)));
        }

        if (nonAcademicQueries.length === 0) {
            nonAcademicList.innerHTML = '<p style="color: #6c757d; font-style: italic; text-align: center; padding: 20px;">No non-academic queries.</p>';
        } else {
            nonAcademicQueries.forEach(q => nonAcademicList.appendChild(createQueryItem(q)));
        }
    }

    function createQueryItem(query) {
        const div = document.createElement('div');
        div.className = 'instructor-query-item';
        // Add specific styling for non-academic entries in the list
        if (query.category === 'non-academic') {
            div.style.borderLeftColor = '#e03131';
            div.style.background = '#fffafa';
        } else {
            div.style.borderLeftColor = '#2b8a3e';
            div.style.background = '#f8fff9';
        }

        const date = new Date(query.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const replies = query.replies || (query.reply ? [query.reply] : []);
        let replySection = '';
        if (replies.length > 0) {
            // Sort latest first and map to HTML
            replySection = [...replies].reverse().map(r => {
                const rText = typeof r === 'string' ? r : r.text;
                const rTime = typeof r === 'string' ? '' : new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `<div class="instructor-reply-box" style="margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <strong>INSTRUCTOR:</strong>
                                <span style="font-size: 10px; color: #6c757d;">${rTime}</span>
                            </div>
                            ${escapeHtml(rText)}
                        </div>`;
            }).join('');
        }

        // Add checkbox for non-academic queries for bulk reply
        const checkbox = query.category === 'non-academic'
            ? `<input type="checkbox" class="query-checkbox" data-id="${query.id}" style="margin-right: 10px; cursor: pointer;">`
            : '';

        div.innerHTML = `
            <div style="display: flex; align-items: flex-start;">
                ${checkbox}
                <div style="flex: 1;">
                    <div class="instructor-query-meta">
                        <strong>${escapeHtml(query.studentName)}</strong>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="instructor-query-text">${escapeHtml(query.text)}</div>
                    ${replySection}
                    <div class="instructor-query-actions">
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-action btn-reply" data-id="${query.id}" style="background: var(--accent-black); color: white; width: auto; margin:0;">Reply</button>
                            <button class="btn-action btn-delete-query" data-id="${query.id}" style="background: #e03131; color: white; width: auto; margin:0;">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Attach checkbox listener if present
        const cb = div.querySelector('.query-checkbox');
        if (cb) {
            cb.addEventListener('change', updateBulkActionBar);
        }

        return div;
    }

    function updateBulkActionBar() {
        const selected = document.querySelectorAll('#non-academic-query-list .query-checkbox:checked');
        const bar = document.getElementById('bulk-action-bar');
        const countTxt = document.getElementById('bulk-select-count');
        
        if (selected.length > 0) {
            bar.style.display = 'flex';
            countTxt.textContent = `${selected.length} selected`;
        } else {
            bar.style.display = 'none';
        }
    }

    async function deleteQuery(id) {
        if (!confirm('Are you sure you want to delete this query? This will also remove it from the LMS discussion board.')) return;

        try {
            console.log(`Attempting to delete query ${id}...`);
            const res = await fetch(`http://localhost:5501/api/queries/${id}`, { 
                method: 'DELETE',
                mode: 'cors'
            });

            if (res.ok) {
                console.log(`Successfully deleted query ${id} from server.`);
                chrome.storage.local.get(['studentQueries'], (data) => {
                    const originalQueries = data.studentQueries || [];
                    const filteredQueries = originalQueries.filter(q => q.id !== id);
                    
                    chrome.storage.local.set({ studentQueries: filteredQueries }, () => {
                        console.log(`Local storage updated for query ${id}.`);
                        renderInstructorQueries(filteredQueries);
                        showGlobalToast('Query deleted successfully.', 'success');
                    });
                });
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Server Delete Failed:", res.status, errorData);
                showGlobalToast(`Failed to delete query from LMS (Status: ${res.status}).`, 'danger');
            }
        } catch (e) {
            console.error("Fetch Delete Error:", e);
            showGlobalToast('Connection error: Could not reach LMS server.', 'danger');
        }
    }

    document.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        
        if (e.target.classList.contains('btn-delete-query')) {
            deleteQuery(id);
        }
        if (e.target.classList.contains('btn-reply')) {
            openReplyModalWithId(id);
        }
        if (e.target.id === 'btn-bulk-reply') {
            openBulkReplyModal();
        }
    });

    function openReplyModalWithId(id) {
        const modal = document.getElementById('reply-modal');
        chrome.storage.local.get(['studentQueries'], (data) => {
            const queries = data.studentQueries || [];
            const query = queries.find(q => q.id === id);
            if (query) {
                document.getElementById('reply-query-text').textContent = query.text;
                document.getElementById('reply-text').value = '';
                modal.style.display = 'flex';
                modal.dataset.queryId = id;
                modal.dataset.bulk = 'false';
            }
        });
    }

    function openBulkReplyModal() {
        const selected = document.querySelectorAll('#non-academic-query-list .query-checkbox:checked');
        const count = selected.length;
        
        document.getElementById('reply-query-text').textContent = `Replying to ${count} non-academic queries at once.`;
        document.getElementById('reply-text').value = '';
        document.getElementById('reply-modal').style.display = 'flex';
        document.getElementById('reply-modal').dataset.bulk = 'true';
        
        const ids = Array.from(selected).map(cb => parseInt(cb.dataset.id));
        document.getElementById('reply-modal').dataset.queryIds = JSON.stringify(ids);
    }

    // Select All logic
    const selectAllCb = document.getElementById('select-all-non-academic');
    if (selectAllCb) {
        selectAllCb.addEventListener('change', (e) => {
            const cbs = document.querySelectorAll('#non-academic-query-list .query-checkbox');
            cbs.forEach(cb => cb.checked = e.target.checked);
            updateBulkActionBar();
        });
    }

    async function reScanAllQueries() {
        const btn = document.getElementById('btn-scan-all');
        const indicator = document.getElementById('scan-indicator');
        if (!btn || !indicator) return;

        btn.style.opacity = '0.5';
        btn.disabled = true;
        indicator.style.display = 'flex';

        chrome.storage.sync.get(['keywords', 'aiFilteringEnabled'], (syncData) => {
            const keywords = syncData.keywords || [];
            const aiEnabled = syncData.aiFilteringEnabled === true;
            const regexPatterns = keywords.map(k => new RegExp(k, 'i'));

            chrome.storage.local.get(['studentQueries'], async (data) => {
                let queries = data.studentQueries || [];
                
                for (let query of queries) {
                    let classification = 'academic';
                    const flaggedByRegex = regexPatterns.some(p => p.test(query.text));
                    
                    if (flaggedByRegex) {
                        classification = 'non-academic';
                    } else if (aiEnabled) {
                        try {
                            const aiRes = await fetch('http://localhost:3000/predict', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text: query.text })
                            });
                            if (aiRes.ok) {
                                const aiData = await aiRes.json();
                                classification = aiData.label;
                            }
                        } catch (e) {
                            console.error("AI Server unreachable for re-scan", e);
                        }
                    }
                    query.category = classification;
                }

                chrome.storage.local.set({ studentQueries: queries }, () => {
                    renderInstructorQueries(queries);
                    btn.style.opacity = '1';
                    btn.disabled = false;
                    indicator.style.display = 'none';
                    showGlobalToast('Re-scan completed! Queries have been re-segregated.', 'success');
                });
            });
        });
    }

    const btnScanAll = document.getElementById('btn-scan-all');
    if (btnScanAll) {
        btnScanAll.addEventListener('click', reScanAllQueries);
    }

    function openReplyModal(e) {
        const queryId = parseInt(e.target.dataset.id);
        const queryText = e.target.closest('.instructor-query-item').querySelector('.instructor-query-text').textContent;

        document.getElementById('reply-query-text').textContent = queryText;
        document.getElementById('reply-text').value = '';
        document.getElementById('reply-modal').style.display = 'flex';
        document.getElementById('reply-modal').dataset.queryId = queryId;
    }

    document.getElementById('reply-modal-close').addEventListener('click', () => {
        document.getElementById('reply-modal').style.display = 'none';
    });

    document.getElementById('reply-cancel-btn').addEventListener('click', () => {
        document.getElementById('reply-modal').style.display = 'none';
    });

    document.getElementById('reply-submit-btn').addEventListener('click', () => {
        const modal = document.getElementById('reply-modal');
        const replyText = document.getElementById('reply-text').value.trim();
        if (!replyText) {
            showGlobalToast('Please enter a reply.', 'danger');
            return;
        }

        const isBulk = modal.dataset.bulk === 'true';

        chrome.storage.local.get(['studentQueries'], async (data) => {
            let queries = data.studentQueries || [];
            
            if (isBulk) {
                const queryIds = JSON.parse(modal.dataset.queryIds);
                const replyObj = { text: replyText, timestamp: new Date().toISOString() };
                queries = queries.map(q => {
                    if (queryIds.includes(q.id)) {
                        const updated = { ...q, status: 'replied' };
                        if (!updated.replies) updated.replies = [];
                        updated.replies.push(replyObj);
                        updated.reply = replyText;
                        return updated;
                    }
                    return q;
                });
            } else {
                const queryId = parseInt(modal.dataset.queryId);
                const replyObj = { text: replyText, timestamp: new Date().toISOString() };
                queries = queries.map(q => {
                    if (q.id === queryId) {
                        const updated = { ...q, status: 'replied' };
                        if (!updated.replies) updated.replies = [];
                        updated.replies.push(replyObj);
                        updated.reply = replyText;
                        return updated;
                    }
                    return q;
                });
            }

            chrome.storage.local.set({ studentQueries: queries }, async () => {
                showGlobalToast(isBulk ? 'Bulk replies sent!' : 'Reply sent successfully!', 'success');
                modal.style.display = 'none';
                loadAllQueries();

                // Reset select all if it was bulk
                if (isBulk) {
                    const selectAllCb = document.getElementById('select-all-non-academic');
                    if (selectAllCb) selectAllCb.checked = false;
                    updateBulkActionBar();
                }

                // Sync with Mock LMS
                if (isBulk) {
                    const queryIds = JSON.parse(modal.dataset.queryIds);
                    for (const id of queryIds) {
                        await fetch(`http://localhost:5501/api/queries/${id}/reply`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ reply: replyText })
                        }).catch(() => {});
                    }
                } else {
                    const queryId = parseInt(modal.dataset.queryId);
                    await fetch(`http://localhost:5501/api/queries/${queryId}/reply`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reply: replyText })
                    }).catch(() => {});
                }
            });
        });
    });

    // Student queries — also fetch from Mock LMS API for instructor replies
    function loadStudentQueries() {
        chrome.storage.local.get(['currentUser', 'studentQueries'], (data) => {
            const user = data.currentUser;
            const localQueries = data.studentQueries || [];
            const studentQueries = localQueries.filter(q => q.studentId === user.id);

            // Also fetch from Mock LMS API to get replies
            fetch('http://localhost:5501/api/queries')
                .then(res => res.json())
                .then(lmsQueries => {
                    const merged = studentQueries.map(sq => {
                        const lmsQuery = lmsQueries.find(lq => lq.id === sq.id);
                        if (lmsQuery && lmsQuery.reply) {
                            return { ...sq, status: lmsQuery.status || sq.status, reply: lmsQuery.reply };
                        }
                        return sq;
                    });
                    renderStudentQueries(merged);
                })
                .catch(() => {
                    renderStudentQueries(studentQueries);
                });
        });
    }

    function renderStudentQueries(studentQueries) {
        if (queryHistoryList) {
            queryHistoryList.innerHTML = '';

            if (studentQueries.length === 0) {
                noQueriesMsg.style.display = 'block';
            } else {
                noQueriesMsg.style.display = 'none';

                studentQueries.forEach(query => {
                    const div = document.createElement('div');
                    div.className = 'query-item';

                    const date = new Date(query.timestamp);
                    const formattedDate = date.toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    });

                    let replySection = '';
                    const replies = query.replies || (query.reply ? [query.reply] : []);
                    if (replies.length > 0) {
                        replySection = [...replies].reverse().map(r => {
                            const rText = typeof r === 'string' ? r : r.text;
                            const rTime = typeof r === 'string' ? '' : new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return `<div class="query-reply-box" style="margin-top: 5px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                            <strong>INSTRUCTOR:</strong>
                                            <span style="font-size: 10px; color: #6c757d;">${rTime}</span>
                                        </div>
                                        ${escapeHtml(rText)}
                                    </div>`;
                        }).join('');
                    }

                    div.innerHTML = `
                        <div class="query-text">${escapeHtml(query.text)}</div>
                        ${replySection}
                        <div class="query-meta">
                            <span>${formattedDate}</span>
                            <span class="query-status ${query.status}">${query.status}</span>
                        </div>
                    `;
                    queryHistoryList.appendChild(div);
                });
            }
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

});
