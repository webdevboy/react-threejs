const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use('localSignin', new LocalStrategy({
  session: true,
},
function(username, password, next) {
  // Checking the user
  if(username === 'test' && password === '12345') {
    return next(null, { username, password }, { status: 'ok' });
  }
  else {
    return next('Wrong credentials', false, null);
  }
}))
