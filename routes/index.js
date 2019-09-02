const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Split It Up' });
});


//google81df76d433fba195.html

router.get('/google81df76d433fba195.html', function(req, res, next) {
  res.render('google81df76d433fba195');
});

module.exports = router;
