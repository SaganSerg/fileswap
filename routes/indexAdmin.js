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

router.get('/', (req, res, next) => {
        res.render('index-admin', { layout: 'mainAdmin' })
    })
    
// router.post('/admin', (req, res, next) => {
//     const body = req.body
//     const login = body.login
//     const pass = body.pass
//     db.run(`
//         SELECT provider_id FROM provider WHERE provider_login = ? AND provider_password = ?   
//     `, [login, pass],
//         (err, checkPassArr) => {
//             if (err) throw err
//             if (checkPassArr[0].length) return res.redirect(303, '/')
//             return res.redirect(303, '/admin/' + checkPassArr[0].provider_id)
//         })
// })
    
router.get('/admin/:providerId', (req, res, next) => {
    if (!req?.session?.passport?.user?.id) return res.render('index-admin', { layout: 'mainAdmin' })
    // const body = req.body
    // const login = body.login
    // const pass = body.pass
    // db.run(`
    //     SELECT provider_id FROM provider WHERE provider_login = ? AND provider_password = ?   
    // `, [login, pass],
    // (err, checkPassArr) => {
    //     if (err) throw err
    //     if (checkPassArr[0].length) return res.redirect(303, '/')
    const providerId = req.params.providerId
    db.run(
        `SELECT * FROM customer_order WHERE customer_order_status = 'unpaid' AND provider_id IS NULL ORDER BY customer_order_date`, [],
        (err, customerOrdersUnpaidArr) => {
            if (err) throw err
            db.run(`
                SELECT * FROM customer_order WHERE customer_order_status = 'paid' AND provider_id IS NULL ORDER BY customer_order_date
                `, [],
                (err, customerOrdersPaidArr) => {
                    if (err) throw err
                    db.run(`
                    SELECT DISTINCT customer_order_id FROM message WHERE message_seen = 0
                    `, [],
                        (err, notSeenMessagesArr) => {
                            if (err) throw err
                            db.run(`
                        SELECT * FROM customer_order WHERE provider_id IS NULL ORDER BY customer_order_date
                        `, [],
                                (err, customerOrderProviderWithoutArr) => {
                                    if (err) throw err
                                    const notMessageSeenDealsProviderWithout = []
                                    for (let id of notSeenMessagesArr) {
                                        for (let order of customerOrderProviderWithoutArr) {
                                            if (id['customer_order_id'] == order['customer_order_id']) {
                                                notMessageSeenDealsProviderWithout.push(order)
                                            }
                                        }
                                    }
                                    db.run(
                                        `SELECT * FROM customer_order WHERE customer_order_status = 'unpaid' AND provider_id = ? ORDER BY customer_order_date`,
                                        [providerId],
                                        (err, customerOrderUpaidWithProvider) => {
                                            if (err) throw err
                                            db.run(`
                                    SELECT * FROM customer_order WHERE customer_order_status = 'paid' AND provider_id = ? ORDER BY customer_order_date
                                    `, [providerId],
                                                (err, customerOrderPaidWithPrivider) => {
                                                    if (err) throw err
                                                    db.run(`
                                        SELECT DISTINCT customer_order_id FROM message WHERE message_seen = 0
                                        `, [],
                                                        (err, notSeenMessageWithProviderCustomerOrderId) => {
                                                            if (err) throw err
                                                            db.run(`
                                            SELECT * FROM customer_order WHERE provider_id = ? ORDER BY customer_order_date
                                            `, [providerId],
                                                                (err, customerOrderWithProvider) => {
                                                                    const notMessageSeenDealsProviderWith = []
                                                                    for (let id of notSeenMessageWithProviderCustomerOrderId) {
                                                                        for (let order of customerOrderWithProvider) {
                                                                            if (id['customer_order_id'] == order['customer_order_id']) {
                                                                                notMessageSeenDealsProviderWith.push(order)
                                                                            }
                                                                        }
                                                                    }
                                                                    db.run(`
                                                SELECT * FROM customer_order WHERE customer_order_status = 'being_done' AND provider_id = ? ORDER BY customer_order_date
                                                `, [providerId],
                                                                        (err, beingDoneDealsProviderWith) => {
                                                                            res.render('admin-admin', {
                                                                                layout: 'cabinetAdmin',
                                                                                customerOrdersUnpaidArr,
                                                                                customerOrdersPaidArr,
                                                                                notMessageSeenDealsProviderWithout,
                                                                                customerOrderUpaidWithProvider,
                                                                                customerOrderPaidWithPrivider,
                                                                                notMessageSeenDealsProviderWith,
                                                                                beingDoneDealsProviderWith,
                                                                                providerId,
                                                                                providerName: req?.session?.passport?.user?.username
                                                                            })
                                                                        })
                                                                })
                                                        })
                                                })
                                        }
                                    )
                                })
                        })
                })
        }
    )

    // }
    // )
})
    // admin.get('/proverka', (req, res, next) => {
    //     res.send('Добро пожаловать, администратор! Proverka!')
    // })
