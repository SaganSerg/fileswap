const express = require('express')
const commonVar = require('../lib/commonVar')
const {checkSum} = require('../lib/checkSum')
const projectSymbolName = commonVar.projectName // мы получили символьное имя для собстенных свойств в объектах express
const langManager = require('../lib/langManager')
const getParamMain = require('../lib/getParamMainPage')
const router = express.Router();
const multiparty = require('multiparty')
const pathUtils = require('path') // возможно потом нужно будет удалить
const fs = require('fs') // возможно потом надо будет удалить
const db = require('./../db')

function checkAccounеAccess(req, res, dictionary, fun) {
    if (!req[projectSymbolName]['cookiesAgree'] || !req.session?.passport?.user?.id) {
        return res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/')
    }
    fun(res, req, dictionary, projectSymbolName)
}
router.get('/', function (req, res) {
    res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/')
})
router.get('/:lang/about-us', (req, res, next) => {
    langManager.checkLangWrapper(req, res, next, (dictionary) => {
        res.render('about', Object.assign(
            require('./../views/about').pageElements(dictionary, {
                currentUrl: '/about-us'
            }
            ),
            getParamMain(dictionary, req, res, {
                mainNav: {
                    classAboutUs: 'current',
                }
            }),

        ))
    })
})

router.get('/:lang/', (req, res, next) => {
    langManager.checkLangWrapper(req, res, next, (dictionary) => {
        res.render('home', Object.assign(
            require('./../views/home').pageElements(dictionary, {
                currentUrl: '/'
            }
            ),
            getParamMain(dictionary, req, res, {
                mainNav: {
                    classHome: 'current',
                }
            }),

        )
        )
    }
    )
})
router.get('/:lang/noauthentication', (req, res, next) => {
    langManager.checkLangWrapper(req, res, next, (dictionary) => {
        res.render('noauthentication', Object.assign(
            require('./../views/noauthentication').pageElements(dictionary, {
                currentUrl: '/noauthentication'
            }
            ),
            getParamMain(dictionary, req, res, {
                mainNav: {
                    classHome: 'current',
                }
            }),

        )
        )
    }
    )
})
router.get('/:lang/cabinet', (req, res, next) => {
    langManager.checkLangWrapper(req, res, next, (dictionary) => {
        checkAccounеAccess(req, res, dictionary, (res, req, dictionary) => {
            res.render('cabinet', Object.assign(
                require('./../views/cabinet').pageElements(dictionary, {
                    currentUrl: '/cabinet',
                    customer: req.session.passport.user.username
                }
                ),
            getParamMain(dictionary, req, res, { mainNav: {}})
            )
            )
        }
        )
    }
    )
})
router.get('/:lang/file', (req, res, next) => {
    langManager.checkLangWrapper(req, res, next, (dictionary) => {
        checkAccounеAccess(req, res, dictionary, (res, req, dictionary) => {
            res.render('file', Object.assign(
                    require('./../views/file').pageElements(dictionary, {
                        currentUrl: '/file',
                        customer: req.session.passport.user.username
                    }
                    ),
                    getParamMain(dictionary, req, res, {
                        mainNav: {
                            classFile: 'current',
                        }
                    }),
        
                )
                )
        }
        )
    }
    )
})
router.post('/file/upload', (req, res, next) => {
    const form = new multiparty.Form()
    form.parse(req, (err, fields, files) => {
        if(err) throw err
        const file = files.file[0];
        const filePath = file.path;
        const fileContent = fs.readFileSync(filePath);
        if (! checkSum(fileContent, fields.checksum)) return res.redirect(303, '/somethingwrong')
        const customerId = (req.session?.passport?.user) ? req.session.passport.user.id : null
        if (!customerId) return next()
        db.run(
            `INSERT INTO file (customer_id, file_file) VALUES (?, ?)`,
            [customerId, fileContent], 
            function (err, row) {
                if (err) throw err 
                if (!row) return next()
                res.redirect(303, '/fileIsGet')
            });
        
    })
})
router.get('/fileIsGet', (req, res, next) => {
    res.send('file is get') // это заглушка
}) 

router.get('/download', (req, res, next) => {
    const customerId = (req.session?.passport?.user) ? req.session.passport.user.id : null
    const fileId = req.query.id
    if (!customerId) return next()
    if (!fileId) return next()
    db.run(
        'SELECT file_file FROM file WHERE file_id = ?',
        [fileId],
        (err, row) => {
            if (err) throw err;
            const file = row[0].file_file
            const filename = 'file_' + fileId;
            fs.writeFile(filename, file, (err) => {
                if (err) throw err;
                res.download(filename, (err) => {
                    if (err) throw err;
                    fs.unlinkSync(filename);
                });
            });
        }
    )
})
router.get('/somethingwrong', (req, res, next) => { 
    res.send('something went wrong!') // это заглушка
})
module.exports = router;