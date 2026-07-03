const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// Serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback all routes to index.html (Single Page App behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SilverLine Toronto Server is running on port ${PORT}`);
  console.log(`Local Access URL: http://localhost:${PORT}`);
});
