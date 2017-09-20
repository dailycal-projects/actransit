const express = require('express');
const router = express.Router();


const context = require('./context.js')


router.get('/', function(req, res) {
  
  const ctx = context.getContext();
  
  res.render('index.html', ctx);
});

module.exports = router;