router.get('/deal/:prividerId/:customerOrderId', (req, res, next) => {
    if (!req?.session?.passport?.user?.id) return res.render('index-admin', { layout: 'mainAdmin' })
    const customerOrderId = req.params.customerOrderId
    const providerId = req.params.prividerId
    console.log(customerOrderId, 'customerOrderId')
    console.log(providerId, 'providerId')
    db.run(`
SELECT customer_id, customer_email, customer_telephone, customer_valuta, customer_registration_date, customer_coins FROM customer WHERE customer_id = (SELECT customer_id FROM customer_order WHERE customer_order_id = ?)
`, [customerOrderId], (err, customerArr) => {
        if (err) throw err
        customerArr[0].customer_registration_date = Intl.DateTimeFormat("en-US").format(new Date(customerArr[0].customer_registration_date))
        db.run(
            `SELECT * FROM customer_order WHERE customer_order_id = ?
        `, [customerOrderId], (err, customerOrderArr) => {
            if (err) throw err
            customerOrderArr[0].customer_order_date = Intl.DateTimeFormat("en-US").format(new Date(customerOrderArr[0].customer_order_date))
            db.run(`
            SELECT * FROM customer_order_data WHERE customer_order_id = ?
            `, [customerOrderId], (err, customerOrderDataArr) => {
                if (err) throw err
                db.run(`
                SELECT * FROM customer_order_service WHERE customer_order_id = ?
                `, [customerOrderId], (err, customerOrderService) => {
                    if (err) throw err
                    console.log(customerOrderService)
                    db.run(`
                    SELECT * FROM message WHERE customer_order_id = ?
                    `, [customerOrderId], (err, message) => {
                        if (err) throw err
                        console.log(message)
                        message.forEach(elem => {
                            elem.message_date = Intl.DateTimeFormat("en-US").format(new Date(elem.message_date))
                            if (elem.message_from == 'customer' && elem.message_seen) elem.seen_form = true
                        })
                        res.render('deal-admin', {
                            layout: 'cabinetAdmin',
                            providerId,
                            customerOrderId,
                            customerArr: customerArr[0],
                            customerOrderArr: customerOrderArr[0],
                            customerOrderDataArr,
                            customerOrderService,
                            message,
                            providerName: req?.session?.passport?.user?.username
                        })
                    })
                })
            })
        }
        )
    })
    // res.render('deal-admin', {
    //     layout: null,
    // })
})
router.post('/makeDealMy', (req, res, next) => {
    if (!req?.session?.passport?.user?.id) return res.render('index-admin', { layout: 'mainAdmin' })
    const body = req.body
    const provider_id = body.provider_id
    const customer_order_id = body.customer_order_id
    db.run(`UPDATE customer_order SET provider_id = ? WHERE customer_order_id = ?`, [provider_id, customer_order_id], 
    (err, result) => {
        if (err) throw err
        res.redirect(303, '/deal/' + provider_id +'/' + customer_order_id)
    })
})
router.post('/messageSeen', (req, res, next) => {
    if (!req?.session?.passport?.user?.id) return res.render('index-admin', { layout: 'mainAdmin' })
    const body = req.body
    db.run(`
    UPDATE message SET message_seen = 1 WHERE message_id = ? 
    `, [body.message_id], (err, messageArr) => {
        if (err) throw err
        console.log(messageArr)
        res.redirect(303, '/deal/' + body.provider_id +'/' + body.customer_order_id)
    })
})
router.get('/deals/:id', (req, res, next) => {
    if (!req?.session?.passport?.user?.id) return res.render('index-admin', { layout: 'mainAdmin' })
    res.render('deals-admin', { layout: 'cabinetAdmin', providerId: req.params.id, providerName: req?.session?.passport?.user?.username })
})
router.post('/deals/:id', (req, res, next) => {
    if (!req?.session?.passport?.user?.id) return res.render('index-admin', { layout: 'mainAdmin' })
    const body = req.body
    let datestart = body.datestart
    let dateend = body.dateend
    let customer_id = Number(body.customer_id)
    let customer_order_status = body.customer_order_status
    const provider_id = Number(req.params.id)

    console.log(datestart, ' - datestart')
    console.log(dateend, ' - dateend')
    console.log(customer_id, ' - customer_id')
    console.log(customer_order_status, ' customer_order_status')
    console.log(typeof (customer_order_status), ' type of customer_order_status')



    if (!datestart) {
        datestart = 0
    } else {
        datestart = new Date(datestart).getTime()
    }
    if (!dateend) {
        dateend = 20000000000000 // 2603-10-11T11:33:20.000Z -- решил что такою дату можно указатьс в качестве максимальной
    } else {
        let date = new Date(dateend)
        date.setDate(date.getDate() + 1)
        dateend = new Date(dateend).getTime()
    }
    console.log(new Date(datestart), ' datestart parsered')
    console.log(new Date(dateend), ' dateend parsered')
    console.log(new Date(new Date(datestart).getTime()), ' datestart parsered back')
    console.log(new Date(new Date(dateend).getTime()), ' dateend parsered back')
    console.log(new Date((new Date()).getTime()))
    console.log(new Date(20000000000000))
    let request = `SELECT * FROM customer_order WHERE provider_id = ? AND customer_order_date >= ? AND customer_order_date <= ?`
    const requestArr = [provider_id, datestart, dateend]
    if (customer_id) {
        request += ' AND customer_id = ? '
        requestArr.push(customer_id)
    }
    if (customer_order_status?.length) {
        customer_order_status.forEach((elem, index) => {
            request += ' AND customer_order_status = ?  '
            requestArr.push(elem)
        })
    }
    console.log(request, 'request sql')
    console.log(requestArr)

    db.run(
        request, requestArr, (err, customerOrderArr) => {
            if (err) throw err
            customerOrderArr.forEach(elem => {
                // orderStatus[0].customer_order_date = Intl.DateTimeFormat("en-US").format(new Date(orderStatus[0].customer_order_date))
                elem.customer_order_date = Intl.DateTimeFormat("en-US").format(new Date(elem.customer_order_date))
            })
            res.render('deals-admin', {
                layout: null,
                customerOrderArr,
                provider_id,
                providerName: req?.session?.passport?.user?.username,
                providerId: provider_id
            })
        }
    )


})
router.get('/admin-download', (req, res, next) => {
    if (!req?.session?.passport?.user?.id) return res.render('index-admin', { layout: 'mainAdmin' })
    // const customerId = (req.session?.passport?.user) ? req.session.passport.user.id : null // надо будет потом включить
    const orderId = req.query.id
    // if (!customerId) return next() // потом включить
    if (!orderId) return next()
    db.run(
        `SELECT file_file FROM file WHERE customer_order_id = ? AND file_what_file = 'notTreatmentedFile' ORDER BY file_id DESC LIMIT 1)`,
        [orderId],
        (err, row) => {
            if (err) throw err;
            if (row.length > 1) return next()
            const file = row[0].file_file
            const filename = 'file_' + orderId;
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
    
router.post('/admin-upload', (req, res, next) => {
    if (!req?.session?.passport?.user?.id) return res.render('index-admin', { layout: 'mainAdmin' })
    const form = new multiparty.Form()
    form.parse(req, (err, fields, files) => {
        if (err) throw err
        // const file = files.original_file[0]
        // const filePath = file.path;
        // const fileContent = fs.readFileSync(filePath);
        const file = files.treatedfile[0];
        const filePath = file.path;
        const fileContent = fs.readFileSync(filePath);
        const date = Number(new Date())
        // if (!checkSum(fileContent, fields.checksum)) return res.redirect(303, '/somethingwrong')
        // const customerId = (req.session?.passport?.user) ? req.session.passport.user.id : null
        // if (!customerId) return next()
        db.run(
            `INSERT INTO file (customer_order_id, file_file, file_date, file_what_file, file_checksum) VALUES (?, ?, ?, ?, ?)`,
            [fields.customer_order_id, fileContent, date, 'treatmentedFile', fields.checksumtreatedfile],
            function (err, row) {
                if (err) throw err
                if (!row) return next()
                // res.redirect(303, '/fileIsGet')
                res.redirect(303, '/deal/' + fields.provider_id +'/' + fields.customer_order_id)
                
            });

    })
})
    // admin.get('/fileIsGet', (req, res, next) => {
    //     res.send('file is get') // это заглушка
    // })
router.post('/changestatus', (req, res, next) => {
    if (!req?.session?.passport?.user?.id) return res.render('index-admin', { layout: 'mainAdmin' })
    const body = req.body
    db.run(
        `UPDATE customer_order SET customer_order_status = ? WHERE customer_order_id = ?
        `, [body.customer_order_status, body.customer_order_id], (err, customerOrderArr) => {
            console.log(customerOrderArr)
            console.log('customerOrderArr')
            console.log(body.customer_order_status, 'body.customer_order_status')
            console.log(body.customer_order_id, 'body.customer_order_id')
            res.redirect(303, '/deal/' + body.provider_id +'/' + body.customer_order_id)
        }
    )

})
module.exports = router;