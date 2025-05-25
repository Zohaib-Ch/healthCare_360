// Chatbot.js - JavaScript for the Health Chatbot page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the chatbot
    initChatbot();
});

// Initialize the chatbot
function initChatbot() {
    // Add welcome message
    addBotMessage("Hello! I'm your HealthCare360 assistant. How can I help you today? You can ask me about symptoms, general health advice, or wellness tips.");
    
    // Setup event listeners
    setupChatListeners();
}

// Setup event listeners for chat
function setupChatListeners() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    // Send message on button click
    sendBtn.addEventListener('click', function() {
        sendMessage();
    });
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Handle sidebar toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// Send message function
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    // Validate input
    if (!message) return;
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Get bot response after a small delay
    setTimeout(() => {
        getBotResponse(message);
    }, 1000);
}

// Add user message to chat
function addUserMessage(message) {
    const chatMessages = document.querySelector('.chat-messages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user-message');
    messageElement.innerHTML = `
        ${message}
        <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// Add bot message to chat
function addBotMessage(message) {
    const chatMessages = document.querySelector('.chat-messages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    messageElement.innerHTML = `
        ${message}
        <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    typingIndicator.style.display = 'block';
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    typingIndicator.style.display = 'none';
}

// Scroll chat to bottom
function scrollToBottom() {
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get bot response using Gemini API for a GPT-like experience
async function getBotResponse(userMessage) {
    try {
        // Check for simple conversational messages first
        const conversationalResponse = handleConversationalMessages(userMessage);
        if (conversationalResponse) {
            hideTypingIndicator();
            addBotMessage(conversationalResponse);
            return;
        }
        
        // Extract potential food/nutrition query
        const query = extractNutritionQuery(userMessage);
        
        // If it's a nutrition query, use the nutrition API
        if (query) {
            // Using the free Edamam Food Database API
            const appId = '7e095527'; // Free Edamam API ID
            const appKey = 'c48f5e73a656a4d0e0e3a5daa3a022a5'; // Free Edamam API key
            const apiUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(query)}&nutrition-type=logging`;
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Nutrition API request failed');
            }
            
            const data = await response.json();
            hideTypingIndicator();
            
            if (data && data.hints && data.hints.length > 0) {
                // Format the nutrition data into a readable response
                const formattedResponse = formatNutritionData(data, query);
                addBotMessage(formattedResponse);
            } else {
                // No nutrition data found, fall back to Gemini API
                const geminiResponse = await getGeminiResponse(userMessage);
                addBotMessage(geminiResponse);
            }
        } else {
            // For all other queries, use the Gemini API for GPT-like responses
            const geminiResponse = await getGeminiResponse(userMessage);
            hideTypingIndicator();
            addBotMessage(geminiResponse);
        }
    } catch (error) {
        console.error('Error in chatbot processing:', error);
        hideTypingIndicator();
        
        // Fallback responses if all APIs fail
        const fallbackResponse = getFallbackResponse(userMessage);
        addBotMessage(fallbackResponse);
    }
}

// Get response from Gemini API for GPT-like capabilities
async function getGeminiResponse(message) {
    try {
        // Free API key from Google AI Studio
        const API_KEY = 'AIzaSyDJC5a7hDIFWLqGw-XZm0b-8d5NOGfPRkk'; // Replace with your actual API key when available
        
        // Create the request to the Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a helpful assistant in the HealthCare360 app created by Natasha, Rimsha Noor, and Rimsha Akhtar. Respond to this query in a helpful, accurate, and conversational way: ${message}. If it's a health question, provide evidence-based information. Keep your response concise but informative.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 800,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('Gemini API request failed with status: ' + response.status);
        }
        
        const data = await response.json();
        
        // Extract the response text from the Gemini API response
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Unexpected Gemini API response format');
        }
        
    } catch (error) {
        console.error('Error fetching from Gemini API:', error);
        return getFallbackResponse(message);
    }
}

// Handle simple conversational messages and specific questions
function handleConversationalMessages(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for questions about who created the chatbot
    if (lowerMessage.includes('who made you') || 
        lowerMessage.includes('who created you') || 
        lowerMessage.includes('who developed you') || 
        lowerMessage.includes('who built you') ||
        lowerMessage.includes('who are you') ||
        lowerMessage.includes('who designed you')) {
        return "I was created by Natasha, Rimsha Noor, and Rimsha Akhtar as part of the HealthCare360 Smart Home Health Monitoring System. I'm designed to provide health information and assist with your health-related questions.";
    }
    
    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings|howdy)/i)) {
        return "Hello! I'm your HealthCare360 assistant. How can I help you with your health questions today?";
    }
    
    // Thank you
    if (lowerMessage.match(/thank you|thanks|thx/i)) {
        return "You're welcome! I'm here to help with any health questions you might have.";
    }
    
    // Goodbye
    if (lowerMessage.match(/bye|goodbye|see you|farewell/i)) {
        return "Goodbye! Take care of your health and come back if you have more questions.";
    }
    
    // Questions about the chatbot itself
    if (lowerMessage.includes('what can you do') || 
        lowerMessage.includes('your capabilities') || 
        lowerMessage.includes('how can you help') ||
        lowerMessage.includes('what are you')) {
        return "I'm a health assistant designed to provide information on various health topics, answer nutrition questions, and offer guidance on common health concerns. I can help with questions about diet, exercise, symptoms, medications, and general wellness. Feel free to ask me anything health-related!";
    }
    
    return null; // Not a conversational message
}

// Extract potential nutrition query from user message
function extractNutritionQuery(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check if it's a nutrition-related query
    if (lowerMessage.includes('nutrition') || 
        lowerMessage.includes('calories') || 
        lowerMessage.includes('protein') || 
        lowerMessage.includes('fat') || 
        lowerMessage.includes('carbs') || 
        lowerMessage.includes('vitamin') || 
        lowerMessage.includes('mineral') || 
        lowerMessage.includes('diet') || 
        lowerMessage.includes('food')) {
        
        // Extract the food item
        const foodTerms = ['in', 'of', 'about', 'for', 'nutrition', 'calories', 'protein', 'fat', 'carbs', 'vitamin', 'mineral'];
        let query = lowerMessage;
        
        // Remove question words and common terms
        query = query.replace(/what|how|many|much|is|are|the|there|tell|me|please|\?/gi, '');
        
        // Remove nutrition-related terms to isolate the food
        foodTerms.forEach(term => {
            query = query.replace(new RegExp(term, 'gi'), '');
        });
        
        // Clean up extra spaces
        query = query.trim().replace(/\s+/g, ' ');
        
        return query || null;
    }
    
    // Check if it's directly a food item (simple query)
    if (lowerMessage.split(' ').length <= 3 && 
        !lowerMessage.includes('?') && 
        !lowerMessage.match(/^(hi|hello|hey|thanks|thank|bye|goodbye)/i)) {
        return lowerMessage.trim();
    }
    
    return null;
}

// Format nutrition data into a readable response for Edamam API
function formatNutritionData(data, query) {
    if (!data || !data.hints || data.hints.length === 0) {
        return `I couldn't find nutrition information for "${query}".`;
    }
    
    // Get the first food item from the response
    const foodItem = data.hints[0].food;
    const nutrients = foodItem.nutrients;
    
    // Build the response
    let response = `Here's the nutrition information for ${foodItem.label || query}:\n\n`;
    
    if (nutrients) {
        response += `• Calories: ${Math.round(nutrients.ENERC_KCAL || 0)} kcal\n`;
        response += `• Protein: ${Math.round(nutrients.PROCNT || 0)}g\n`;
        response += `• Carbohydrates: ${Math.round(nutrients.CHOCDF || 0)}g\n`;
        response += `• Fat: ${Math.round(nutrients.FAT || 0)}g\n`;
        response += `• Fiber: ${Math.round(nutrients.FIBTG || 0)}g\n`;
        
        if (nutrients.SUGAR !== undefined) {
            response += `• Sugar: ${Math.round(nutrients.SUGAR)}g\n`;
        }
        
        if (nutrients.NA !== undefined) {
            response += `• Sodium: ${Math.round(nutrients.NA)}mg\n`;
        }
        
        if (nutrients.CHOLE !== undefined) {
            response += `• Cholesterol: ${Math.round(nutrients.CHOLE)}mg\n`;
        }
        
        if (nutrients.CA !== undefined) {
            response += `• Calcium: ${Math.round(nutrients.CA)}mg\n`;
        }
        
        if (nutrients.FE !== undefined) {
            response += `• Iron: ${Math.round(nutrients.FE)}mg\n`;
        }
    }
    
    response += `\nThis information can help you make informed dietary choices. Remember that individual nutritional needs vary based on age, gender, activity level, and health conditions.`;
    
    // Add food category if available
    if (foodItem.category) {
        response += `\n\nCategory: ${foodItem.category}`;
    }
    
    return response;
}

// Get health advice for non-nutrition queries using Google's Gemini API
async function getHealthAdvice(message) {
    try {
        // Use Google's Gemini API for health advice
        // Free API key from Google AI Studio - this is a public API key with limited usage
        const API_KEY = 'AIzaSyDJC5a7hDIFWLqGw-XZm0b-8d5NOGfPRkk'; // Replace with your actual API key when available
        
        // Create the request to the Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a helpful healthcare assistant providing accurate, evidence-based health information. Please provide a concise, helpful response to this health question: ${message}. Include practical advice when appropriate. Keep your response under 150 words.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.4,
                    topK: 32,
                    topP: 0.95,
                    maxOutputTokens: 800,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('Gemini API request failed');
        }
        
        const data = await response.json();
        
        // Extract the response text from the Gemini API response
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Unexpected Gemini API response format');
        }
        
    } catch (error) {
        console.error('Error fetching from Gemini API:', error);
        return getFallbackResponse(message);
    }
}

