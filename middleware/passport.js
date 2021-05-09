const User = require('../model/user')
const LocalStrategy = require('passport-local').Strategy
const CookieStrategy = require('passport-cookie')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const bcrypt = require('bcrypt')

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'pasha1neo',
}

module.exports = (passport) => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'login',
            },
            async (username, password, done) => {
                const user = await User.findOne({login: username})
                if (!user) return done(null, false)
                const result = bcrypt.compare(password, user.password)
                if (result === false) return done(null, false)
                const data = {
                    id: user._id,
                    login: user.login,
                    email: user.email,
                    nickname: user?.nickname,
                    posts: user?.posts,
                    avatar: user?.avatar,
                }
                return done(null, data)
            }
        )
    )
    passport.use(
        new CookieStrategy({cookieName: 'userid'}, async (token, done) => {
            try {
                const user = await User.findById(token.userId)
                if (user) return done(null, user)
                else return done(null, false)
            } catch (error) {
                return done(error, false)
            }
        })
    )
    passport.use(
        new JwtStrategy(jwtOptions, (jwt_payload, done) => {
            User.findById(jwt_payload.userId, '_id', (err, user) => {
                if (err) return done(err, false)
                if (user) return done(null, user)
                return done(null, false)
            })
        })
    )
}
