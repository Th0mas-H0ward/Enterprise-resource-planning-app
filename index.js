const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const exphbs = require('express-handlebars')
const config = require('./config');
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const materialRoutes = require('./routes/materials')
const providerRoutes = require('./routes/providers')
const specificationRoutes = require('./routes/specifications')
const reportRoutes = require('./routes/reports')
const salesReportRoutes = require('./routes/sales-reports')
const orderRoutes = require('./routes/orders')
const prodOrderRoutes = require('./routes/prod-orders')
const productRoutes = require('./routes/products')
const authenticationRoutes = require('./routes/authentication')
const auth = require('./middleware/auth')

const { formatDate } = require('./service/formatDate')
const User = require('./models/User')

const PORT = process.env.PORT || 8080
const app = express()

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: {
    formatDate,
    eq: function (a, b) {
      return a === b;
    }
  }
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username })
      if (!user) {
        return done(null, false, { message: `User ${username} not found` })
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password' })
      }
      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use(authenticationRoutes, materialRoutes, providerRoutes, specificationRoutes, reportRoutes, orderRoutes, productRoutes, prodOrderRoutes, salesReportRoutes)

async function start() {
  try {
    await mongoose.connect(config.mongodb.uri);
    app.listen(PORT, () => {
      console.log('Server has been started...');
    });
  } catch (e) {
    console.log(e);
  }
}

start()