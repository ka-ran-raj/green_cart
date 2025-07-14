const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const plantRoutes = require('./routes/plantRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const contactRoute = require('./routes/contactRoute');
const orderRoutes = require('./routes/orderRoutes');
const { Resend } = require('resend');
const ContactFormEmail = require('./emails/ContactFormEmail');
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/plants', plantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/contact', contactRoute);
app.use('/api/orders', orderRoutes);


const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/send', async (req, res) => {
  const { senderEmail, message } = req.body;

  try {
    await resend.emails.send({
      from: 'Your Name <onboarding@resend.dev>',
      to: 'dkdinesh2307@gmail.com',
      subject: 'New Message from Contact Form',
      react: ContactFormEmail({ senderEmail, message }),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email sending failed:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected ✅');
  app.listen(5000, () => console.log('Server running on port 5000 🚀'));
})
.catch(err => console.error('MongoDB connection error:', err));