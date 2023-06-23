const express = require('express')
const commonVar = require('../lib/commonVar')
const { checkSum } = require('../lib/checkSum')
const projectSymbolName = commonVar.projectName // мы получили символьное имя для собстенных свойств в объектах express
const langManager = require('../lib/langManager')
const getParamMain = require('../lib/getParamMainPage')
const getParamCabinet = require('../lib/getParamCabinetPage') // это не доделано
const router = express.Router();
const multiparty = require('multiparty')
const pathUtils = require('path') // возможно потом нужно будет удалить
const fs = require('fs') // возможно потом надо будет удалить
const db = require('./../db')
const { credentials, protocol, domen, port, sberUserName, fileMaxSize } = require('../config')
const crypto = require('node:crypto');
const https = require('node:https')
const http = require('node:http')

function checkAccountAccess(req, res, dictionary, fun) {
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
router.get('/wrong', (req, res, next) => {
    // next()
    res.send('что-то пошло не так') // надо потом переделать
})
router.get('/fileisnotupload', (req, res, next) => {
    res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/fileisnotupload')
})
router.get('/:lang/fileisnotupload', (req, res, next) => {
    db.run(
        'SELECT * FROM customer WHERE customer_id = ?',
        [req.session.passport.user.id],
        (err, results) => {
            langManager.checkLangWrapper(req, res, next, (dictionary) => {
                res.render('fileisnotupload', Object.assign(
                    { layout: 'cabinet' },
                    require('./../views/fileisnotupload').pageElements(dictionary, {
                        currentUrl: '/fileisnotupload',
                    }
                    ),
                    getParamCabinet(dictionary, req, res, {
                        login: req.session.passport.user.username,
                        coins: String(results[0].customer_coins),
                        mainNav: { }
                    })
                ))
            }
            )
        }
    )
})
router.get('/:lang/', (req, res, next) => {
    langManager.checkLangWrapper(req, res, next, (dictionary) => {
        res.render('home', Object.assign(
            require('./../views/home').pageElements(dictionary, {

            }
            ),
            getParamMain(dictionary, req, res, {
                mainNav: {
                    classHome: 'nav__link_current',
                },
                pageMark: 'index',
                currentUrl: '/'
            }),
        )
        )
    }
    )
})
router.get('/:lang/registration', (req, res, next) => {
    langManager.checkLangWrapper(req, res, next, (dictionary) => {
        res.render('registration', Object.assign(
            require('./../views/registration').pageElements(dictionary, {

            }
            ),
            getParamMain(dictionary, req, res, {
                mainNav: {
                },
                pageMark: 'registration',
                currentUrl: '/registration'
            }),
        )
        )

    }
    )
})
router.post('/registration', (req, res, next) => {
    const messages = []
    const body = req.body
    let email = body.email
    let telephone = body.telephone
    let currency = body.currency
    let password = body.password
    let repeat_password = body.repeat_password
    let checkEmail = false
    const allMessages = [
        'You_didnt_enter_anything_in_the_email_address_field',
        'You_must_give_your_consent_to_the_use_of_cookies',
        "The_entered_data_is_not_a_valid_email_format",
        "Your_email_address_must_be_no_longer_than_50_characters",
        "This_email_address_is_already_registered",
        "InTelephoneNumberIsNot11character",
        "InTelephoneNumberIsNotOnlyNumeric",
        "You_didnt_enter_anything_in_the_phone_number_field",
        "You_have_not_selected_a_currency",
        "Password_too_long_or_too_short",
        "You_didnt_enter_anything_in_the_password_field",
        "Password_mismatch",
        'You_didnt_enter_anything_in_the_password_mismatch_field'
    ]
    db.run('SELECT customer_id FROM customer WHERE customer_email = ? LIMIT 1', [email], function (err, results) {
        if (err) { return next(err); }
        if (results.length !== 0) {
            checkEmail = true
        }
        if (!email) {
            messages.push('You_didnt_enter_anything_in_the_email_address_field')
        } else {
            if (checkEmail) {
                messages.push('This_email_address_is_already_registered')
            } else {
                if (!(/^[\w.-]+@[a-zA-Z_-]+?\.[a-zA-Z]{2,6}$/i.test(email))) messages.push('The_entered_data_is_not_a_valid_email_format')
                if (!(email.length <= 50)) messages.push('Your_email_address_must_be_no_longer_than_50_characters')
            }
        }
        if (!telephone) {
            messages.push('You_didnt_enter_anything_in_the_phone_number_field')
        } else {
            if (/d+/.test(telephone)) messages.push('InTelephoneNumberIsNotOnlyNumeric')
            if (telephone.length != 11) messages.push('InTelephoneNumberIsNot11character')
        }
        if (currency == 'empty') {
            messages.push('You_have_not_selected_a_currency')
        }
        if (!password) {
            messages.push('You_didnt_enter_anything_in_the_password_field')
        } else {
            if (password.length < 5 || password.length > 100) messages.push('Password_too_long_or_too_short')
        }
        if (!repeat_password) {
            messages.push('You_didnt_enter_anything_in_the_password_mismatch_field')
        } else {
            if (repeat_password !== password) messages.push('Password_mismatch')
        }
        if (!req[projectSymbolName]['cookiesAgree']) messages.push('You_must_give_your_consent_to_the_use_of_cookies')
        if (messages.length !== 0) {
            let itisgood = false

            const sending = JSON.stringify({
                itisgood,
                lang: req[projectSymbolName]['lang'],
                protocol,
                domen,
                port,
                messages,
                allMessages

            })
            return res.json(sending)

        }
        let salt = crypto.randomBytes(16)
        let date = Number(new Date())
        crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) { return next(err); }
            db.run(`INSERT INTO customer (customer_email, customer_password_hashed, customer_solt, customer_telephone, customer_valuta, customer_registration_date) VALUES (?, ?, ?, ?, ?, ?);`,
                [
                    email,
                    hashedPassword,
                    salt,
                    telephone,
                    currency,
                    date

                ], function (err, results) {
                    if (err) { return next(err); }
                    var user = {
                        id: results.insertId,
                        username: email
                    };
                    req.login(user, function (err) {
                        if (err) { return next(err); }
                        const sending = JSON.stringify({
                            itisgood: true,
                            lang: req[projectSymbolName]['lang'],
                            protocol,
                            domen,
                            port,
                            allMessages,
                        })
                        return res.json(sending)
                        // req.session.passport.user -- данные пользователя хранятся тут
                        // res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/buy');
                    });
                });
        });
    })
})

