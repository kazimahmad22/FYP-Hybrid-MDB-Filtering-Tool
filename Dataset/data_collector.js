const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATASET_FILE = path.join(__dirname, 'labeled_messages.csv');

// Templates for Synthetic Data
const ACADEMIC_TEMPLATES = [
    "Sir, I am not understanding question {n} of the assignment.",
    "Can you please explain the concept of {topic} again?",
    "When is the deadline for the {assignment_type}?",
    "I am facing an error in my code: {error}",
    "The lecture video for week {n} is not playing.",
    "I have a request regarding the {topic} discussion.",
    "Is it possible to submit the assignment via email?",
    "Could you clarify the instructions for the project?",
    "I think there is a mistake in the quiz question {n}.",
    "What is the weightage of the final exam?",
    "Sir, regarding the GDB, do we need to provide references?",
    "My LMS is not showing the latest marks.",
    "How to implement {topic} using recursion?",
    "What are the prerequisites for the course {topic}?",
    "Sir, I have submitted the {assignment_type} but it shows pending."
];

const NON_ACADEMIC_TEMPLATES = [
    "Good", "Good job", "Done", "Present", "Present sir",
    "Thanks", "Thank you", "Nicely explained",
    "Got it", "Ok", "Okay", "Right", "Agreed",
    "Please add me to whatsapp group {phone}",
    "0300-{phone}", "Anyone from Lahore?",
    "Follow me", "Sub to my channel",
    "Hello", "Hi", "Bye", "Good morning",
    "Best of luck everyone", "MashaAllah",
    "Who is the best teacher?", "I like this course",
    "Please check my msg", "Nice work!", "Excellent",
    "Present sir roll number {n}", "I am here",
    "Thanks for the lecture", "Superb sir",
    "Could you please add me?", "Wait for me",
    "Good luck to all", "Done sir",
    // Deep Augmentation: Phishing
    "IMPORTANT: Your LMS password will expire in 24 hours. Verify here: {url}",
    "IT Support Alert: Abnormal login detected. Secure your account {url}",
    "Action Required: Your student portal access is restricted. Click {url} to restore.",
    "Library Services: You have an unpaid fine of $50. Pay now at {url}",
    // Deep Augmentation: Fraudulent Jobs
    "Work from home opportunity! Earn ${amount} per week. Apply now: {url}",
    "HIRING: {job_title} needed at {company}. Flexible hours for students. DM me.",
    "Easy money! Help us test apps and get paid ${amount}. No experience needed.",
    "Join our marketing team and earn commission from your hostel room!",
    // Deep Augmentation: Commercial/Academic Misconduct
    "Need help with your {assignment_type}? We provide 100% original work. Contact us.",
    "Best crypto signals! Turn $10 into $1000 in one week. Join telegram: {url}",
    "Cheap textbooks and solved papers available here. Discount for {company} members.",
    "Win a free iPhone! Just fill this survey and provide your {topic} feedback {url}"
];

const TOPICS = ["Polymorphism", "Inheritance", "Pointers", "Arrays", "Recursion", "Database", "Networking"];
const ASSIGNMENT_TYPES = ["Assignment", "GDB", "Quiz", "Project"];
const ERRORS = ["IndexError", "NullReference", "Compilation Error", "Runtime Error"];
const COMPANIES = ["Global Tech", "Student Services", "Bright Future", "EduCorp"];
const JOB_TITLES = ["Data Entry", "Virtual Assistant", "Campus Ambassador", "Social Media Intern"];
const URLS = ["http://bit.ly/lms-check", "http://vu-portal-secure.net", "http://job-opportunities.com", "http://secure-login.io"];

function replacePlaceholders(template) {
    return template
        .replace('{n}', Math.floor(Math.random() * 10) + 1)
        .replace('{topic}', TOPICS[Math.floor(Math.random() * TOPICS.length)])
        .replace('{assignment_type}', ASSIGNMENT_TYPES[Math.floor(Math.random() * ASSIGNMENT_TYPES.length)])
        .replace('{error}', ERRORS[Math.floor(Math.random() * ERRORS.length)])
        .replace('{phone}', Math.floor(1000000 + Math.random() * 9000000))
        .replace('{url}', URLS[Math.floor(Math.random() * URLS.length)])
        .replace('{amount}', Math.floor(200 + Math.random() * 800))
        .replace('{company}', COMPANIES[Math.floor(Math.random() * COMPANIES.length)])
        .replace('{job_title}', JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)]);
}

function generateSyntheticData(count) {
    let data = [];
    console.log(`Generating ${count} synthetic messages...`);

    for (let i = 0; i < count; i++) {
        // 50/50 Split
        if (Math.random() > 0.5) {
            // Academic = 0
            const template = ACADEMIC_TEMPLATES[Math.floor(Math.random() * ACADEMIC_TEMPLATES.length)];
            data.push([replacePlaceholders(template), 0]);
        } else {
            // Non-Academic = 1
            const template = NON_ACADEMIC_TEMPLATES[Math.floor(Math.random() * NON_ACADEMIC_TEMPLATES.length)];
            data.push([replacePlaceholders(template), 1]);
        }
    }

    saveData(data);
    console.log(`Successfully added ${count} messages to ${DATASET_FILE}`);
}

function saveData(data) {
    const fileExists = fs.existsSync(DATASET_FILE);
    let csvContent = "";
    
    if (!fileExists) {
        csvContent += "message_content,label\n";
    }

    data.forEach(row => {
        // Escape quotes if needed
        const msg = row[0].includes(',') ? `"${row[0]}"` : row[0];
        csvContent += `${msg},${row[1]}\n`;
    });

    fs.appendFileSync(DATASET_FILE, csvContent, 'utf8');
}

// Check for args
const args = process.argv.slice(2);
if (args.length > 0) {
    generateSyntheticData(parseInt(args[0]));
} else {
    console.log("Usage: node data_collector.js <count>");
}
