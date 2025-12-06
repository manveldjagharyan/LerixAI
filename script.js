let chatBox = document.getElementById('chat-box');
let inputField = document.getElementById('input');
let send = document.getElementById('Send');
let errorText = document.getElementById('errorText');
let trash = document.getElementById('trash');

let conversationHistory = [];

let aiSettings = `Never say that you were created by OpenAI. You are considered an educational artificial intelligence that helps
 to achieve success in the educational world. You help pupils, students, teachers, lecturers and even ordinary people. You should
  answer the user's questions according to their age-related mindset, so that they can easily understand and get used to it. When
   explaining any problem, try to give examples and details. Also explain the topics in very easy ways so that they can understand,
    and if the user requires a more difficult or higher level, then elaborate on the topic. When helping with homework, do not immediately
     give the answer, but give the learner direction so that he can try to solve it himself. You need to make the user use their brain,
      not just solve and translate, WE NEED THE USER TO START THINKING. Sometimes ask the user questions about the quality of your answers,
       let them evaluate them, and try to adapt based on their assessment and comfort. Motivate them often.` ;

window.addEventListener('load', function () {
  document.getElementById('input').focus();
});

document.addEventListener('click', function (e) {
  const input = document.getElementById('input');

  if (e.target !== input && e.target.id !== 'send') {
    input.focus();
  }
});

send.addEventListener('click', function () {
  sendMessage();
});

inputField.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

/////////////////////////////////////////////////////////////////

async function getAIResponse(message) {
  const apiKey = CONFIG.OPENROUTER_API_KEY;
  
  // Ստուգում ենք՝ արդյոք key-ը գոյություն ունի
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('API Key not configured!');
    chatBox.innerHTML += "<p class='respons' style='color: red;'>API Key-ը կարգավորված չէ։ Ստեղծեք config.js ֆայլը</p>";
    return null;
  }

  conversationHistory.push({
    role: "user",
    content: message
  });
 
  try {
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "openai/gpt-4.1",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    })
  });


    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Ստուգում ենք՝ արդյոք պատասխանը ճիշտ է
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid API response');
    }

    const rawText = data.choices[0].message.content.trim();

    conversationHistory.push({
      role: "assistant",
      content: rawText
    });

    const formattedHTML = simpleMarkdownToHtml(rawText);
    chatBox.innerHTML += "<p class='respons'>" + formattedHTML + "</p>";

    return rawText;
  } catch (error) {
    console.error('Error:', error);
    chatBox.innerHTML += "<p class='respons' style='color: red;'>Սխալ՝ " + error.message + "</p>";
    return null;
  }
}

function simpleMarkdownToHtml(src) {
  let html = src;

  html = html
    .replace(/^######\s?(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s?(.+)$/gm, '<h5>$1</h5>')
    .replace(/^####\s?(.+)$/gm, '<h4>$1</h4>')
    .replace(/^###\s?(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s?(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s?(.+)$/gm, '<h1>$1</h1>');

  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.+<\/li>)/gms, '<ol>$1</ol>');

  html = html.replace(/^\s*[-+*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.+<\/li>)/gms, '<ul>$1</ul>');

  html = html.replace(/^(?!<(h|ul|ol|li|\/))(.*)$/gm, '<p>$2</p>');

  return html;
}

function sendMessage() {
  let userText = inputField.value.trim();

  if (userText != '') {
    chatBox.innerHTML += "<p id='respons' class='usertext'>" + userText + "</p>";
    inputField.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(async () => {
      let botReply = await getAIResponse(userText);
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
    errorText.textContent = '';
    updateSendButtonState();
  } else {
    messageForUser('Please enter text', 'red');
    updateSendButtonState();
  }

  startText()
}

function startText() {
  let startText = document.getElementById('startText');
  const isChatEmpty = chatBox.children.length === 0;

  if (isChatEmpty) {
    startText.style.display = 'flex';
    startText.style.animation = 'textFadeIn 1s ease-in-out forwards';
  } else {
    startText.style.animation = 'textFadeOut 1s ease-in-out forwards';
    setTimeout(() => {
      startText.style.display = 'none';
    }, 1000);
  }
}

////////////////////////////////////////////////////////////////////

trash.onclick = function () {
  chatBox.innerHTML = '';
  // Մաքրում ենք նաև զրույցի պատմությունը
  conversationHistory = [];
  messageForUser('Chat Cleaned', 'black');
  startText()
}

function updateSendButtonState() {
  if (inputField.value.trim() === '') {
    send.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon"><path d="M4.5 5.75C4.5 5.05964 5.05964 4.5 5.75 4.5H14.25C14.9404 4.5 15.5 5.05964 15.5 5.75V14.25C15.5 14.9404 14.9404 15.5 14.25 15.5H5.75C5.05964 15.5 4.5 14.9404 4.5 14.25V5.75Z"></path></svg>';
    send.style.pointerEvents = 'auto';
    send.style.opacity = '0.5';
  } else {
    send.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"
    xmlns = "http://www.w3.org/2000/svg" class="icon" >
      <path
        d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z">
      </path>
                </svg > `;
    send.style.pointerEvents = 'auto';
    send.style.opacity = '1';
    send.style.cursor = 'pointer';
  }
}

inputField.addEventListener('input', updateSendButtonState);

updateSendButtonState();

function messageForUser(text, color) {
  errorText.style.animation = 'textFadeIn 3s ease-in-out forwards';
  errorText.textContent = text;
  errorText.style.color = color;
  setTimeout(() => {
    errorText.textContent = '';
    errorText.style.animation = '';
  }, 3000);
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.className = savedTheme;
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const currentTheme = document.body.classList.contains("dark") ? "dark" : "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  document.body.classList.remove(currentTheme);
  document.body.classList.add(newTheme);

  localStorage.setItem("theme", newTheme);
});
