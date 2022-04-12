const express = require('express');
const router = express.Router();

const config = require('../config.js');
const sql = require('mysql');


router.use(express.json());
router.use(express.urlencoded({'extended':false}));


//this enables multiple conecction
let pool = sql.createPool({
    connectionLimit: 20,
    host : config.host,
    user : config.user,
    password: config.password,
    database: config.database,
    port: 3306
})



router.post('/signup', (req,res) => {
    console.log('hit add user route');

    let user = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err;

        let query = `INSERT INTO user(first_name, last_name, password, permissions, avatar) VALUES('${user.username}', 'test', '${user.password}', 2,'')`;

        connection.query(query, (err, result) => {
            connection.release();

            if (err) throw err;

            console.log(result);

            res.json({action: 'added'});
        })
    })

})

router.post('/getone',(req,res)=>{
    // console.log('hit the user route: the user is',req.body);

    pool.getConnection((err, connection) => {
        if (err) throw err;

        // get the user from the incoming route request (the data passed from the front end)
        let currentUser = req.body; 
            //create an object to store login attempt result (pass/fail)
            loginResult = {};

        let query = `SELECT first_name, password, permissions, avatar FROM user WHERE first_name='${currentUser.username}'`;

        // run a query, get some results (or an error)
        connection.query(query, function(error, user) {
            connection.release();

            if (error) throw error;
            // if the user doesnt exist, prompt to add
            if (!user[0]) {

                loginResult.action = 'add';

            } else if (user[0].password !== currentUser.password) {

                //password didn't match
                loginResult.field = 'password'; //tell the ui which field is wrong
                loginResult.action = 'retry';

            } else {

                //username and password are validated
                loginResult.action = 'authenticated';
                loginResult.user = {
                    first_name: user[0].first_name,
                    permissions: user[0].permissions,
                    avatar: user[0].avatar,
                }
                
            }

            
            res.json(loginResult);
        })
    })
})

router.get('/getall', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        // run a query, get some results (or an error)
        connection.query('SELECT * FROM user', function(error, results) {
            connection.release();

            if (error) throw error;

            results.forEach(result => {
                delete result.password;
                delete result.last_name;

                if (!result.avatar){
                    result.avatar = 'avatar.jpg';
                }
            })

            console.log(results);
            res.json(results);
        })
    })
})

module.exports = router;