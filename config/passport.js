import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import bcrypt from 'bcrypt';
import slugify from 'slugify';
import dotenv from 'dotenv';

import User from '../models/users.model.js';
import { JWT_SECRET } from './jwt.js';

dotenv.config();

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });

    if (!user || user.registerType !== 'normal' || !user.password) {
      return done(null, false, { message: 'Please log in using your Google account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect email or password' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// --- JWT Strategy: Authenticated Route Access ---
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
  passReqToCallback: true
}, async (req, jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload.id).select('-password');
    if (!user) return done(null, false);

    req.user = user;
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

// --- Google OAuth2 Strategy: Login/Signup with Google ---
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: "http://localhost:3000/auth/login/google/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const state = req.query.state;
    const email = profile.emails[0].value;
    const existingUser = await User.findOne({ email });

    if (state === 'signup') {
      if (existingUser) {
        return done(null, false, { message: 'Email already registered. Please log in instead.' });
      }

      const baseUsername = slugify(profile.displayName || email.split('@')[0], {
        lower: true,
        strict: true
      }) || 'user';

      let finalUsername = baseUsername;
      let counter = 1;

      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${baseUsername}${counter++}`;
      }

      const newUser = await User.create({
        email,
        username: finalUsername,
        registerType: 'google'
      });

      return done(null, newUser);
    }

    if (state === 'login') {
      if (!existingUser || existingUser.registerType !== 'google') {
        return done(null, false, { message: 'Account not registered with Google.' });
      }

      return done(null, existingUser);
    }

    return done(null, false, { message: 'Invalid login state.' });
  } catch (err) {
    console.error('Google Strategy Error:', err);
    return done(err);
  }
}));

// Note: serializeUser/deserializeUser not needed (stateless with JWT)

export default passport;
