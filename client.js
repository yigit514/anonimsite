// Socket.io ile bağlantıyı başlatıyoruz
const socket = io();

// Sayfa yüklendiğinde veritabanındaki mesajları çekiyoruz
window.onload = function() {
  fetch('/get-messages')
    .then(response => response.json())
    .then(messages => {
      const messagesDiv = document.getElementById('messages');
      messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${msg.username}: ${msg.message}`;
        messagesDiv.appendChild(messageElement);
      });
    })
    .catch(err => {
      console.error('Mesajlar alınamadı:', err);
    });
};

// Mesaj gönderme işlemi
document.getElementById('sendButton').addEventListener('click', () => {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value;

  if (message.trim() !== '') {
    socket.emit('chat message', {
      username: 'User', // Kullanıcı adını buraya ekleyebilirsiniz
      message: message
    });

    messageInput.value = ''; // Mesaj gönderildikten sonra input kutusunu temizle
  }
});