router.get('/noauthentification', (req, res, next) => {
    const allMessages = [
        'Incorrect_login_or_password',
        'You_must_give_your_consent_to_the_use_of_cookies'
    ]
    const messages = ['Incorrect_login_or_password']
    if (!req[projectSymbolName]['cookiesAgree']) messages.push('You_must_give_your_consent_to_the_use_of_cookies')
    let itisgood = false

    const sending = JSON.stringify({
        itisgood,
        lang: req[projectSymbolName]['lang'],
        protocol,
        domen,
        port,
        messages,
        allMessages

    })
    return res.json(sending)
})
router.get('/authentification', function (req, res, next) {
    const sending = JSON.stringify({
        itisgood: true,
        lang: req[projectSymbolName]['lang'],
        protocol,
        domen,
        port
    })
    return res.json(sending)
})
router.get('/:lang/profile', (req, res, next) => {
    db.run(
        'SELECT * FROM customer WHERE customer_id = ?',
        [req.session.passport.user.id],
        (err, results) => {
            langManager.checkLangWrapper(req, res, next, (dictionary) => {
                res.render('profile', Object.assign(
                    { layout: 'cabinet' },
                    require('./../views/profile').pageElements(dictionary, {
                        currentUrl: '/profile',
                        telephoneNumber: results[0]['customer_telephone'],
                        currency: results[0]['customer_valuta'],
                        InTelephoneNumberIsNot11characterCondition: true, // это сделано для того, чтобы скрыть сообщения, по сути это кастыль
                        InTelephoneNumberIsNotOnlyNumericCondition: true, // это сделано чтобы скрыть сообщения , по сути это кастыль
                        telephoneValue: '71001234567', // это пляйсходер
                    }
                    ),
                    getParamCabinet(dictionary, req, res, {
                        login: req.session.passport.user.username,
                        coins: String(results[0].customer_coins),
                        mainNav: { classProfile: 'main-nav__link_currant' }
                    })
                ))
            }
            )
        }
    )
    
}
)
router.post('/profile', (req, res, next) => { // это заглушка
    const messages = []
    const body = req.body
    let telephone = body.telephone
    let currency = body.currency
    const allMessages = [
        'InTelephoneNumberIsNot11character',
        'InTelephoneNumberIsNotOnlyNumeric'
    ]
    if (telephone) {
        if (!(/^\d+$/.test(telephone))) messages.push('InTelephoneNumberIsNotOnlyNumeric')
        if (telephone.length != 11) messages.push('InTelephoneNumberIsNot11character')
    }
    if (messages.length) {
        res.json(JSON.stringify({
            itisgood: false,
            lang: req[projectSymbolName]['lang'],
            protocol,
            domen,
            port,
            messages,
            allMessages
        }))
    } else {
        // UPDATE customer SET $bdParameterName = ? WHERE customer_id = ?
        let sqlString = ''
        const dataForSQL = []
        if (telephone) {
            sqlString += (sqlString ? ', ' : ' ') + 'customer_telephone = ?'
            dataForSQL.push(telephone)
            
        }
        console.log(currency.length)
        if (currency !== 'empty' && currency.length === 3) {
            sqlString += (sqlString ? ', ' : ' ') + 'customer_valuta = ? '
            dataForSQL.push(currency)
        }
        // console.log(sqlString)
        // console.log(dataForSQL)
        let query = `UPDATE customer SET ${sqlString} WHERE customer_id = ?`
        dataForSQL.push(req.session.passport.user.id)
        console.log(query)
        console.log(dataForSQL)
        db.run(
            query,
            dataForSQL,
            (err, results) => {
                if (err) { return next(err); }
                res.json(JSON.stringify({
                    itisgood: true,
                    lang: req[projectSymbolName]['lang'],
                    protocol,
                    domen,
                    port,
                    messages,
                    allMessages
                }))
            }
        )
        
    }
    
    // setTimeout(
    //     () => res.json(messages), 1000
    // )
})


