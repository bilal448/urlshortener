require('dotenv').config();
const express = require('express');
const dns = require('dns');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();


const urlDatabase = {};
let urlCounter = 1;
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  // Validate URL
  try {
    const urlObject = new URL(originalUrl);
    dns.lookup(urlObject.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Store URL and generate a short URL
      const shortUrl = urlCounter++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl,
      });
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

// API to redirect to the original URL
app.get('/api/shorturl/:shorturl', function (req, res) {
  const shortUrl = req.params.shorturl;
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  res.redirect(originalUrl);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
