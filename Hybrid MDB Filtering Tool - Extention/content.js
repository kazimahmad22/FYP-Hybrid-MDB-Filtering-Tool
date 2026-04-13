// Store academic messages in a variable accessible within the script's scope
let academicMessages = [];

// Function to clear any existing highlighting from messages
function clearHighlighting() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        message.style.backgroundColor = ''; // Reset to default
    });
}

// Ensure the function is async to handle fetch calls
async function runFilter(keywords, ruleBasedEnabled, aiFilteringEnabled) {
    clearHighlighting(); // Clear previous highlights before applying new ones

    const posts = document.querySelectorAll('.post');
    
    // Create an array of RegExp objects from the keywords
    const regexPatterns = keywords.map(keyword => {
        try {
            return new RegExp(keyword, 'i');
        } catch (e) {
            console.warn(`Invalid regex pattern skipped: ${keyword}`);
            return null;
        }
    }).filter(Boolean); // Filter out any null (invalid) patterns

    let stats = {
        totalMessages: 0,
        regexFlagged: 0,
        aiFlagged: 0,
        bothFlagged: 0,
        academic: 0
    };

    for (const post of posts) {
        const messageElement = post.querySelector('.message');
        const senderElement = post.querySelector('.sender');

        if (messageElement && senderElement) {
            stats.totalMessages++;
            const messageText = messageElement.textContent;
            
            let flaggedByRegex = false;
            let flaggedByAI = false;

            // 1. Rule-Based Check (if enabled)
            if (ruleBasedEnabled) {
                flaggedByRegex = regexPatterns.some((pattern) => pattern.test(messageText));
            }

            // 2. AI-Based Check (if enabled, independently of regex)
            if (aiFilteringEnabled) {
                try {
                    const response = await fetch('http://localhost:3000/predict', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ text: messageText }),
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.label === 'non-academic') {
                            flaggedByAI = true;
                        }
                    }
                } catch (error) {
                    console.error('Error reaching AI model server:', error);
                }
            }

            // Apply styling or store message
            if (flaggedByRegex && flaggedByAI) {
                messageElement.style.backgroundColor = '#87CEFA'; // Blue for both
                stats.bothFlagged++;
            } else if (flaggedByRegex) {
                messageElement.style.backgroundColor = 'yellow'; // Rule-based only: Yellow
                stats.regexFlagged++;
            } else if (flaggedByAI) {
                messageElement.style.backgroundColor = 'orange'; // AI-based only: Orange
                stats.aiFlagged++;
            } else {
                // Otherwise, it's academic, so store it for export
                stats.academic++;
                academicMessages.push({
                    name: senderElement.textContent.trim(),
                    message: messageText.trim()
                });
            }
        }
    }

    // Save stats to local storage for the dashboard
    chrome.storage.local.set({ filteringStats: stats });

    console.clear();
    console.log(`*Academic Messages (Filtered with Regex: ${ruleBasedEnabled}, AI: ${aiFilteringEnabled})*`);
    console.table(academicMessages);
    console.log("Filtering Stats:", stats);
}

// --- Event Listeners ---

// 1. Listen for changes in chrome.storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        // Get the latest settings from storage and run the filter
        chrome.storage.sync.get(['filteringEnabled', 'aiFilteringEnabled', 'keywords'], (data) => {
            const ruleBasedEnabled = data.filteringEnabled !== false;
            const aiFilteringEnabled = data.aiFilteringEnabled === true;
            
            if (ruleBasedEnabled || aiFilteringEnabled) {
                runFilter(data.keywords || [], ruleBasedEnabled, aiFilteringEnabled);
            } else {
                clearHighlighting();
                console.clear();
                console.log("All filtering is disabled.");
            }
        });
    }
});

// 2. Run the filter when the script is first injected
chrome.storage.sync.get(['filteringEnabled', 'aiFilteringEnabled', 'keywords'], (data) => {
    const defaultKeywords = ["good", "present", "done", "sir"];
    const keywords = data.keywords || defaultKeywords;

    const ruleBasedEnabled = data.filteringEnabled !== false;
    const aiFilteringEnabled = data.aiFilteringEnabled === true;

    if (ruleBasedEnabled || aiFilteringEnabled) {
        runFilter(keywords, ruleBasedEnabled, aiFilteringEnabled);
    } else {
        console.log("All filtering is currently disabled.");
    }
});

// 3. Listen for messages from the popup (for CSV export)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getAcademicMessages") {
        sendResponse({ messages: academicMessages });
    }
    // This return true is important to keep the message channel open for the async response
    return true; 
});