router.get('/:lang/buy-coin', (req, res, next) => {
    db.run(
        'SELECT customer_coins FROM customer WHERE customer_id = ?',
        [req.session.passport.user.id],
        function (err, results) {
            if (err) { return next(err) }
            langManager.checkLangWrapper(req, res, next, (dictionary) => {
                res.render('buy', Object.assign(
                    { layout: 'cabinet' },
                    require('./../views/buy').pageElements(dictionary, {
                        currentUrl: '/buy-coin'
                    }
                    ),
                    getParamCabinet(dictionary, req, res, {
                        login: req.session.passport.user.username,
                        coins: String(results[0].customer_coins),
                        mainNav: { classBuyCoin: 'main-nav__link_currant' }
                    })
                ))
            }
            )
        }
    )
})
router.post('/pay', (req, res, next) => {
    let coins = Number(req.body?.coins)
    if (coins) {
        db.run(
            `SELECT 
                valuta_exchange_rate.valuta_exchange_rate_id,
                valuta_exchange_rate.valuta_exchange_rate_value    
            FROM 
                customer 
            INNER JOIN
                valuta_exchange_rate
            ON
                customer.customer_valuta = valuta_exchange_rate.valuta_name 
            WHERE customer_id = ?`,
            [req.session.passport.user.id],
            function (err, resultValutaExchangeRate) {
                if (err) { 
                    console.log('Ошибка при получении данный valuta_exchange_rate.valuta_exchange_rate_id, valuta_exchange_rate.valuta_exchange_rate_value')    
                    return next(err) 
                }
                db.run(
                    `INSERT INTO coin_transaction (
                        customer_id, 
                        coin_transaction_date, 
                        coin_transaction_sum, 
                        coin_transaction_status
                        ) VALUE (?, ?, ?, ?)`,
                    [req.session.passport.user.id, Number(new Date()), coins, 'toPaySystem'],
                    function (err, resultCoinTransaction) {
                        if (err) { 
                            console.log('Ошибка при введении данных в таблицу coin_transaction')
                            return next(err) 
                        }
                        db.run(
                            `INSERT INTO pay_system_transaction (coin_transaction_id, valuta_exchange_rate_id) VALUE (?, ?)`,
                            [resultCoinTransaction.insertId, resultValutaExchangeRate[0].valuta_exchange_rate_id],
                            function (err, resultPaySystevTransaction) {
                                if (err) { 
                                    console.log('Ошибка поле введения данных в pay_system_transaction')
                                    return next(err) 
                                }
                                const postData = JSON.stringify({
                                    'amount': resultValutaExchangeRate[0].valuta_exchange_rate_value * coins,
                                    'orderNumber': resultCoinTransaction.insertId,
                                    'returnUrl': protocol + '://' + domen + ':' + port + '/' + req[projectSymbolName]['lang'] + '/goodpay/' + resultCoinTransaction.insertId,
                                    'failUrl': protocol + '://' + domen + ':' + port + '/' + req[projectSymbolName]['lang'] + '/badpay/' + resultCoinTransaction.insertId,
                                    'userName': sberUserName,
                                    'password': credentials.sberPass
                                })
                                const options = {
                                    hostname: 'localhost',
                                    port: 3033,
                                    path: '/payment/rest/register.do',
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Content-Length': Buffer.byteLength(postData),
                                    },
                                }
                                const requestHttp = http.request(options, (resHttp) => {
                                    resHttp.setEncoding('utf8')
                                    resHttp.on('data', (chunk) => {
                                        if (!chunk) { 
                                            console.log('Ошибка данные не поступили !chunk')
                                            return next() 
                                        }
                                        chunk = JSON.parse(chunk)
                                        if (typeof chunk !== 'object') { 
                                            console.log(chunk)
                                            console.log(typeof chunk)
                                            console.log('Ошибка chunk === object')    
                                            return next() 
                                        }
                                        if (!chunk.orderId && !chunk.formUrl) {
                                            let codeErr = chunk.errorCode
                                            let messageError = chunk.errorMessage
                                            console.log('Ошибка !chunk.orderId && !chunk.formUrl')
                                            return next()
                                        }
                                        db.run(
                                            'UPDATE pay_system_transaction SET pay_system_transaction_order_id = ? WHERE pay_system_transaction_id = ?',
                                            [chunk.orderId, resultPaySystevTransaction.insertId],
                                            function (err, paySystemTransactionUpdate) {
                                                if (err) { 
                                                    console.log('Ошибка после update pay_system_transaction')    
                                                    return next(err) 
                                                }
                                                // if (paySystemTransactionUpdate.changedRows !== 1) { 
                                                //     console.log(paySystemTransactionUpdate)
                                                //     console.log(paySystemTransactionUpdate.length)
                                                //     console.log('paySystemTransactionUpdate.changedRows !== 1')
                                                //     return next() 
                                                // }
                                                return res.redirect(303, chunk.formUrl)
                                            }
                                        )
                                        // db.run( // это надо завернуть в функцию DeletePaySystemTransactionAndCoinTransatction
                                        //     'DELETE FROM pay_system_transaction WHERE pay_system_transaction_id = ?',
                                        //     [resultPaySystevTransaction.insertId],
                                        //     function (err, resultsPaySystemTransactionDelete) {
                                        //         if (err) { return next(err) }
                                        //         db.run(
                                        //             'DELETE FROM coin_transaction WHERE coin_transaction_id = ?',
                                        //             [resultCoinTransaction.insertId],
                                        //             (err, resultCoinTransactionDelete) => true
                                        //         )
                                        //     }
                                        // )

                                    }
                                    )
                                    resHttp.on('end', () => true)
                                }
                                )
                                requestHttp.on('error', (e) => {
                                    // db.run( // это надо завернуть в функцию DeletePaySystemTransactionAndCoinTransatction
                                    //     'DELETE FROM pay_system_transaction WHERE pay_system_transaction_id = ?',
                                    //     [resultPaySystevTransaction.insertId],
                                    //     function (err, resultsPaySystemTransactionDelete) {
                                    //         if (err) { return next(err) }
                                    //         db.run(
                                    //             'DELETE FROM coin_transaction WHERE coin_transaction_id = ?',
                                    //             [resultCoinTransaction.insertId],
                                    //             (err, resultCoinTransactionDelete) => true
                                    //         )
                                    //     }
                                    // )
                                    console.log('Ошибка при срабатывании события error')
                                    return res.redirect(303, '/wrong')
                                })
                                requestHttp.write(postData);
                                requestHttp.end();
                            })

                        
                    }
                )
            }
        )
    }
    // )
    // }
    // console.log('Срабатываение next кога условие coins не истинно')
    // next()
})
// router.get('/:lang/noauthentication', (req, res, next) => {
//     langManager.checkLangWrapper(req, res, next, (dictionary) => {
//         res.render('noauthentication', Object.assign(
//             require('./../views/noauthentication').pageElements(dictionary, {
//                 currentUrl: '/noauthentication'
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
router.get('/:lang/goodpay/:coin_transaction_id', (req, res, next) => {
    // let url = 'https://3dsec.sberbank.ru/payment/rest/getOrderStatusExtended.do'; // это реальный адрес
    const requestBody = JSON.stringify({
        'userName': sberUserName,
        'password': credentials.sberPass,
        'orderNumber': req.params.coin_transaction_id
    })
    const options = {
        hostname: 'localhost',
        port: 3033,
        path: '/payment/rest/getOrderStatusExtended.do',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody),
        },
    }
    const requestHttp = http.request(options, (resHttp) => {
        resHttp.setEncoding('utf8')
        resHttp.on('data', (chunk) => {
            if (!chunk) { 
                console.log('Ошибка данные не поступили !chunk')
                return next() 
            }
            chunk = JSON.parse(chunk)
            console.log(chunk)
            if (typeof chunk !== 'object') { 
                console.log(chunk)
                console.log(typeof chunk)
                console.log('Ошибка chunk === object')    
                return next() 
            }
            // if (!chunk.orderId && !chunk.formUrl) {
            //     let codeErr = chunk.errorCode
            //     let messageError = chunk.errorMessage
            //     console.log('Ошибка !chunk.orderId && !chunk.formUrl')
            //     console.log(chunk.orderId)
            //     console.log(chunk.formUrl)
            //     return next()
            // }
            if (chunk['actionCode'] === 0 && chunk['orderStatus'] === 1 && chunk['orderNumber']){
                // сюда нужно реализовать ЧТО-то Что будет проверять не было ли пеерхода 
                db.run(
                    'UPDATE pay_system_transaction SET pay_system_transaction_notactivelink = 1 WHERE coin_transaction_id = ?',
                    [req.params.coin_transaction_id],
                    function (err, paySystemTransactionUpdate) {
                        if (err) { 
                            console.log('Ошибка после update pay_system_transaction')    
                            return next(err) 
                        }
                        db.run(
                            "UPDATE coin_transaction SET coin_transaction_status = ? WHERE coin_transaction_id = ?",
                            ['PaySystemOK', req.params.coin_transaction_id],
                            function (err, coinTransactionUpdate) {
                                if (err) {
                                    console.log('Ошибка update coin_transaction')
                                    return next(err)
                                }
                                db.run('UPDATE customer SET customer_coins = customer_coins + (SELECT coin_transaction_sum FROM coin_transaction WHERE coin_transaction_id =?) WHERE customer_id = (SELECT customer_id FROM coin_transaction WHERE coin_transaction_id =?)', 
                                [req.params.coin_transaction_id, req.params.coin_transaction_id],
                                function (err, customerUpdate) {
                                    if (err) {
                                        console.log('ошибка обновления customer')
                                        return next(err)
                                    }
                                    res.redirect(303, '/' + req[projectSymbolName]['lang'] + '/buy-coin')
                                }
                                )
                            }
                        )
                    }
                )
            } else {
                db.run(
                    'UPDATE coin_transaction SET coin_transaction_status = ? WHERE coin_transaction_id = ?',
                    [ 'PaySystemFailed', req.params.coin_transaction_id],
                    function (err, updateTransactionFailed) {
                        if (err) {
                            console.log('Ошибка обновления coin_transaction если вернулась от банка ошибка')
                            return next()
                        }
                    }
                )
            }
        }
        )
        resHttp.on('end', () => true)
    }
    )
    requestHttp.on('error', (e) => {
        console.log('Ошибка при срабатывании события error')
        return next()
    })
    requestHttp.write(requestBody);
    requestHttp.end();
})
router.get('/:lang/badpay/:coin_transaction_id', (req, res, next) => {
    db.run(
        'SELECT customer_coins FROM customer WHERE customer_id = ?',
        [req.session.passport.user.id],
        function (err, customerCoinsSelect) {
            if (err) { return next(err) }
            db.run(
                "UPDATE coin_transaction SET coin_transaction_status = ? WHERE coin_transaction_id = ?", 
                [ 'PaySystemFailed', req.params.coin_transaction_id],
                (err, coinTransactionUpdate) => {
                    langManager.checkLangWrapper(req, res, next, (dictionary) => {
                        res.render('badpay', Object.assign(
                            { layout: 'cabinet' },
                            require('./../views/badpay').pageElements(dictionary, {
                                currentUrl: '/badpay'
                            }
                            ),
                            getParamCabinet(dictionary, req, res, {
                                login: req.session.passport.user.username,
                                coins: String(customerCoinsSelect[0].customer_coins),
                                mainNav: { }
                            })
                        ))
                    }
                    )
                }
            )
            
        }
    )
})

