const express = require('express')
const commonVar = require('../lib/commonVar')
const projectSymbolName = commonVar.projectName // мы получили символьное имя для собстенных свойств в объектах express
const langManager = require('../lib/langManager')
const passport = require('passport'); // это для аутентификации
const LocalStrategy = require('passport-local'); // это для аутентификации
const crypto = require('node:crypto');
const getParamMain = require('../lib/getParamMainPage')
const router = express.Router();
const db = require('./../db')

passport.use(new LocalStrategy(function verify(username, password, cb) {
    let SQLquery = ''
    let solt
    let hash
    let id
    let login
    console.log(username.slice(-9))
    if (username.slice(-9) === '_employee') { 
        SQLquery = `SELECT * FROM provider WHERE provider_login = ?`
        solt = 'provider_solt'
        hash = 'provider_password_hashed'
        id = 'provider_id'
        login = 'provider_login'
    } else {
        SQLquery = `SELECT * FROM customer WHERE customer_email = ?`
        solt = 'customer_solt'
        hash = 'customer_password_hashed'
        id = 'customer_id'
        login = 'customer_email'
    }
    db.run(
        SQLquery,
        [username], 
        function (err, row) {
            if (err) { return cb(err); }
            if (row.length === 0) { return cb(null, false, { message: 'Incorrect username or password.' }); }
            crypto.pbkdf2(password, row[0][solt], 310000, 32, 'sha256', function (err, hashedPassword) {
                if (err) { return cb(err); }
                if (!crypto.timingSafeEqual(row[0][hash], hashedPassword)) {
                    return cb(null, false, { message: 'Incorrect username or password.' });
                }
                return cb(null, {id: row[0][id], username: row[0][login]});
            });
        });
}));


passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});
// router.get('/:lang/login', (req, res, next) => {
//     lang = req[projectSymbolName]['lang'];
//     langManager.checkLangWrapper(req, res, next, (dictionary) => {
//         res.render('login', Object.assign(
//             require('./../views/login').pageElements(dictionary, {
//                 currentUrl: '/login',
//                 cookieMessageForForm: !req[projectSymbolName]['cookiesAgree'],
//                 enterButtonActive: !req[projectSymbolName]['cookiesAgree']

//             }
//             ),
//             getParamMain(dictionary, req, res, {
//                 mainNav: {
//                     classLogin: 'current',
//                 }
//             }),

//         )
//         )
//     }
//     )
// })
router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/authentification',
    failureRedirect: '/noauthentification'
}));
// router.get('/authentification', function (req, res, next) {
//     res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/buy')
// })
// router.get('/noauthentification', function (req, res, next) {
//     res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/')
// })

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/');
    });
});


// router.get('/:lang/signup', function (req, res, next) {
//     langManager.checkLangWrapper(req, res, next, (dictionary) => {
//         res.render('signup', Object.assign(
//             require('./../views/signup').pageElements(dictionary, {
//                 currentUrl: '/signup',
//                 cookieMessageForForm: !req[projectSymbolName]['cookiesAgree'],
//                 enterButtonActive: !req[projectSymbolName]['cookiesAgree']

//             }
//             ),
//             getParamMain(dictionary, req, res, {
//                 mainNav: {
//                     classSignUp: 'current',
//                 }
//             }),

//         )
//         )
//     }
//     )
// });
// router.post('/signup', function (req, res, next) {
//     var salt = crypto.randomBytes(16);
//     crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function (err, hashedPassword) {
//         if (err) { return next(err); }
//         db.run(`INSERT INTO customer (customer_email, customer_password_hashed, customer_solt) VALUES (?, ?, ?);`,
//             [
//                 req.body.username,
//                 hashedPassword,
//                 salt
//             ], function (err, results) {
//                 if (err) { return next(err); }
//                 var user = {
//                     id: results.insertId,
//                     username: req.body.username
//                 };
//                 req.login(user, function (err) {
//                     if (err) { return next(err); }
//                     // req.session.passport.user -- данные пользователя хранятся тут
//                     res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/cabinet');
//                 });
//             });
//     });
// });
module.exports = router;