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
async function runFilter(keywords, ruleBasedEnabled, aiFilteringEnabled, highlightingEnabled) {
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

            // 1. Mandatory Rule-Based Check (Phone numbers, greetings, social noise)
            const mandatoryNoiseRegex = [
                /03\d{9}/, /\d{4}-\d{7}/, // Phone numbers
                /https?:\/\/[^\s]+/, // URLs
                /\b(how are you|how is your health|hope you are well|how do you do)\b/i, // Social noise
                /\b(hello|hi|hey|greetings)\b/i // Greetings (standalone check)
            ];
            
            const isMandatoryNoise = mandatoryNoiseRegex.some(p => p.test(messageText));
            if (isMandatoryNoise) {
                flaggedByRegex = true;
            }

            // 2. Rule-Based Check (from user keywords, if enabled)
            if (!flaggedByRegex && ruleBasedEnabled) {
                flaggedByRegex = regexPatterns.some((pattern) => pattern.test(messageText));
            }

            // 3. AI-Based Check (if enabled, independently of regex)
            if (!flaggedByRegex && aiFilteringEnabled) {
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
            if (flaggedByRegex) {
                if (highlightingEnabled !== false) {
                    messageElement.style.backgroundColor = 'yellow'; // Rule-based: Yellow
                }
                stats.regexFlagged++;
            } else if (flaggedByAI) {
                if (highlightingEnabled !== false) {
                    messageElement.style.backgroundColor = 'orange'; // AI-based: Orange
                }
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
        chrome.storage.sync.get(['filteringEnabled', 'aiFilteringEnabled', 'highlightingEnabled', 'keywords'], (data) => {
            const ruleBasedEnabled = data.filteringEnabled !== false;
            const aiFilteringEnabled = data.aiFilteringEnabled === true;
            const highlightingEnabled = data.highlightingEnabled !== false;
            
            if (ruleBasedEnabled || aiFilteringEnabled) {
                runFilter(data.keywords || [], ruleBasedEnabled, aiFilteringEnabled, highlightingEnabled);
            } else {
                clearHighlighting();
                console.clear();
                console.log("All filtering is disabled.");
            }
        });
    }
});

// 2. Run the filter when the script is first injected
chrome.storage.sync.get(['filteringEnabled', 'aiFilteringEnabled', 'highlightingEnabled', 'keywords'], (data) => {
    const defaultKeywords = [
        "hello", "hi", "greetings", "good morning", "asalaam", "respected sir", "respected professor",
        "thank you", "thanks", "jazakallah", "appreciated",
        "03\\d{9}", "\\d{4}-\\d{7}", "https?:\\/\\/[^\\s]+" // Phone numbers and URLs
    ];
    const keywords = data.keywords || defaultKeywords;

    const ruleBasedEnabled = data.filteringEnabled !== false;
    const aiFilteringEnabled = data.aiFilteringEnabled === true;
    const highlightingEnabled = data.highlightingEnabled !== false;

    if (ruleBasedEnabled || aiFilteringEnabled) {
        runFilter(keywords, ruleBasedEnabled, aiFilteringEnabled, highlightingEnabled);
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
