const express = require('express');
const { exec } = require('child_process');
const app = express();

app.get('/ping', (req, res) => {
  exec(`ping -c 4 ${req.query.host}`, (err, stdout) => {
    const stats = parsePingOutput(stdout); // Implement parsing
    res.json(stats);
  });
});

function parsePingOutput(text) {
  // Extract min/max/avg/loss from ping output
  return { min: 12, max: 45, avg: 28, loss: 0 }; // Example
}

app.listen(3000, () => console.log('Nirvāh backend running!'));