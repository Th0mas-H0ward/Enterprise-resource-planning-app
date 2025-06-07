const User = require('../models/User');

const passport = require('passport');

class authController {
  async login(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err || !user) {
        return res.render('login', { layout: 'login-layout', error: info ? info.message : 'Login failed' });
      }
  
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
  
        switch (user.role) {
          case 'order_manager':
            return res.redirect('/order-specifications');
          case 'production_planner':
            return res.redirect('/prod-orders-list');
          default:
            return res.redirect('/');
        }
      });
    })(req, res, next);
  }

  async getUsers(req, res) {
    try {
      const users = await User.find();
        res.json(users);
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new authController()
