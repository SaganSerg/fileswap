const commonVar = require('./commonVar')
const projectSymbolName = commonVar.projectName // мы получили символьное имя для собстенных свойств в объектах express
function getParamMain(dictionary, req, res, objWithParam) {
    const obj = { // в этом объекте находятся свойства для передачи шаблону
        lang: req[projectSymbolName]['lang'],
        langPath: req[projectSymbolName]['lang'],
    }
    return require('./../views/layouts/cabinet').pageElements(dictionary, Object.assign(obj, objWithParam))
}

module.exports = getParamMain;