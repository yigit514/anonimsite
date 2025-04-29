// Gerekli modüller
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Express uygulaması oluşturuluyor
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB bağlantısı
mongoose.connect('mongodb+srv://dreelirion:nnJQuyjnyHXFzJAz@cluster0.hdh1gtc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB bağlantısı başarılı!'))
.catch((err) => console.log('MongoDB bağlantısı hatalı:', err));

// Mesaj şeması oluşturuluyor
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// CORS ayarları
app.use(cors());

// Statik dosya servisi
app.use(express.static('public'));

// Mesajları almak için bir route
app.get('/get-messages', (req, res) => {
  Message.find()
    .sort({ timestamp: 1 })  // Mesajları zaman sırasına göre sıralıyoruz
    .then(messages => {
      res.json(messages);  // Mesajları JSON formatında frontend'e gönderiyoruz
    })
    .catch(err => {
      console.error('Mesajlar alınamadı:', err);
      res.status(500).send('Mesajlar alınırken hata oluştu');
    });
});

// WebSocket ile chat mesajlarını alma ve kaydetme
io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı');

  socket.on('chat message', (data) => {
    const newMessage = new Message({
      username: data.username,
      message: data.message
    });

    newMessage.save()
      .then(() => {
        console.log('Mesaj veritabanına kaydedildi:', newMessage);
        // Yeni mesajı tüm bağlı istemcilere ilet
        io.emit('chat message', newMessage);
      })
      .catch(err => {
        console.error('Mesaj kaydedilemedi:', err);
      });
  });

  socket.on('disconnect', () => {
    console.log('Bir kullanıcı bağlantıyı kesti');
  });
});

// Sunucuyu başlatıyoruz
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
