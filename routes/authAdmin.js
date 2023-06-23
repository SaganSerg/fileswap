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


//     let urlRegistrationGet = '/e8362f1dc52050f73115520eb312218d53a8898c10722867de3aa9050b736ddf01fc56acc84c5a8' + Math.floor(Number(new Date())/100000)
// console.log('urlRegistrationGet')
// console.log(urlRegistrationGet)


// passport.use(new LocalStrategy(function verify(username, password, cb) {
//     console.log('lacolStateg admin')
//     db.run(
//         `SELECT * FROM provider WHERE provider_login = ?;`,
//         [username],
//         function (err, row) {
//             if (err) { return cb(err); }
//             if (row.length === 0) { return cb(null, false, { message: 'Incorrect username or password.' }); }
//             crypto.pbkdf2(password, row[0].provider_solt, 310000, 32, 'sha256', function (err, hashedPassword) {
//                 if (err) { return cb(err); }
//                 if (!crypto.timingSafeEqual(row[0].provider_password_hashed, hashedPassword)) {
//                     return cb(null, false, { message: 'Incorrect username or password.' });
//                 }
//                 return cb(null, { id: row[0].provider_id, username: row[0].provider_login });
//             });
//         });
// }));



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
        res.redirect(303, '/');
    });
});

router.get('/authentification', (req, res, next) => {
    res.redirect(303, '/admin/' + req.session.passport.user.id)
})
router.get('/noauthentification', (req, res, next) => {
    res.redirect(303, '/')
})

router.get("/signup/:urlRegistrationGet", function (req, res, next) { // по данному урлу нужно входить с локально сохраненной странички находится materials/pageForRegistration
    let url = 'e8362f1dc52050f73115520eb312218d53a8898c10722867de3aa9050b736ddf01fc56acc84c5a8' + Math.floor(Number(new Date()) / 100000);
    console.log(url)
    console.log(req.params.urlRegistrationGet)
    if (req.params.urlRegistrationGet == url) {

        return res.render('signup-admin', { layout: 'mainAdmin' })
    }
    next()
})

router.post('/signup/:urlRegistrationPost', function (req, res, next) { // готово
    try {
        let url = '8293af6f69a2a199f8d84867bf5e1276ef54cff79f3acd055d0f1936b067bb2b93e3f1c609b1b51'
        console.log(req.body)
        const body = req.body
        let username = body.username,
            password = body.password,
            firstname = body.firstname,
            secondname = body.secondname,
            status = body.status
        let date = (new Date()).getTime()
        // res.json(JSON.stringify({
        //     itisgood: true
        // }))
        db.run(
            `SELECT provider_login FROM provider WHERE provider_login = ?`,
            [username], (err, providerLoginArr) => {
                if (err) {
                    throw err
                }
                if (providerLoginArr.length) return res.json(JSON.stringify({
                    itisgood: false,
                    message: 'Такой логин уже существует'
                }))
                var salt = crypto.randomBytes(16);
                crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function (err, hashedPassword) {
                    if (err) {
                        throw err
                    }
                    db.run(`INSERT INTO provider (
            provider_login, 
            provider_firstname,
            provider_secondname,
            provider_registration_date,
            provider_status,
            provider_password_hashed,
            provider_solt
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            username,
                            firstname,
                            secondname,
                            date,
                            status,
                            hashedPassword,
                            salt
                        ], function (err, results) {
                            if (err) {
                                throw err
                            }
                            var user = {
                                id: results.insertId,
                                username
                            };
                            req.login(user, function (err) {
                                if (err) {
                                    throw err
                                }
                                // req.session.passport.user -- данные пользователя хранятся тут
                                // res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/cabinet');
                                res.json(JSON.stringify({
                                    itisgood: true,
                                    message: 'Сотрудник зарегистрирован'
                                }))
                            });
                        });
                });
            }
        )
    } catch (err) {
        res.json(JSON.stringify({
            itisgood: false,
            message: 'Что-то пошло не так'
        }))
    }
})
// router.get('/proverka', (req, res, next) => { // это надо будет удалить
//     res.send('proverka321321') // это заглушка
// })
module.exports = router;