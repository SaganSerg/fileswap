const basedLang = 'en'
exports.langList = [ // перечень языков
    'ru', 
    basedLang
]
const isRightLang = lang => exports.langList.indexOf(lang) > -1
exports.getRightLang = lang => isRightLang(lang) ? lang : basedLang
exports.getDictionary = lang => {
    return (require('./../lang/' + (exports.getRightLang(lang) + '/dictionary'))).dictionary
}
exports.getBrauserLang = req => req.headers['accept-language'].slice(0,2).toLowerCase()
exports.checkLangWrapper = (req, res, next, fun) => {
    if (exports.langList.find(x => x === req.params.lang)) {
        return fun(exports.getDictionary(exports.getRightLang(req.params.lang)))
    }
    next()
}
exports.getCurrantLang = req => { // это пока заглушка, потом нужно будет получение реального языка из всех источников получать
    let lang = req.cookies.lang ?? req.path.substring(1, 3)
    if (isRightLang(lang)) return exports.getRightLang(lang)
    return exports.getRightLang(exports.getBrauserLang(req))
} 