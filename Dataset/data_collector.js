const fs = require('fs');
const path = require('path');

const DATASET_FILE = path.join(__dirname, 'labeled_messages.csv');

// --- ACADEMIC TEMPLATES (Intent: Course-related queries, including logistics) ---
const ACADEMIC_TEMPLATES = [
    // 1. Purely Technical (No social fluff)
    "Explain the concept of {topic}.",
    "Define {topic} and its use case.",
    "Difference between {topic_a} and {topic_b}.",
    "How does {algorithm} handle {topic}?",
    "{topic} definition in network security.",
    "Output of {algorithm} for input {result}.",
    
    // 2. Technical with minimal honorifics (Direct)
    "I need help with {topic}.",
    "Explain {topic} in detail.",
    "Question regarding {theory}.",
    "Implementation of {topic} using recursion?",
    "Slides for week {n} regarding {topic}.",
    
    // 3. Syllabus & Logistics
    "Deadline for {assignment_type}?",
    "When will the results for quiz {n} be published?",
    "What is the weightage of the final exam?",
    "Grading rubric for the project is not clear.",
    
    // 4. Platform Issues
    "Lecture video for week {n} is not playing.",
    "Broken link on the module page for {topic}.",
    "I can't read the material on {topic}."
];

// --- NON-ACADEMIC TEMPLATES (Intent: Noise - Contact, Links, Greetings, Thanks) ---
const NON_ACADEMIC_TEMPLATES = [
    // 1. Contact Information
    "Please add me to the study group. My number is {phone}.",
    "My contact number is {phone}, contact me for solved papers.",
    "Students, join the discussion on WhatsApp: {phone}.",
    "{phone} - call me for help.",

    // 2. Links
    "Check out this helpful link for the assignment: {url}",
    "Solve your quiz easily here: {url}",
    "Sub to my channel for VU updates: {url}",
    "Download the solution from: {url}",
    "Join our Telegram channel: {url}",

    // 3. Greetings & Social (HIGH FREQUENCY)
    "Hello {sir}", "Hi", "Good morning", "Asalaam-o-Alaikum", "Hello everyone", 
    "hello", "hi", "hey", "AOA", "aoa", "AOA Sir", "WS", "ws", "Walaikum Assalam",
    "Respected {sir}, Hope you are well.",
    "Greetings to all students and staff.",
    "How are you doing {sir}?", "How are you?", "{sir}, how are you?", "How is your health?",
    "Hope you are having a good day.",
    "Is it raining there?", "Weather is nice today.", "{sir} I am your big fan.",

    // Phone / Spam patterns
    "Join me {phone}", "Contact {phone}", "03{n}{n}{n}{n}{n}{n}{n}{n}",

    // 4. Thank You & Acknowledgement
    "Thank you {sir}", "Thanks for the lecture", "Thanks!", "Jazakallah",
    "Great explanation, thank you.", "Got it, thanks.", "Thank you", "thanks", "thx",
    "Highly appreciated, thank you so much.", "Understood {sir}.",
    "Ok {sir}", "Yes {sir}", "No {sir}",

    // 5. Short Noise & Presence (Targeted)
    "Present", "Present sir", "present", "Present {sir}", "P", "p",
    "done", "nice", "good", "ok", "okey", "yes", "no", "working", "checked", "i am here",
    "me too", "same here", "agree", "correct", "true", "Lol", "lol", "LOL", "haha", "LMAO",

    // 6. Abusive / Inappropriate Language
    "You are a bad teacher.", "This course is trash.", "Useless lecture.",
    "Go away.", "Shut up.", "Stupid explanation.", "I hate this.",
    "idiot", "shame on you", "rubbish", "worst staff", "unprofessional",
    "toxic", "waste of time", "nonsense", "stop talking", "you know nothing",
    "asdasdasd", "qwertyuiop", "..........", "!!!!!!!!!!",

    // 7. Character Repetition (Noise)
    "thaaaank you", "helloooooo", "siiiiiiiiir", "pleaseeeee", "thanksaaaaa",
    "AOAaaaa", "LOLzzzz", "Presentttttt", "okkkkkk", "yesssssss"
];

