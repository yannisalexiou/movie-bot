const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('<h1>You are not in the right place</h1>')
});

module.exports = router;
