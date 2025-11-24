const keywords = ["good", "present", "done"];

const messages = document.querySelectorAll('.message');
// highlighting the non-academic messages
messages.forEach((message)=> {
    if(keywords.some((keyword) => message.textContent.toLowerCase().includes(keyword))){
        message.style.backgroundColor = 'red';
    }
})

// converted node list to array
const messagesText = Array.from(messages).map(e => e.textContent);

// filtering the academic messages
const filteredMessages = messagesText.filter(text => 
    keywords.every(keyword => !text.toLowerCase().includes(keyword.toLowerCase()))
);

console.log("*Academic Messages*")
console.table(filteredMessages);
