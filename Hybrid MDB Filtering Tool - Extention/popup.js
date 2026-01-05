document.addEventListener('DOMContentLoaded', () => {
    const filterToggle = document.getElementById('filter-toggle');
    const keywordInput = document.getElementById('keyword-input');
    const addKeywordBtn = document.getElementById('add-keyword-btn');
    const keywordList = document.getElementById('keyword-list');
    const exportBtn = document.getElementById('export-csv-btn');

    // Default keywords
    const defaultKeywords = ["good", "present", "done", "sir"];

    // 1. Initialize UI from stored settings
    chrome.storage.sync.get(['filteringEnabled', 'keywords'], (data) => {
        filterToggle.checked = data.filteringEnabled !== false; // enabled by default
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

     // 6. Export to CSV functionality
     exportBtn.addEventListener('click', () => {
        // Ask content script to get the academic messages
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getAcademicMessages" }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    alert("Could not retrieve messages. Make sure you are on the correct page and have run the filter.");
                    return;
                }

                if (response && response.messages) {
                    downloadCSV(response.messages);
                } else {
                    alert("No academic messages found to export.");
                }
            });
        });
    });

    function downloadCSV(messages) {
        // Add a header row
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Academic Messages\n" 
            + messages.map(e => `"${e.replace(/"/g, '""')}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "academic_messages.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
