const Router = require('express');
const router = new Router();
const controller = require('../controllers/authController'); 

router.get('/authentication', async (req, res) => {
  res.render('authentication');
});

router.get('/login', (req, res) => {
  res.render('login', { layout: 'login-layout' });
});

router.post('/login', controller.login) 

router.get('/users', controller.getUsers)

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

module.exports = router