// Get fallback response based on the message content
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific health topics
    if (lowerMessage.includes("headache") || lowerMessage.includes("head ache") || lowerMessage.includes("head pain")) {
        return "Headaches can be caused by stress, dehydration, lack of sleep, or eye strain. For occasional headaches, try drinking water, resting in a dark room, and over-the-counter pain relievers if needed. If headaches are severe, persistent, or accompanied by other symptoms like fever, vision changes, or neck stiffness, please consult a healthcare professional.";
    } 
    
    if (lowerMessage.includes("cold") || lowerMessage.includes("flu") || lowerMessage.includes("fever") || lowerMessage.includes("cough")) {
        return "For cold and flu symptoms, rest, stay hydrated, and consider over-the-counter medications for symptom relief. Fever reducers like acetaminophen or ibuprofen can help with fever and body aches. If you have a high fever (over 102°F/39°C), difficulty breathing, or symptoms persist for more than a week, please consult a healthcare professional.";
    }
    
    if (lowerMessage.includes("sleep") || lowerMessage.includes("insomnia") || lowerMessage.includes("can't sleep") || lowerMessage.includes("trouble sleeping")) {
        return "For better sleep, try maintaining a regular sleep schedule, avoiding screens before bedtime, creating a comfortable sleep environment, and limiting caffeine and alcohol. Relaxation techniques like deep breathing, meditation, or gentle stretching can also help. If sleep problems persist for more than a few weeks, consider speaking with a healthcare provider.";
    }
    
    if (lowerMessage.includes("stress") || lowerMessage.includes("anxiety") || lowerMessage.includes("worried") || lowerMessage.includes("anxious")) {
        return "Managing stress is important for overall health. Try deep breathing exercises, meditation, physical activity, or talking to someone you trust. Limit caffeine, get enough sleep, and practice self-care activities you enjoy. If stress or anxiety significantly affects your daily life, consider speaking with a mental health professional who can provide appropriate support and treatment options.";
    }
    
    if (lowerMessage.includes("exercise") || lowerMessage.includes("workout") || lowerMessage.includes("fitness") || lowerMessage.includes("active")) {
        return "Regular physical activity is important for health. Aim for at least 150 minutes of moderate exercise per week, such as brisk walking, swimming, cycling, or dancing. Also include strength training exercises at least twice a week. Start slowly if you're new to exercise and gradually increase intensity. Choose activities you enjoy to help maintain motivation. Remember to warm up before and cool down after exercise to prevent injury.";
    }
    
    if (lowerMessage.includes("blood pressure") || lowerMessage.includes("hypertension")) {
        return "Normal blood pressure is typically around 120/80 mmHg. High blood pressure (hypertension) can be managed through regular exercise, a heart-healthy diet low in sodium, maintaining a healthy weight, limiting alcohol, not smoking, and managing stress. Some people may also need medication prescribed by a doctor. Regular monitoring is important, especially if you have risk factors or a family history of hypertension.";
    }
    
    if (lowerMessage.includes("diabetes") || lowerMessage.includes("blood sugar") || lowerMessage.includes("glucose")) {
        return "Diabetes management involves monitoring blood sugar levels, taking prescribed medications, following a balanced diet, regular physical activity, and attending regular check-ups. A dietitian can help create a meal plan that works for you. Watch for symptoms of low blood sugar (hypoglycemia) like shakiness or confusion, and high blood sugar (hyperglycemia) like increased thirst or urination. Regular foot checks and eye exams are also important for people with diabetes.";
    }
    
    if (lowerMessage.includes("heart") || lowerMessage.includes("cardiovascular") || lowerMessage.includes("cholesterol")) {
        return "Heart health can be improved by eating a diet rich in fruits, vegetables, whole grains, and lean proteins, while limiting saturated fats, trans fats, and sodium. Regular physical activity, not smoking, limiting alcohol, and managing stress are also important. Know your numbers (blood pressure, cholesterol, blood sugar) and work with your healthcare provider to keep them in a healthy range. If you experience chest pain, shortness of breath, or other concerning symptoms, seek medical attention immediately.";
    }
    
    // Default response if no specific match is found
    return "I understand you're asking about health information. While I can provide general guidance, it's always best to consult with a healthcare professional for personalized advice. Is there a specific health topic I can help you learn more about, such as nutrition, exercise, sleep, stress management, or common health conditions?";
}

