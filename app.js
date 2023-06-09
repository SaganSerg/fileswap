const express = require('express')
const expressHandlebars = require('express-handlebars')
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const indexRouterAdmin = require('./routes/indexAdmin')
const authRouterAdmin = require('./routes/authAdmin') // возможно надо будет удалить. Пока только пробую
const multiparty = require('multiparty')
const passport = require('passport'); // это для аутентификации
const LocalStrategy = require('passport-local'); // это для аутентификации
const session = require('express-session');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fs = require('fs') // возможно потом надо будет удалить
const langManager = require('./lib/langManager')
const commonVar = require('./lib/commonVar')
const vhost = require('vhost')
const db = require('./db')
let { credentials, domen, protocol, port } = require('./config')


const projectSymbolName = commonVar.projectName // мы получили символьное имя для собстенных свойств в объектах express

const app = express()
const eppressHandlebarObj = expressHandlebars.create({
    defaultLayout: 'main'
});


let admin = express.Router()
let www = express.Router()

app.engine('handlebars', eppressHandlebarObj.engine)
app.set('view engine', 'handlebars')

port = process.env.PORT ?? port


app.use(cookieParser(credentials.cookieSecret))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));


app.use(express.static(__dirname + '/public'))

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
// app.use((req, res, next) => {
//     let urlRegistrationGet = '/e8362f1dc52050f73115520eb312218d53a8898c10722867de3aa9050b736ddf01fc56acc84c5a8' + Math.floor(Number(new Date())/100000)
// console.log('urlRegistrationGet')
// console.log(urlRegistrationGet)
//     req[projectSymbolName]['urlRegistrationGet'] = urlRegistrationGet
// })



www.get('*', (req, res) => res.redirect(303, protocol + '://' + domen + ':' + port)) // это переопределение с любого www на главную страницу

admin.use('/', indexRouterAdmin)
admin.use('/', authRouterAdmin)
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