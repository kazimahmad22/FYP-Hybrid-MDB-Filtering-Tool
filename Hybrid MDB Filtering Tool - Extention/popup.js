document.addEventListener('DOMContentLoaded', () => {
    const filterToggle = document.getElementById('filter-toggle');
    const keywordInput = document.getElementById('keyword-input');
    const addKeywordBtn = document.getElementById('add-keyword-btn');
    const keywordList = document.getElementById('keyword-list');
    const exportBtn = document.getElementById('export-csv-btn');

    // Default keywords
    const defaultKeywords = ["good", "present", "done", "sir"];

    const aiFilterToggle = document.getElementById('ai-filter-toggle');

    // 1. Initialize UI from stored settings
    chrome.storage.sync.get(['filteringEnabled', 'aiFilteringEnabled', 'keywords'], (data) => {
        filterToggle.checked = data.filteringEnabled !== false; // enabled by default
        aiFilterToggle.checked = data.aiFilteringEnabled === true; // disabled by default
        const keywords = data.keywords || defaultKeywords;
        
        // If keywords were not in storage, save the defaults
        if (!data.keywords) {
            chrome.storage.sync.set({ keywords: defaultKeywords });
        }
        
        renderKeywords(keywords);
    });

    // 2. Toggle filtering enable/disable
    filterToggle.addEventListener('change', () => {
        const isEnabled = filterToggle.checked;
        chrome.storage.sync.set({ filteringEnabled: isEnabled });
    });

    aiFilterToggle.addEventListener('change', () => {
        const isEnabled = aiFilterToggle.checked;
        chrome.storage.sync.set({ aiFilteringEnabled: isEnabled });
    });

    // 3. Add new keyword
    addKeywordBtn.addEventListener('click', addKeyword);
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addKeyword();
        }
    });

    function addKeyword() {
        const newKeyword = keywordInput.value.trim().toLowerCase();
        if (newKeyword) {
            chrome.storage.sync.get('keywords', (data) => {
                const keywords = data.keywords || [];
                if (!keywords.includes(newKeyword)) {
                    const updatedKeywords = [...keywords, newKeyword];
                    chrome.storage.sync.set({ keywords: updatedKeywords }, () => {
                        renderKeywords(updatedKeywords);
                        keywordInput.value = '';
                    });
                } else {
                    // Optional: give user feedback that keyword already exists
                    keywordInput.value = '';
                }
            });
        }
    }

    // 4. Render the list of keywords in the UI
    function renderKeywords(keywords) {
        keywordList.innerHTML = ''; // Clear existing list
        keywords.forEach(keyword => {
            const li = document.createElement('li');
            li.textContent = keyword;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.className = 'remove-keyword';
            removeBtn.dataset.keyword = keyword;

            removeBtn.addEventListener('click', (e) => {
                const keywordToRemove = e.target.dataset.keyword;
                removeKeyword(keywordToRemove);
            });

            li.appendChild(removeBtn);
            keywordList.appendChild(li);
        });
    }

    // 5. Remove a keyword
    function removeKeyword(keywordToRemove) {
        chrome.storage.sync.get('keywords', (data) => {
            const keywords = data.keywords || [];
            const updatedKeywords = keywords.filter(k => k !== keywordToRemove);
            chrome.storage.sync.set({ keywords: updatedKeywords }, () => {
                renderKeywords(updatedKeywords);
            });
        });
    }

    const viewDashboardBtn = document.getElementById('view-dashboard-btn');

     // 6. View Dashboard Functionality
     if (viewDashboardBtn) {
        viewDashboardBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
        });
     }

     // 7. Export to CSV functionality
     exportBtn.addEventListener('click', () => {
        // Ask content script to get the academic messages
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getAcademicMessages" }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    showGlobalToast("Could not retrieve messages. Make sure you are on the correct page and have run the filter.", "danger");
                    return;
                }

                if (response && response.messages) {
                    downloadCSV(response.messages);
                } else {
                    showGlobalToast("No academic messages found to export.", "danger");
                }
            });
        });
    });

    function downloadCSV(messages) {
        // Add a header row
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Sender,Message\n" 
            + messages.map(e => `"${e.name.replace(/"/g, '""')}","${e.message.replace(/"/g, '""')}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "academic_messages.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

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
});
