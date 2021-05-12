const localStrategy = require('passport-local').Strategy;
const passport = require('passport');
const users = require('../models/users');
const bcrypt = require('bcrypt');

async function authUser(username, password, done)
{
    const user = users.findUser('name', username);
    if (user === undefined)
    {
        console.log('No user with that username');
        return done(null, false);
    }
    if (await bcrypt.compare(password, user.password))
    {
        console.log(`User Authenticated: ${user.name}`);
    //    console.log(user);
        return done(null, user);
    }
    console.log('Password incorrect');
    return done(null, false);
}

async function setupPassport()
{
    passport.use(new localStrategy({ usernameField: 'name', passwordField: 'pass'}, authUser));
    passport.serializeUser((user, done) => 
    {
//        console.log(`Serialize UserID: ${user._id} Username: ${user.name}`);
        done(null, user._id)
    });
    passport.deserializeUser((id, done) => 
    {
//        console.log(`Deserialize User ID: ${id}`);
        done(null, users.findUser('_id', id))
    });
}

setupPassport();
module.exports = passport;