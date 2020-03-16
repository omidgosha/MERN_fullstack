const express = require('express');
const connectDB = require ('./config/db');

const app = express();

//connect database
connectDB();

// initialize middleware; get data inside body
app.use(express.json({extended: false}));

// define routes
app.use('/api/users', require('./api/users'));
app.use('/api/auth', require('./api/auth'));
app.use('/api/posts', require('./api/posts'));
app.use('/api/profile', require('./api/profile'));

app.get('/', (req, res) => res.send('API Running'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on ${PORT}`));