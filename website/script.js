// Get references to the HTML elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Function to add a message to the chat box
function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    
    const pElement = document.createElement('p');
    pElement.textContent = message;
    messageElement.appendChild(pElement);
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
}

// Function to handle sending a message
async function handleSendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    addMessage(message, 'user');
    userInput.value = '';

    // Add a loading indicator for the bot's response
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'bot-message', 'loading');
    const pElement = document.createElement('p');
    pElement.textContent = 'Akka is thinking';
    loadingMessage.appendChild(pElement);
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // Send the user's message to our secure backend API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: message }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        
        // Remove the loading indicator
        chatBox.removeChild(loadingMessage);

        // Add the bot's actual response
        addMessage(data.text, 'bot');

    } catch (error) {
        console.error('Error:', error);
        chatBox.removeChild(loadingMessage);
        addMessage('Sorry, something went wrong. Please try again.', 'bot');
    }
}

// Event listeners for sending message
sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
});