router.get('/:lang/order-file-processing', (req, res, next) => {
    // SELECT DISTINCT data_value FROM condition_value WHERE data_name = 'vehicle type' AND service_type_id IN (SELECT service_type_id FROM service_type WHERE service_type_name = 'file treatment') AND condition_id_id IN (SELECT condition_id_id FROM condition_id WHERE condition_id_works = 1);
    db.run(
        'SELECT customer_coins FROM customer WHERE customer_id = ?',
        [req.session.passport.user.id],
        function (err, results) {
            if (err) { return next(err) }
            db.run(`SELECT DISTINCT data_value FROM condition_value WHERE data_name = 'vehicle type' AND service_type_id IN (SELECT service_type_id FROM service_type WHERE service_type_name = 'file treatment') AND condition_id_id IN (SELECT condition_id_id FROM condition_id WHERE condition_id_works = 1)`,
            [],
            (err, dataValueResults) => {
                if (err) { return next(err) }
                const vehicle_type = []
                dataValueResults.forEach(element => {
                    vehicle_type.push({
                        value: element.data_value
                    })
                });
                langManager.checkLangWrapper(req, res, next, (dictionary) => {
                    res.render('order-file-processing', Object.assign(
                        { layout: 'cabinet' },
                        require('./../views/order-file-processing').pageElements(dictionary, {
                            currentUrl: '/order-file-processing',
                            vehicle_type
                        }
                        ),
                        getParamCabinet(dictionary, req, res, {
                            login: req.session.passport.user.username,
                            coins: String(results[0].customer_coins),
                            mainNav: { classOrderFileProcessing: 'main-nav__link_currant' }
                        })
                    ))
                }
                )
            }
            )
            
        }
    )
})
router.get('/:lang/history', (req, res, next) => { // это не готово
    db.run(
        // SELECT deal_payment.customer_order_id, customer.customer_coins, coin_transaction.coin_transaction_id, coin_transaction.coin_transaction_date, coin_transaction.coin_transaction_sum, coin_transaction.coin_transaction_status FROM coin_transaction INNER JOIN customer ON coin_transaction.customer_id = customer.customer_id INNER JOIN deal_payment ON deal_payment.coin_transaction_id = coin_transaction.coin_transaction_id WHERE customer.customer_id = ?
        ''
    )
})
router.post('/vehicle-type', (req, res, next) => {
    const messages = []
    const body = req.body
    let vehicleType = body.vehicle_type
    let paramType = body.vehicle_type
    const allMessages = [
        'didnt-choose-vehible-type'
    ]
    if (vehicleType === 'initial-state') messages.push('didnt-choose-vehible-type')
    if (messages.length) {
        setTimeout(() => { 
            res.json(JSON.stringify({
                itisgood: false,
                lang: req[projectSymbolName]['lang'],
                protocol,
                domen,
                port,
                messages,
                allMessages
            }))

        }  , 0 )
        // res.json(JSON.stringify({
        //     itisgood: false,
        //     lang: req[projectSymbolName]['lang'],
        //     protocol,
        //     domen,
        //     port,
        //     messages,
        //     allMessages
        // }))
    } else {
        db.run(
            `SELECT data_value FROM condition_value WHERE data_name = 'vehicle brand' AND service_type_id = (SELECT service_type_id FROM service_type WHERE service_type_name = 'file treatment') AND condition_id_id IN (SELECT condition_id_id FROM condition_value WHERE data_name = 'vehicle type' AND data_value = ?)`,
            vehicleType,
            (err, results) => {
                if (err) {return next(err)}

                setTimeout(() => {
                    res.json(JSON.stringify({
                        itisgood: true,
                        lang: req[projectSymbolName]['lang'],
                        protocol,
                        domen, 
                        port,
                        messages,
                        allMessages,
                        results,
                        page: 'vehicle'
                    }))
                }, 0)
                // res.json(JSON.stringify({
                //     itisgood: true,
                //     lang: req[projectSymbolName]['lang'],
                //     protocol,
                //     domen, 
                //     port,
                //     messages,
                //     allMessages,
                //     results,
                //     page: 'vehicle'
                // }))
            }
        )
    }
})
router.post('/vehicle-brand', (req, res, next) => {
    const messages = []
    const body = req.body
    let paramBrand = body.vehicle_brand
    let paramType = body.vehicle_type
    const allMessages = [
        'didnt-choose-vehible-brand'
    ]
    if (paramBrand === 'initial-state') messages.push('didnt-choose-vehible-brand')
    if (messages.length) {
        setTimeout(() => { 
            res.json(JSON.stringify({
                itisgood: false,
                lang: req[projectSymbolName]['lang'],
                protocol,
                domen,
                port,
                messages,
                allMessages
            }))

        }  , 0 )
        // res.json(JSON.stringify({
        //     itisgood: false,
        //     lang: req[projectSymbolName]['lang'],
        //     protocol,
        //     domen,
        //     port,
        //     messages,
        //     allMessages
        // }))
    } else {
        
        db.run(
            `SELECT DISTINCT data_value FROM condition_value WHERE data_name = 'vehicle model' AND service_type_id = (SELECT service_type_id FROM service_type WHERE service_type_name = 'file treatment') AND condition_id_id IN (SELECT condition_id_id FROM condition_value WHERE  data_name = 'vehicle brand' AND data_value = ? AND condition_id_id IN (SELECT condition_id_id FROM condition_value WHERE data_name = 'vehicle type' AND data_value = ?))`,
            [paramBrand, paramType],
            (err, results) => {
                if (err) {return next(err)}
                setTimeout(() => {
                    res.json(JSON.stringify({
                        itisgood: true,
                        lang: req[projectSymbolName]['lang'],
                        protocol,
                        domen, 
                        port,
                        messages,
                        allMessages: allMessages,
                        results,
                        page: 'brand'
                    }))
                }, 0)
                // res.json(JSON.stringify({
                //     itisgood: true,
                //     lang: req[projectSymbolName]['lang'],
                //     protocol,
                //     domen, 
                //     port,
                //     messages,
                //     allMessages,
                //     results,
                //     page: 'vehicle'
                // }))
            }
        )
    }
})
router.post('/vehicle-model', (req, res, next) => {
    const messages = []
    const body = req.body
    let paramBrand = body.vehicle_brand
    let paramModel = body.vehicle_model
    let paramType = body.vehicle_type
    const allMessages = [
        'didnt-choose-vehible-model'
    ]
    if (paramModel === 'initial-state') messages.push('didnt-choose-vehible-model')
    if (messages.length) {
        setTimeout(() => { 
            res.json(JSON.stringify({
                itisgood: false,
                lang: req[projectSymbolName]['lang'],
                protocol,
                domen,
                port,
                messages,
                allMessages
            }))

        }  , 0 )
        // res.json(JSON.stringify({
        //     itisgood: false,
        //     lang: req[projectSymbolName]['lang'],
        //     protocol,
        //     domen,
        //     port,
        //     messages,
        //     allMessages
        // }))
    } else {
        // SELECT data_value FROM condition_value WHERE data_name = 'ecu' AND service_type_id = (SELECT service_type_id FROM service_type WHERE service_type_name = 'file treatment') AND condition_id_id IN (SELECT condition_id_id FROM condition_value WHERE data_name = 'vehicle model' AND data_value = ?)
        db.run(
            `SELECT DISTINCT data_value FROM condition_value WHERE data_name = 'ecu' AND service_type_id IN (SELECT service_type_id FROM service_type WHERE service_type_name = 'file treatment') AND condition_id_id IN (SELECT condition_id_id FROM condition_value WHERE data_name = 'vehicle model' AND data_value = ? AND condition_id_id IN (SELECT condition_id_id FROM condition_value WHERE data_name = 'vehicle brand' AND data_value = ? AND condition_id_id IN (SELECT condition_id_id FROM condition_value WHERE data_name = 'vehicle type' AND data_value = ?)));`,
            [paramModel, paramBrand, paramType],
            (err, results) => {
                if (err) {return next(err)}

                setTimeout(() => {
                    res.json(JSON.stringify({
                        itisgood: true,
                        lang: req[projectSymbolName]['lang'],
                        protocol,
                        domen, 
                        port,
                        messages,
                        allMessages,
                        results,
                        page: 'model'
                    }))
                }, 0)
                // res.json(JSON.stringify({
                //     itisgood: true,
                //     lang: req[projectSymbolName]['lang'],
                //     protocol,
                //     domen, 
                //     port,
                //     messages,
                //     allMessages,
                //     results,
                //     page: 'vehicle'
                // }))
            }
        )
    }
})
router.post('/ecu', (req, res, next) => {
    const messages = []
    const body = req.body
    // body: {
    //     vehicle_model: 'x6',
    //     vehicle_brand: 'bmw',
    //     vehicle_type: 'truck',
    //     ecu: 'x6forTruck'
    //   }
    let paramBrand = body.vehicle_brand
    let paramModel = body.vehicle_model
    let paramType = body.vehicle_type
    let paramECU = body.ecu
    const allMessages = [
        'didnt-choose-vehible-ecu'
    ]
    if (paramECU === 'initial-state' || !paramECU ) messages.push('didnt-choose-vehible-ecu')
    if (messages.length) {
        setTimeout(() => { 
            res.json(JSON.stringify({
                itisgood: false,
                lang: req[projectSymbolName]['lang'],
                protocol,
                domen,
                port,
                messages,
                allMessages
            }))

        }  , 2000 )
        // res.json(JSON.stringify({
        //     itisgood: false,
        //     lang: req[projectSymbolName]['lang'],
        //     protocol,
        //     domen,
        //     port,
        //     messages,
        //     allMessages
        // }))
    } else {
        db.run(
            `SELECT 
            cs.condition_service_price, 
            s.service_name
            FROM
            condition_service AS cs
            INNER JOIN
            service AS s
            ON s.service_id = cs.service_id
            WHERE
            condition_id_id =
            (SELECT 
            condition_id_id
            FROM
            condition_value
            WHERE
            data_name = 'ecu'
            AND
            data_value = ?
            AND
            condition_id_id
            IN
            (SELECT 
            condition_id_id 
            FROM 
            condition_value 
            WHERE 
            data_name = 'vehicle model' 
            AND 
            data_value = ?
            AND 
            condition_id_id 
            IN 
            (SELECT 
            condition_id_id 
            FROM 
            condition_value 
            WHERE 
            data_name = 'vehicle brand' 
            AND 
            data_value = ?
            AND 
            condition_id_id 
            IN 
            (SELECT 
            condition_id_id 
            FROM 
            condition_value 
            WHERE 
            data_name = 'vehicle type' 
            AND 
            data_value = ?))) ORDER BY condition_id_id DESC LIMIT 1);`,
            [paramECU, paramModel, paramBrand, paramType],
            (err, price) => {
                if (err) {return next(err)}
                db.run(
                    `SELECT constant_value_value FROM constant_value WHERE constant_value_name = 'reading device'`,
                    [],
                    (err, readingDevice) => {
                        if (err) return next(err)
                        let results = {
                            price,
                            readingDevice
                        }
                        setTimeout(() => {
                            res.json(JSON.stringify({
                                itisgood: true,
                                lang: req[projectSymbolName]['lang'],
                                protocol,
                                domen, 
                                port,
                                messages,
                                allMessages,
                                results,
                                page: 'ecu'
                            }))
                        }, 2000)
                        // res.json(JSON.stringify({
                        //     itisgood: true,
                        //     lang: req[projectSymbolName]['lang'],
                        //     protocol,
                        //     domen, 
                        //     port,
                        //     messages,
                        //     allMessages,
                        //     results,
                        //     page: 'vehicle'
                        // }))
                    }
                )
                
            }
        )
    }
})
router.post('/upload', (req, res, next) => {
    const messages = []
    const allMessages = [
        'didnt-choose-reading-device', 
        'didnt-choose-services', 
        'something-wrong-plata-vehicle', 
        'something-wrong-vin']
    const form = new multiparty.Form()
    form.parse(req, (err, fields, files) => {
        if(err) return res.status(500).send({ error: err.message })

        const servArr = (()=>{
            const arr = []
            if (fields.services_number) {
                for (let i = 0; i <= fields.services_number; i++) {
                    if (fields['serv_' + i]) arr.push('serv_' + i)
                }
            }
            return arr
        })()
        if ((()=> { // данная функция нужна для того, чтобы убедиться, что со стороны клиента не приходит ничего странного
                const allInputs = Object.assign(['vehicle_type', 'vehicle_brand', 'vehicle_model', 'ecu', 'checksum', 'services_number', 'plate_vehicle', 'reading_device', 'vin', 'total_sum', 'comment'] /* в данном массиве хранятся имена полей, которые должны быть полюбому и если их нет, то значит что-то очень станное типа взлома */
                , servArr)
                console.log(files)
                for (let elem of allInputs) {
                    if (fields[elem] === undefined) {
                        return true
                    }
                }
                if (files.original_file === undefined) return true // такое возможно только если будет что-то "странное" со стороны клиента
                if (files.original_file[0] === undefined) return true // такое возможно только если будет что-то "странное" со стороны клиента
                return false
            })()) {
            return next()
        }
        const file = files.original_file[0]
        const filePath = file.path;
        const fileContent = fs.readFileSync(filePath);
        // if (!checkSum(fileContent, fields.checksum[0])) return res.redirect(303, '/wrong') // здесь нужно перенаправить на страничку, типо ошибка при пересылке файла
        const customerId = (req.session?.passport?.user) ? req.session.passport.user.id : null
        if (!customerId) return next()
            if (fields.reading_device[0] == 'initial-state') messages.push('didnt-choose-reading-device')
            if (fields.total_sum[0] <= 0 || !servArr.length) messages.push('didnt-choose-services')
            if (fields.plate_vehicle[0]?.length > 45) messages.push('something-wrong-plata-vehicle') // вот это нужно исправить, здесь должно быть регулярное выражение в условии
            if (fields.vin[0]?.length > 45) messages.push('something-wrong-vin') // вот это нужно исправить, здесь должно быть регулярное выражение в условии
            if (messages.length) {
                setTimeout(() => { 
                    res.json(JSON.stringify({
                        itisgood: false,
                        lang: req[projectSymbolName]['lang'],
                        protocol,
                        domen,
                        port,
                        messages,
                        allMessages
                    }))
        
                }  , 0 )
            } else {
                const date = Number(new Date())
                req.session.passport.user.id
                db.run(
                    `INSERT INTO customer_order (
                        customer_id, 
                        service_type_id, 
                        customer_order_amount, 
                        customer_order_date, 
                        customer_order_status
                        ) VALUES 
                        (?, (SELECT service_type_id FROM service_type WHERE service_type_name = ?), ?, ?, ?)`,
                        [req.session.passport.user.id, 'file treatment', Number(fields.total_sum[0]), date, 'unpaid'],
                        (err, customerOrderBackVal) => {
                            if (err) return next(err)
                            const customerOrderId = customerOrderBackVal.insertId
                            let sqlOrderDataRequest = `INSERT INTO customer_order_data (
                                customer_order_id, 
                                customer_order_data_name, 
                                customer_order_data_value
                                ) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?) `
                            let sqlArrData = [  customerOrderId, 'vehicle_type', fields.vehicle_type[0], 
                                                customerOrderId, 'vehicle_brand', fields.vehicle_brand[0], 
                                                customerOrderId, 'vehicle_model', fields.vehicle_model[0],
                                                customerOrderId, 'ecu', fields.ecu[0],
                                                customerOrderId, 'reading_device', fields.reading_device[0]
                                            ]
                            if (fields.plate_vehicle[0]) {
                                sqlOrderDataRequest += `, (?, ?, ?)`
                                sqlArrData.push(customerOrderId, 'plate_vehicle', fields.plate_vehicle[0])
                            }
                            if (fields.vin[0]) {
                                sqlOrderDataRequest += `, (?, ?, ?)`
                                sqlArrData.push(customerOrderId, 'vin', fields.vin[0])
                            }
                            console.log('это запрос ', sqlOrderDataRequest)
                            console.log('это массив с данными', sqlArrData)
                            db.run(sqlOrderDataRequest, sqlArrData, (err, customerOrederDataIds) => {
                                console.log('это сразу перед ошибкой при вводе customer_order_data')
                                if (err) return next(err)
                                console.log('это сразу полсле внесения в customer_order_data')
                                let servIndex = 1
                                const sqlArrDataServ = []
                                let valueServ
                                let sqlArrServRequest = `INSERT INTO customer_order_service (customer_order_id, service_name) VALUES `
                                
                                for ( valueServ of servArr ) {
                                    if (servIndex != 1) sqlArrServRequest += ', '
                                    sqlArrServRequest += '(?, ?)'
                                    sqlArrDataServ.push(customerOrderId, fields[valueServ][0])
                                    servIndex++
                                }
                                console.log('запрос ', sqlArrServRequest)
                                console.log('массив ', sqlArrDataServ)
                                db.run(sqlArrServRequest, sqlArrDataServ, (err, customerOrderServiceIds) => {
                                    if (err) return next()
                                    console.log('Это сразу после customer_order_service')
                                    db.run(`INSERT INTO change_order_status_provider (change_order_status_date, change_order_status_status, provider_id, customer_order_id) VALUES (?, ?, ?, ?)`,
                                    [date, 'unpaid', 0, customerOrderId], (err, changeOrederStatusProvider) => {
                                        if (err) throw err
                                        db.run(`INSERT INTO change_provider (customer_order_id, provider_id, change_provider_date, customer_order_status) VALUES (?, ?, ?, ?)`
                                        [customerOrderId, 0, date, 'unpaid'], (err, changeProvider) => {
                                            if (err) throw err
                                            db.run(
                                                `INSERT INTO file (customer_order_id, file_date, file_what_file, file_checksum, file_file) VALUES (?, ?, ?, ?, ?)`,
                                                [customerOrderId, date, 'notTreatmentedFile', fields.checksum[0], fileContent],
                                                function (err, row) {
                                                    if (err) throw err
                                                    console.log('Это после file')
                                                    if (!row) return next()
                                                    if (fields.comment[0]) {
                                                            db.run(`INSERT INTO message (
                                                                customer_order_id, 
                                                                message_content, 
                                                                message_from, 
                                                                message_date, 
                                                                message_seen
                                                                ) VALUES 
                                                                (?, ?, ?, ?, ?)`, 
                                                                [customerOrderId, fields.comment[0], 'customer', date, 0],
                                                                (err, messageId) => {
                                                                    if (err) return next()
                                                                    console.log('это после message')
                                                                    setTimeout(() => {
                                                                        res.json(JSON.stringify({
                                                                            itisgood: true,
                                                                            lang: req[projectSymbolName]['lang'],
                                                                            protocol,
                                                                            domen, 
                                                                            port,
                                                                            messages,
                                                                            allMessages,
                                                                            customerOrderId,
                                                                            page: 'upload'
                                                                        }))
                                                                    }, 2000)
                                                                }
                                                            )
                                                    } else {
                                                        setTimeout(() => {
                                                            console.log('это отработка последнего запроса')
                                                            res.json(JSON.stringify({
                                                                itisgood: true,
                                                                lang: req[projectSymbolName]['lang'],
                                                                protocol,
                                                                domen, 
                                                                port,
                                                                messages,
                                                                allMessages,
                                                                // results,
                                                                customerOrderId,
                                                                page: 'upload'
                                                            }))
                                                        }, 2000)
                                                    }
                                                });
                                        })
                                    })
                                                    
                                    
                                        // })
                                    // })
                                    // router.get('/fileIsGet', (req, res, next) => {
                                    //     res.send('file is get') // это заглушка
                                    // })
                                    // if (body.comment) {
                                    //     db.run(`INSERT INTO message (
                                    //         customer_order_id, 
                                    //         message_content, 
                                    //         message_from, 
                                    //         message_date, 
                                    //         message_seen
                                    //         ) VALUES 
                                    //         (?, ?, ?, ?, ?)`, 
                                    //         [customerOrderId, body.comment, 'customer', date, 0],
                                    //         (err, messageId) => {
                                    //             if (err) return next()
                                    //         }
                                    //     )
                                    // }
                                })
                            })
                        }
                )
            }
        })
    
    

}) 

