/*********************************************************************************
* WEB322 – Assignment 5
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
* 
* Name: Thanh Hoang Phan Student ID: 101662229 Date: 11/18/2023
*
* Published URL: https://motionless-cap-eel.cyclic.app/
*
********************************************************************************/ 

const { render } = require('ejs');
const express = require('express'); 
const app = express();
const path = require('path');
const authData = require('./modules/auth-service');
const legoData = require("./modules/legoSets"); // this module includes all the functions to get set data
const clientSessions = require('client-sessions');

const HTTP_PORT = process.env.PORT || 3000; // assign a port

app.set('views', path.join(__dirname, 'views')); // connect to 'views' directory 
app.set('view engine', 'ejs'); // ejs 

app.use(express.static('public')); // connect 'public' directory
app.use(express.urlencoded({ extended: true })); // for using urlencoded form data
app.use(express.json());
app.use(
    clientSessions({
      cookieName: 'session', // this is the object name that will be added to 'req'
      secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', // this should be a long un-guessable string.
      duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
      activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
    })
);
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

const ensureLogin = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent'); 
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,// authenticated user's userName
            email: user.email,// authenticated user's email
            loginHistory: user.loginHistory// authenticated user's loginHistory
        };
        res.redirect('/lego/sets');
    }).catch(err => {
        res.render('login', { errorMessage: err, userName: req.body.userName })
    })
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', (req, res) => {
    authData.registerUser(req.body).then((user) => {
        res.render('register', {successMessage: "User created"})
    }).catch(err => {
        res.render('register', {errorMessage: err, userName: req.body.userName})
    })
})

app.get('/logout', ensureLogin, (req, res) => {
    req.session.reset();
    res.redirect('/');
})

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
})

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/about', (req, res) => {
    res.render('about');
})

// if the query of the route is empty, response all sets. Ortherwise, response a matching sets 
app.get('/lego/sets', async (req, res) => {
    try {
        const { theme } = req.query;
        let set;
        if(theme === undefined) 
            set = await legoData.getAllSets();
        else 
            set = await legoData.getSetsByTheme(theme);
        res.render('sets', { set });
    } catch (err) {
        res.status(404).render("404", {message: err});
    }
})

app.get('/lego/sets/:set_num', async (req, res) => {
    try {
        const { set_num } = req.params; 
        let set = await legoData.getSetByNum(set_num);
        res.render('show', { set });
    } catch(err) {
        res.status(404).render("404", {message: err});
    }
})

app.get('/lego/addSet', ensureLogin, async(req, res) => {
    try {
        let themeData = await legoData.getAllThemes();
        res.render("addSet", { themes: themeData });
    } catch(err) {
        res.status(404).render("404", {message: err});
    }
}) 

app.post('/lego/addSet', ensureLogin, async(req, res) => {
    try {
        const setData = req.body;
        await legoData.addSet(setData);
        res.redirect('/lego/sets');
    } catch(err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
}) 

app.get('/lego/editSet/:set_num', ensureLogin, async (req, res) => {
    try {
        const { set_num } = req.params; 
        let setData = await legoData.getSetByNum(set_num);
        let themeData = await legoData.getAllThemes();
        res.render('editSet', { set: setData, themes: themeData });
    } catch(err) {
        res.status(404).render("404", {message: err});
    }
}) 

app.post('/lego/editSet', ensureLogin, async(req, res) => {
    try{
        const set_num = req.body.set_num;
        const setData = req.body;
        await legoData.editSet(set_num, setData);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
})

app.get('/lego/deleteSet/:set_num', ensureLogin, async(req, res) => {
    try {
        let set_num = req.params; 
        await legoData.deleteSet(set_num);
        res.redirect('/lego/sets');
    } catch(err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
})

app.use((req, res, next) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for."});
});

legoData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("LISTEN TO PORT 3000!");
        })
    }).catch(err =>{
        console.log(`Unable to start sever: ${err}`)
    });
