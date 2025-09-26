

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('chatbot-toggle');
  const container = document.getElementById('chatbot-container');
  const messages = document.getElementById('chatbot-messages');
  const input = document.getElementById('chatbot-input');
  const send = document.getElementById('chatbot-send');

  addMessage('bot', "👋 How's the weather today?");

  toggle.addEventListener('click', () => {
    container.style.display = container.style.display === 'flex' ? 'none' : 'flex';
  });

  send.addEventListener('click', handleMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleMessage();
  });

  function handleMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage('user', text);
    input.value = '';
    respondToUser(text);
  }

  function addMessage(sender, text) {
    const msg = document.createElement('div');
    msg.className = 'chat-message ' + sender;
    msg.innerHTML = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function respondToUser(query) {
    const response = getRedirectResponse(query.toLowerCase());
    addMessage('bot', response);
  }

  function getRedirectResponse(query) {
    const suggestions = [];
    if (query.includes('rain')) suggestions.push('./pages/rainy-day.html');
    if (query.includes('sun') || query.includes('bright')) suggestions.push('./pages/sunny-day.html');
    if (query.includes('wind')) suggestions.push('./pages/windy-day.html');
    if (query.includes('cloud')) suggestions.push('./pages/cloudy-day.html');
    if (query.includes('cold') || query.includes('chill')) suggestions.push('./pages/cold-day.html');
    if (query.includes('hot') || query.includes('warm')) suggestions.push('./pages/hot-day.html');
    if (query.includes('mild')) suggestions.push('./pages/mild-day.html');

    if (suggestions.length > 0) {
      const links = suggestions.map(p => `<a href='pages/${p}' target='_blank'>→ ${p.replace('-', ' ').replace('.html', '')}</a>`).join('<br>');
      const expertButton = isLoggedIn()
        ? '<button onclick="notifyExpert()">💬 Chat with expert</button>'
        : '<div>Please <a href="pages/login.html">log in</a> to chat with experts.</div>';
      return `Here's what we found for you:<br>${links}<br><br>${expertButton}`;
    } else {
      return `❌ We can't search for what you ask for.<br>👉 Try some clearer keyword: <em>warm, hot, cold, chill, rain, wind, sun, bright, cloud, mild...</em>`;
    }
  }

  function isLoggedIn() {
    return localStorage.getItem('userLoggedIn') === 'true';
  }

  window.notifyExpert = () => {
    alert("✅ Notification sent to expert! They'll reach out to you soon.");
  };

  input.setAttribute('placeholder', 'Warm, cold, rain, wind, sun...');
});
