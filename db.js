const mysql = require('mysql')
const db = {
    run(query, paramArr, fun) { // запрос должен быть выполнен в виде строки с интерполяцией переменных в виде элементов массива paramArr
        const innerFun = function (err, rows, fields) {
            fun(err, rows)
        }
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'admin_simple',
            password: 'Baron_15',
            database: 'simple'
        })
        connection.connect()
        connection.query(query, paramArr, innerFun)
        connection.end()
    }
}
module.exports = db;