router.get('/:lang/deal/:customerOrderId', (req, res, next) => {
    db.run(`SELECT customer_coins FROM customer WHERE customer_id = ?`,
        [req.session.passport.user.id],
        (err, cusotomerCoins) => {
            if (err) throw err
            db.run(
                `SELECT customer_order_status, customer_order_date, customer_order_id, customer_order_amount FROM customer_order WHERE customer_order_id = ?`,
                [req.params.customerOrderId],
                (err, orderStatus) => {
                    if (err) throw err
                    db.run(
                        `SELECT customer_order_data_name, customer_order_data_value FROM customer_order_data WHERE customer_order_id = ?`,
                        [req.params.customerOrderId],
                        (err, orderData) => {
                            if (err) throw err
                            db.run(
                                `SELECT service_name FROM customer_order_service WHERE customer_order_id = ?`,
                                [req.params.customerOrderId],
                                (err, serviceName) => {
                                    if (err) throw err
                                    db.run(
                                        `SELECT message_content, message_from, message_date, message_seen FROM message WHERE customer_order_id = ?`,
                                        [req.params.customerOrderId],
                                        (err, messages) => {
                                            if (err) throw err
                                            // console.log('orderStatus')
                                            // console.log(orderStatus)
                                            // console.log('orderData')
                                            // console.log(orderData)
                                            // console.log('serviceName')
                                            // console.log(serviceName)
                                            // console.log('messages')
                                            // console.log(messages)
                                            const enoughtMoney = (cusotomerCoins[0].customer_coins >= orderStatus[0].customer_order_amount) ? true : false
                                           
                                            const showPayButton = enoughtMoney && (orderStatus[0].customer_order_status == 'unpaid')
                                            
                                            const showNoEnoughtMoney = !enoughtMoney && (orderStatus[0].customer_order_status == 'unpaid')
                                            const showDownloadFileLink = orderStatus[0].customer_order_status == 'done'
                                            langManager.checkLangWrapper(req, res, next, (dictionary) => {
                                                // orderStatus[0].customer_order_date = Intl.DateTimeFormat("en-US").format(new Date(orderStatus[0].customer_order_date))
                                                res.render('deal', Object.assign(
                                                    { layout: 'cabinet' },
                                                    require('./../views/deal').pageElements(dictionary, {
                                                        currentUrl: '/deal/' + req.params.customerOrderId,
                                                        orderStatus,
                                                        orderData,
                                                        serviceName,
                                                        messages,
                                                        showPayButton,
                                                        showNoEnoughtMoney,
                                                        showDownloadFileLink
                                                    }
                                                    ),
                                                    getParamCabinet(dictionary, req, res, {
                                                        login: req.session.passport.user.username,
                                                        coins: String(cusotomerCoins[0].customer_coins),
                                                        mainNav: { }
                                                    })
                                                ))
                                            }
                                            )
                                        }
                                    )
                                }
                            )
                        }
                    )
                }
            )
        }
    )
})
router.post('/paydeal', (req, res, next) => {
const body = req.body
const sum = body.sum    
const orderId = body.orderId
const date = new Date()
db.run(
    `INSERT INTO coin_transaction (customer_id, coin_transaction_date, coin_transaction_sum, coin_transaction_status) VALUES (?, ?, ?, ?)`,
    [req.session.passport.user.id, Number(date), -sum, 'downCoins'], // downCoins -- это поставил сейчас, ранее было по другому, возможно ошибка либо сдесь либо там
    (err, coinTransactionId) => {
        // console.log(coinTransactionIdArr) 
        // OkPacket {
        //     fieldCount: 0,
        //     affectedRows: 1,
        //     insertId: 4,
        //     serverStatus: 2,
        //     warningCount: 0,
        //     message: '',
        //     protocol41: true,
        //     changedRows: 0
        //   }
        if (err) throw err
        db.run(
            `INSERT INTO deal_payment (coin_transaction_id, customer_order_id) VALUES (?, ?)
            `, [coinTransactionId.insertId, orderId],
            (err, dealPaymentId) => {
                if (err) throw err
                db.run(
                    `UPDATE customer SET customer_coins = customer_coins + ? WHERE customer_id = ?;`, // "UPDATE customer_order SET customer_order_status = 'paid', customer_order_pay_date = ? WHERE customer_order_id = ?",
                    [-sum, req.session.passport.user.id],
                    (err, customerIdArr) => {
                        if (err) throw err
                        db.run(
                            `UPDATE customer_order SET customer_order_status = 'paid', customer_order_pay_date = ? WHERE customer_order_id = ?`,
                            [Number(date), orderId],
                            (err, customerOrderArr) => {
                                if (err) throw err
                                db.run(`SELECT customer_coins FROM customer WHERE customer_id = ?`,
                                [req.session.passport.user.id],
                                (err, customerCoinsArr) => {
                                    setTimeout(() => { 
                                        res.json(JSON.stringify({
                                            paid: true,
                                            lang: req[projectSymbolName]['lang'],
                                            protocol,
                                            domen,
                                            port,
                                            coins: customerCoinsArr[0].customer_coins
                                        }))
                            
                                    }  , 2000 )
                                }
                                )
                            }
                        )
                        
                    } 
                )
            }

        )  

    }
)
})
router.post('/sendcomment', (req, res, next) => {
    const body = req.body
    const comment = body.comment
    const orderId = body.orderId
    
    const date = new Date()
    if (comment) {
        db.run(`INSERT INTO message (
            customer_order_id, 
            message_content, 
            message_from, 
            message_date, 
            message_seen
            ) VALUES 
            (?, ?, ?, ?, ?)`, 
            [orderId, comment, 'customer', Number(date), 0],
            (err, messageId) => {
                if (err) return next()
                setTimeout(() => {
                    res.json(JSON.stringify({
                        itisgood: true,
                        lang: req[projectSymbolName]['lang'],
                        protocol,
                        domen, 
                        port,
                        orderId,
                        page: 'sendcomment'
                    }))
                }, 2000)
            }
        )
    } else {
        setTimeout(() => {
            res.json(JSON.stringify({
                itisgood: true,
                lang: req[projectSymbolName]['lang'],
                protocol,
                domen, 
                port,
                orderId,
                page: 'sendcomment'
            }))
        }, 2000)
    }
})
router.get('/:lang/deals', (req, res, next) => {
    // SELECT c.customer_coins, co.customer_order_status, co.customer_order_date, co.customer_order_id, co.customer_order_amount FROM customer_order AS co INNER JOIN customer AS c ON c.customer_id = co.customer_id WHERE c.customer_id = 1; 
    db.run(
        'SELECT c.customer_coins, co.customer_order_status, co.customer_order_date, co.customer_order_id, co.customer_order_amount FROM customer_order AS co INNER JOIN customer AS c ON c.customer_id = co.customer_id WHERE c.customer_id = ? ORDER BY co.customer_order_date DESC',
        [req.session.passport.user.id],
        (err, results) => {
            if (err) throw err
            langManager.checkLangWrapper(req, res, next, (dictionary) => {
                results.forEach(elem => {
                    elem.customer_order_date = Intl.DateTimeFormat("en-US").format(new Date(elem.customer_order_date))
                })
                res.render('deals', Object.assign(
                    { layout: 'cabinet' },
                    require('./../views/deals').pageElements(dictionary, {
                        currentUrl: '/deals',
                        dealDataArr: results
                    }
                    ),
                    getParamCabinet(dictionary, req, res, {
                        login: req.session.passport.user.username,
                        coins: String(results[0].customer_coins),
                        mainNav: { classDeals: 'main-nav__link_currant' }
                    })
                ))
            }
            )
        }
    )
})
router.get('/:lang/payment-history', (req, res, next) => {
    db.run(`SELECT customer_coins FROM customer WHERE customer_id = ?`,
        [req.session.passport.user.id],
        (err, customerCoins) => {
            if (err) throw err
            db.run(
                // SELECT 
                // deal_payment.customer_order_id, 
                // coin_transaction.coin_transaction_id, 
                // coin_transaction.coin_transaction_date, 
                // coin_transaction.coin_transaction_sum, 
                // coin_transaction.coin_transaction_status 
                // FROM 
                // coin_transaction 
                // INNER JOIN 
                // deal_payment
                // ON
                // coin_transaction.coin_transaction_id = deal_payment.coin_transaction_id
                // WHERE customer_id = ? AND (coin_transaction_status = 'PaySystemOK' OR coin_transaction_status = 'downCoins')
                `SELECT 
                coin_transaction.coin_transaction_id, 
                coin_transaction.coin_transaction_date, 
                coin_transaction.coin_transaction_sum, 
                coin_transaction.coin_transaction_status 
                FROM 
                coin_transaction
                WHERE customer_id = ? AND (coin_transaction_status = 'PaySystemOK' OR coin_transaction_status = 'downCoins')
                `,
                [req.session.passport.user.id],
                (err, resultsArr) => {
                    if (err) throw err
                    langManager.checkLangWrapper(req, res, next, (dictionary) => {
                        // console.log(resultsArr)
                        // [
                        //     RowDataPacket {
                        //       customer_order_id: 1,
                        //       coin_transaction_id: 3,
                        //       coin_transaction_date: 1686659367754,
                        //       coin_transaction_sum: -720,
                        //       coin_transaction_status: 'downCoins'
                        //     }
                        //   ]
                          
                        // console.log(resultsArr[0].coin_transaction_date)
                        resultsArr.forEach(elem => {
                            elem.coin_transaction_date = Intl.DateTimeFormat("en-US").format(new Date(elem.coin_transaction_date))
                        })
                        console.log(resultsArr)
                        res.render('payment-history', Object.assign(
                            { layout: 'cabinet' },
                            require('./../views/payment-history').pageElements(dictionary, {
                                currentUrl: '/payment-history',
                                dealDataArr: resultsArr
                            }
                            ),
                            getParamCabinet(dictionary, req, res, {
                                login: req.session.passport.user.username,
                                coins: String(customerCoins[0].customer_coins),
                                mainNav: { classPaymentHistory: 'main-nav__link_currant' }
                            })
                        ))
                    }
                    )
                }
            )
        }
    )
})
router.get('/:lang/cabinet', (req, res, next) => {
    langManager.checkLangWrapper(req, res, next, (dictionary) => {
        checkAccountAccess(req, res, dictionary, (res, req, dictionary) => {
            res.render('cabinet', Object.assign(
                require('./../views/cabinet').pageElements(dictionary, {
                    currentUrl: '/cabinet',
                    customer: req.session.passport.user.username
                }
                ),
                getParamMain(dictionary, req, res, { mainNav: {} })
            )
            )
        }
        )
    }
    )
})

router.get('/:lang/file', (req, res, next) => {
    langManager.checkLangWrapper(req, res, next, (dictionary) => {
        checkAccountAccess(req, res, dictionary, (res, req, dictionary) => {
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
        if (err) throw err
        const file = files.file[0];
        const filePath = file.path;
        const fileContent = fs.readFileSync(filePath);
        if (!checkSum(fileContent, fields.checksum)) return res.redirect(303, '/somethingwrong')
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
router.get('/check', function (req, res, next) {
    res.render('check')
})
router.post('/check', function (req, res, next) {
    res.send('some ' + req.body.name)
});
module.exports = router;