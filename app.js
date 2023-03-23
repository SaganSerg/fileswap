const express = require('express')
const expressHandlebars = require('express-handlebars')
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const passport = require('passport'); // это для аутентификации
const LocalStrategy = require('passport-local'); // это для аутентификации
const session = require('express-session');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const langManager = require('./lib/langManager')
const commonVar = require('./lib/commonVar')
const vhost = require('vhost')
const { credentials, domen, protocol } = require('./config')


// const crypto = require('node:crypto');
// const mysql = require('mysql')
// const db = require('./db')

// const getParamMain = require('./lib/getParamMainPage')

// const db = {
//     run(query, paramArr, fun) { // запрос должен быть выполнен в виде строки с интерполяцией переменных в виде элементов массива paramArr
//         const innerFun = function (err, rows, fields) {
//             fun(err, rows)
//         }
//         const connection = mysql.createConnection({
//             host: 'localhost',
//             user: 'admin_simple',
//             password: 'Baron_15',
//             database: 'simple'
//         })
//         connection.connect()
//         connection.query(query, paramArr, innerFun)
//         connection.end()
//     }
// }

const projectSymbolName = commonVar.projectName // мы получили символьное имя для собстенных свойств в объектах express

const app = express()
const eppressHandlebarObj = expressHandlebars.create({
    defaultLayout: 'main'
});


let admin = express.Router()
let www = express.Router()

// passport.use(new LocalStrategy(function verify(username, password, cb) { // данный участок еще даже не запускался
//     db.run(
//         `PREPARE q FROM 'SELECT * FROM customer WHERE customer_email = ?';
//         SET @customer_email = ${username};
//         EXECUTE q USING @customer_email; DEALLOCATE PREPARE q;`,
//         [username], function (err, row) {
//             if (err) { return cb(err); }
//             if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

//             crypto.pbkdf2(password, row.customer_solt, 310000, 32, 'sha256', function (err, hashedPassword) {
//                 if (err) { return cb(err); }
//                 if (!crypto.timingSafeEqual(row.customer_password_hashed, hashedPassword)) {
//                     return cb(null, false, { message: 'Incorrect username or password.' });
//                 }
//                 return cb(null, row);
//             });
//         });
// }));

app.engine('handlebars', eppressHandlebarObj.engine)
app.set('view engine', 'handlebars')

const port = process.env.PORT ?? 3000


app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: 'keyboard cat', // надо подтянуть ключевую фразу
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));


app.use(express.static(__dirname + '/public'))
// app.use(cookieParser(credentials.cookieSecret))
app.use(vhost('admin.' + domen, admin))
app.use(vhost('www.' + domen, www))

app.use((req, res, next) => { // генерируем объкт с кастомными данными в объекте req
    req[projectSymbolName] = {}
    next()
})
app.use((req, res, next) => {
    req[projectSymbolName]['cookiesAgree'] = (req.cookies.agree === 'yes')
    next()
})
app.use((req, res, next) => { // это промежуточное по получает и передает дальше текущий язык 
    let lang = langManager.getCurrantLang(req)
    req[projectSymbolName]['lang'] = lang // в объекте запроса мы создаем собственное свойство, в которое можно записывать свои данные 
    next()
})
// passport.use(new LocalStrategy(function verify(username, password, cb) {
//     return cb(null, {id: 1, username: 'vasa'})
//   }));

// passport.serializeUser(function (user, cb) {
//     process.nextTick(function () {
//         cb(null, { id: user.id, username: user.username });
//     });
// });

// passport.deserializeUser(function (user, cb) {
//     process.nextTick(function () {
//         return cb(null, user);
//     });
// });
// function getParamMain(dictionary, req, res, objWithParam) {
//     const obj = { // в этом объекте находятся свойства для передачи шаблону
//         langNav: {
//             classEnLang: (req.params.lang == 'en') ? 'current' : '',
//             classRuLang: (req.params.lang == 'ru') ? 'current' : ''
//         },
//         cookiesAgree: {
//             classCookiesAgree: (req[projectSymbolName]['cookiesAgree']) ? 'hide' : 'show'
//         },
//         lang: req[projectSymbolName]['lang'],
//         langPath: req[projectSymbolName]['lang'],
//     }
//     return require('./views/layouts/main').pageElements(dictionary, Object.assign(obj, objWithParam))
// }

