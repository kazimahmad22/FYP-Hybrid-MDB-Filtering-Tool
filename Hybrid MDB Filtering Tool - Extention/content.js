// Store academic messages in a variable accessible within the script's scope
let academicMessages = [];

// Function to clear any existing highlighting from messages
function clearHighlighting() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        message.style.backgroundColor = ''; // Reset to default
    });
}

// The main function to filter and highlight messages
function runFilter(keywords) {
    clearHighlighting(); // Clear previous highlights before applying new ones

    const posts = document.querySelectorAll('.post');
    
    // Create an array of RegExp objects from the keywords. 'i' flag makes them case-insensitive.
    const regexPatterns = keywords.map(keyword => {
        try {
            return new RegExp(keyword, 'i');
        } catch (e) {
            console.warn(`Invalid regex pattern skipped: ${keyword}`);
            return null;
        }
    }).filter(Boolean); // Filter out any null (invalid) patterns

    academicMessages = []; // Reset the list for the new filter run

    posts.forEach((post) => {
        const messageElement = post.querySelector('.message');
        const senderElement = post.querySelector('.sender');

        if (messageElement && senderElement) {
            const messageText = messageElement.textContent;
            const isNonAcademic = regexPatterns.some((pattern) => pattern.test(messageText));

            if (isNonAcademic) {
                // Highlight non-academic messages
                messageElement.style.backgroundColor = 'yellow';
            } else {
                // Otherwise, it's academic, so store it for export
                academicMessages.push({
                    name: senderElement.textContent.trim(),
                    message: messageText.trim()
                });
            }
        }
    });

    console.clear(); // Clear console for clean output
    console.log("*Academic Messages (Filtered with Regex)*");
    console.table(academicMessages);
}

// --- Event Listeners ---

// 1. Listen for changes in chrome.storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        // Get the latest settings from storage and run the filter
        chrome.storage.sync.get(['filteringEnabled', 'keywords'], (data) => {
            if (data.filteringEnabled !== false) {
                runFilter(data.keywords || []);
            } else {
                clearHighlighting();
                console.clear();
                console.log("Filtering is disabled.");
            }
        });
    }
});

// 2. Run the filter when the script is first injected
chrome.storage.sync.get(['filteringEnabled', 'keywords'], (data) => {
    const defaultKeywords = ["good", "present", "done", "sir"];
    const keywords = data.keywords || defaultKeywords;

    if (data.filteringEnabled !== false) {
        runFilter(keywords);
    } else {
        console.log("Filtering is currently disabled.");
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
