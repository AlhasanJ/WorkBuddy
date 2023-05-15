const mysql = require('mysql');
const bcrypt = require('bcrypt');

// Create a connection object
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jouhoune1',
    database: 'WorkBuddy',
  });
  
  // Connect to the database
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err);
    } else {
      console.log('Connected to database');
    }
  });

module.exports = function(app, appData) {

    // const redirectLogin = (req, res, next) => {
    //     if (!req.session.userId ) {
    //     res.redirect('./login')
    //     } else { next (); }
    //     } 

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', appData)
    });

    app.get('/contact-us', function (req,res) {
        res.render('contact-us.ejs', appData);                                                                     
    });  

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
        res.redirect('./login')
        } else { next (); }
        } 
        
    const { check, validationResult } = require('express-validator');

    // Handle our routes

    app.get('/register', function (req,res) {
        res.render('register.ejs', appData);                                                                     
    });                                                                                                 
   //outcome of when users press 'register'.                                                                          
   app.post('/registered', 
            [check('email').isEmail().normalizeEmail()], 
            [check('password').not().isEmpty().isLength({min: 8})],
            [check('username').not().isEmpty().isLength({min: 3})],
            // [check('firstname').exists().isLength({min: 3}).trim().escape()],
    function (req, res) {            
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./register'); }
        else {
    // saving data in database
    const saltRounds = 10;
    const plainPassword = req.body.password;   
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        // Store hashed password in your database.
        if (err) {
            return console.error(err.message);
        }
        //database query to insert the data entered by the user
        let sqlquery = "INSERT INTO users (username, firstname, lastname, email, hashedpassword) VALUES (?,?,?,?,?)";
        //stores the information to be placed into the database.
        let newrecord = 
            [req.sanitize(req.body.username), 
            req.sanitize(req.body.first), 
            req.sanitize(req.body.last),
            req.sanitize(req.body.email),
            hashedPassword];
        //database query to add the users details to the database except for their password as it would be unsafe to store their password but
        //having a hashed version of it instead.
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            else{
                console.log(result);
               // let newData = Object.assign({}, appData, {user:result});

                res.render('newaccount.ejs',appData);

            }
            // result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now  registered! We will send an email to you at ' + req.body.email;
            // result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
            // res.send(result);
            //outputs what the users have added in the form to register their account
        });
    });                                                                                
}});
    //login page
    app.get('/login', function (req,res) {
        res.render('login.ejs',appData);                                                                     
    });
    //outcome of what happens when the user presses 'login'
    app.post('/signedin', function (req,res) {
        // saving data in database*/
        let sqlquery = "select hashedPassword from users where username = '" + req.body.username + "'";
        //comparing passwords
        db.query(sqlquery,(err,result)=> {
            if(err) {
                // res.send('Username entered is incorrect');
                console.log("error")
                //will redirect the user to the homepage if the database cannot be found or queried
                res.redirect('./');
            }
            //if the entered username is not in the database and pulls and undefined hashedPassword then returns error to the console and displays
            //the username that is incorrect
            else if(result.length == 0) {
                console.log("Username is incorrect")
                // res.send('Hi '+ req.body.username + ' Username you have entered is incorrect')
                res.render('wrongusername.ejs', appData);
            }
            else{
                //hashedPassword get set to what the result was from the database
                let hashedPassword = result[0].hashedPassword;
                //compares the passwords with the hashedPassword
                bcrypt.compare(req.body.password,hashedPassword,function(err,result){
                    if(err) {
                        console.log("Not working " + hashedPassword);//errors with comparison
                        res.redirect('./');
                    }
                    //if the username and passwords match then will show that the user has logged in successfully
                    else if(result == true) {
                        console.log(req.body.username + " is logged in successfully" )// both username and password correct
                        // Save user session here, when login is successful
                        req.session.userId = req.body.username; 

                    //  res.send('Hi ' + req.body.username + ' is logged in'  )
                        res.render('signedin.ejs', appData)
                    }
                    //if username matches and the password does not then will ask the user to try again
                    else{
                            console.log("Incorrect password " + hashedPassword)//password incorrect
                    //         res.send('Password you have entered is incorrect' + ' ' + ' Please try again ')
                            res.render('wrongpassword.ejs', appData);
                    }
                });
            }
        });
    });

    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
            return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        });
        });
}