admin.get('*', (req, res) => res.send('Добро пожаловать, администратор!'))
www.get('*', (req, res) => res.redirect(303, protocol + '://' + domen + ':' + port)) // это переопределение с любого www на главную страницу

// app.get('/', function (req, res) {
//     res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/')
// })

// app.get('/:lang/about-us', (req, res, next) => {
//     langManager.checkLangWrapper(req, res, next, (dictionary) => {
//         res.render('about', Object.assign(
//             require('./views/about').pageElements(dictionary, {
//                 currentUrl: '/about-us'
//             }
//             ),
//             getParamMain(dictionary, req, res, {
//                 mainNav: {
//                     classAboutUs: 'current',
//                 }
//             }),

//         ))
//     })
// })

// app.get('/:lang/cabinet', (req, res, next) => {
//     langManager.checkLangWrapper(req, res, next, (dictionary) => {
//         if (!req[projectSymbolName]['cookiesAgree']) { // здесь проблема -- я не понимаю как мне понять, есть сессия или нет
//             return res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/')
//         }
//         res.render('cabinet', Object.assign(
//             require('./views/cabinet').pageElements(dictionary, {
//                 currentUrl: '/cabinet',
//                 customer: req.session.passport.user.username
//             }
//             ),
//             getParamMain(dictionary, req, res, { mainNav: {}})
//         ))

//     }
//     )
// })

// app.post('/password', passport.authenticate('local', {
//     successRedirect: '/:lang/cabinet', // эти пути просто для примера -- они нерабочие
//     failureRedirect: '/:lang/' // эти пути просто для примера -- они нерабочие
// }));


// app.get('/:lang/', (req, res, next) => {
//     langManager.checkLangWrapper(req, res, next, (dictionary) => {
//         res.render('home', Object.assign(
//             require('./views/home').pageElements(dictionary, {
//                 currentUrl: '/'
//             }
//             ),
//             getParamMain(dictionary, req, res, {
//                 mainNav: {
//                     classHome: 'current',
//                 }
//             }),

//         )
//         )
//     }
//     )
// })

// app.get('/logout', function (req, res, next) { // это решение не работает, потому что оно не удаляет сессияонную куку
//     console.log(req.logout)
//     req.logout(function (err) {
//         if (err) { return next(err); }
//         res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/');
//     });
// });

// app.get('/:lang/signup', function (req, res, next) {
//     langManager.checkLangWrapper(req, res, next, (dictionary) => {
//         res.render('signup', Object.assign(
//             require('./views/signup').pageElements(dictionary, {
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

// app.post('/signup', function (req, res, next) {
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

app.use('/', indexRouter);
app.use('/', authRouter);

app.use((req, res) => {
    res.status(404)
    res.render('404')
})
app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500)
    res.render('500')
})

// passport.serializeUser(function (user, cb) {
//     process.nextTick(function () {
//         cb(null, { id: user.id, username: user.username });
//     });
// });

// passport.deserializeUser(function (user, cb) {
//     process.nextTick(function () {
//         return cb(null, user);
//     });
// });

app.listen(port, () => console.log(
    "\nmake sure you've added the following to your hosts file:" +
    "\n" +
    "\n  127.0.0.1       " + domen +
    "\n  127.0.0.1       admin." + domen +
    "\n  127.0.0.1       wwww." + domen +
    "\n" +
    "\nthen navigate to:" +
    "\n" +
    `\n  http://admin.${domen}:${port}` +
    "\n" +
    "\n and" +
    `\n  http://${domen}:${port}\n`)
)