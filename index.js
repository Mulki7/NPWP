// import express
const express = require('express');
const app = express();

// atur port
const PORT = 3000;

// route GET
app.get('/', (req, res) => {
  res.send('Hello Express JS 🚀');
});

// jalankan server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