const TOPICS = ["Ethernet", "CSMA/CD", "CSMA/CA", "IP addresses", "ARP", "TCP/IP Stack", "Routing", "Switching", "Bridges", "HTTP", "FTP", "Firewalls", "OSI Model", "Routers", "Gateways"];
const THEORIES = ["Big O notation", "NP-completeness", "Bernoulli's principle", "CAP theorem"];
const ALGORITHMS = ["QuickSort", "Dijkstra", "A*", "Backpropagation", "Round Robin"];
const ASSIGNMENT_TYPES = ["Assignment", "Quiz", "GDB", "Final Project", "Midterm"];
const ERRORS = ["NullPointerException", "Segmentation Fault", "IndexOutOfRange", "ModuleNotFound"];
const FORMATS = [".zip", ".pdf", ".docx", ".cpp", ".py"];
const URLS = ["http://bit.ly/study-help", "http://vu-solved.com", "http://youtube.com/vuchannel", "http://drive.google.com/xyz"];

function replacePlaceholders(template) {
    return template
        .replace(/{topic}/g, TOPICS[Math.floor(Math.random() * TOPICS.length)])
        .replace(/{topic_a}/g, TOPICS[0])
        .replace(/{topic_b}/g, TOPICS[1])
        .replace(/{theory}/g, THEORIES[Math.floor(Math.random() * THEORIES.length)])
        .replace(/{algorithm}/g, ALGORITHMS[Math.floor(Math.random() * ALGORITHMS.length)])
        .replace(/{other_method}/g, ALGORITHMS[2])
        .replace(/{assignment_type}/g, ASSIGNMENT_TYPES[Math.floor(Math.random() * ASSIGNMENT_TYPES.length)])
        .replace(/{error}/g, ERRORS[Math.floor(Math.random() * ERRORS.length)])
        .replace(/{n}/g, Math.floor(Math.random() * 5) + 1)
        .replace(/{m}/g, Math.floor(Math.random() * 10) + 1)
        .replace(/{result}/g, "404")
        .replace(/{expected}/g, "200")
        .replace(/{format}/g, FORMATS[Math.floor(Math.random() * FORMATS.length)])
        .replace(/{required_format}/g, FORMATS[0])
        .replace(/{sir}/g, ["Sir", "Madam", "Professor", "Dr.", "Instructor"][Math.floor(Math.random() * 5)])
        .replace(/{phone}/g, "03" + Math.floor(100000000 + Math.random() * 900000000))
        .replace(/{url}/g, URLS[Math.floor(Math.random() * URLS.length)]);
}

function generateData(count) {
    console.log(`Generating a balanced dataset of ${count} messages based on NEW simplified rules...`);
    let csvContent = "message_content,label\n";

    const criticalNoise = ["hello", "hi", "hey", "AOA", "aoa", "lol", "Lol", "LOL", "Present sir", "Present", "present", "Thank you", "thanks", "done", "AOA Sir", "idiot", "stupid", "trash"];

    for (let i = 0; i < count; i++) {
        if (i % 2 === 0) {
            // Academic (0)
            const template = ACADEMIC_TEMPLATES[Math.floor(Math.random() * ACADEMIC_TEMPLATES.length)];
            const msg = replacePlaceholders(template);
            csvContent += `"${msg.replace(/"/g, '""')}",0\n`;
        } else {
            // Non-Academic (1)
            let msg;
            if (Math.random() < 0.4) {
                // 40% chance to just inject a critical noise word directly to boost its non-academic weight
                msg = criticalNoise[Math.floor(Math.random() * criticalNoise.length)];
            } else {
                const template = NON_ACADEMIC_TEMPLATES[Math.floor(Math.random() * NON_ACADEMIC_TEMPLATES.length)];
                msg = replacePlaceholders(template);
            }
            csvContent += `"${msg.replace(/"/g, '""')}",1\n`;
        }
    }

    fs.writeFileSync(DATASET_FILE, csvContent, 'utf8');
    console.log(`Successfully generated ${count} messages to ${DATASET_FILE}`);
}

const args = process.argv.slice(2);
const count = args[0] ? parseInt(args[0]) : 2000;
generateData(count);