// Simulate a response if API fails
function simulateResponse(userMessage) {
    // Convert user message to lowercase for easier matching
    const message = userMessage.toLowerCase();
    
    // Simple keyword matching for common health questions
    setTimeout(() => {
        let response = "";
        
        if (message.includes("headache")) {
            response = "Headaches can be caused by stress, dehydration, lack of sleep, or eye strain. Try drinking water, resting in a dark room, and consider over-the-counter pain relievers if needed. If headaches persist or are severe, please consult a healthcare professional.";
        } 
        else if (message.includes("cold") || message.includes("flu") || message.includes("fever")) {
            response = "For cold and flu symptoms, rest, stay hydrated, and consider over-the-counter medications for symptom relief. If you have a high fever or symptoms persist for more than a week, please consult a healthcare professional.";
        }
        else if (message.includes("sleep") || message.includes("insomnia")) {
            response = "For better sleep, try maintaining a regular sleep schedule, avoiding screens before bedtime, creating a comfortable sleep environment, and limiting caffeine. Relaxation techniques like deep breathing can also help.";
        }
        else if (message.includes("stress") || message.includes("anxiety")) {
            response = "Managing stress is important for overall health. Try deep breathing exercises, meditation, physical activity, or talking to someone you trust. If stress is significantly affecting your daily life, consider speaking with a mental health professional.";
        }
        else if (message.includes("diet") || message.includes("nutrition") || message.includes("eat")) {
            response = "A balanced diet includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. Try to limit processed foods, sugar, and excessive salt. Stay hydrated by drinking plenty of water throughout the day.";
        }
        else if (message.includes("exercise") || message.includes("workout")) {
            response = "Regular physical activity is important for health. Aim for at least 150 minutes of moderate exercise per week. This can include walking, swimming, cycling, or any activity you enjoy. Start slowly if you're new to exercise and gradually increase intensity.";
        }
        else {
            response = "I understand you're asking about health information. While I can't access my full database right now, I recommend consulting reliable sources like the CDC or WHO websites, or speaking with a healthcare professional for personalized advice.";
        }
        
        addBotMessage(response);
    }, 1000);
}

// Handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Add event listener to logout button
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
