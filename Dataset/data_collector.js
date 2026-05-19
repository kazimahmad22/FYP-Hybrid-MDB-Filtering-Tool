const fs = require('fs');
const path = require('path');

const DATASET_FILE = path.join(__dirname, 'labeled_messages.csv');

// --- ACADEMIC TEMPLATES (Intent: Course-related queries, including logistics) ---
const ACADEMIC_TEMPLATES = [
    // 1. Conceptual & Theoretical Clarifications
    "Can you please explain the concept of {topic} again? I'm struggling with the definition.",
    "What is the core difference between {topic_a} and {topic_b} in this context?",
    "Sir, I noticed a contradiction in the slide about {topic}. Does it follow {theory}?",
    "How does the {algorithm} work when the input size is very large?",
    
    // 2. Practical & Application Assistance
    "I am facing an error in my code: {error}. I tried fixing the {topic} logic but it still fails.",
    "How to implement {topic} using recursion appropriately?",
    "In Assignment {n}, Question {m}, should we use the {algorithm} or {other_method} for optimization?",
    "I'm trying to solve the problem on slide {n}, but my result is {result} instead of {expected}.",
    
    // 3. Syllabus & Logistics (NOW ACADEMIC)
    "When is the deadline for the {assignment_type}?",
    "Sir, please extend the deadline for assignment {n} due to internet issues.",
    "Is there a class tomorrow or is it a holiday?",
    "Can we submit the project in {format} format instead of {required_format}?",
    "When will the results for quiz {n} be published?",
    "What is the weightage of the final exam in the overall grading?",
    "Do we need to know the mathematical derivation of {topic} for the exam?",
    "The grading rubric for the project is not clear. How many marks for UI?",
    
    // 4. Lecture & Platform Access (Related to course content delivery)
    "The lecture video for week {n} is not playing for me. Can you help?",
    "Broken link on the module page for {topic}. I can't read the material.",
    "Audio in the week {n} video is crackling. I can't hear the explanation.",
    
    // Hybrid Rule (Prioritize Academic)
    "Can you explain why the output is null? Also, when is the quiz?"
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

    // 3. Greetings & Social
    "Hello Sir", "Hi", "Good morning", "Asalaam-o-Alaikum", "Hello everyone",
    "Respected Professor, Hope you are well.",
    "Greetings to all students and staff.",
    "How are you doing sir?", "How are you?", "Sir, how are you?", "How is your health?",
    "Hope you are having a good day.",

    // 4. Thank You Messages
    "Thank you sir", "Thanks for the lecture", "Thanks!", "Jazakallah",
    "Great explanation, thank you.", "Got it, thanks.",
    "Highly appreciated, thank you so much."
];

const TOPICS = ["Inheritance", "Polymorphism", "Binary Search Trees", "TCP/IP Stack", "Normalization", "Deadlocks", "Heap Memory"];
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
        .replace(/{phone}/g, "03" + Math.floor(100000000 + Math.random() * 900000000))
        .replace(/{url}/g, URLS[Math.floor(Math.random() * URLS.length)]);
}

function generateData(count) {
    console.log(`Generating a balanced dataset of ${count} messages based on NEW simplified rules...`);
    let csvContent = "message_content,label\n";

    for (let i = 0; i < count; i++) {
        if (i % 2 === 0) {
            // Academic (0)
            const template = ACADEMIC_TEMPLATES[Math.floor(Math.random() * ACADEMIC_TEMPLATES.length)];
            const msg = replacePlaceholders(template);
            csvContent += `"${msg.replace(/"/g, '""')}",0\n`;
        } else {
            // Non-Academic (1)
            const template = NON_ACADEMIC_TEMPLATES[Math.floor(Math.random() * NON_ACADEMIC_TEMPLATES.length)];
            const msg = replacePlaceholders(template);
            csvContent += `"${msg.replace(/"/g, '""')}",1\n`;
        }
    }

    fs.writeFileSync(DATASET_FILE, csvContent, 'utf8');
    console.log(`Successfully generated ${count} messages to ${DATASET_FILE}`);
}

const args = process.argv.slice(2);
const count = args[0] ? parseInt(args[0]) : 1000;
generateData(count);
