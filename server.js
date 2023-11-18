/*********************************************************************************
* WEB322 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
* 
* Name: Thanh Hoang Phan Student ID: 101662229 Date: 10/11/2023
*
* Published URL: https://motionless-cap-eel.cyclic.app
*
********************************************************************************/ 

const { render } = require('ejs');
const express = require('express'); 
const app = express();
const path = require('path');
const { addListener } = require('process');
const legoData = require("./modules/legoSets"); // this module includes all the functions to get set data

const HTTP_PORT = process.env.PORT || 3000; // assign a port

app.set('views', path.join(__dirname, 'views')); // connect to 'views' directory 
app.set('view engine', 'ejs'); // ejs 
app.use(express.static('public')); // connect 'public' directory
app.use(express.urlencoded({ extended: true })); // for using urlencoded form data
// app.use(express.json());

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

app.get('/lego/addSet', async(req, res) => {
    try {
        let themeData = await legoData.getAllThemes();
        res.render("addSet", { themes: themeData });
    } catch(err) {
        res.status(404).render("404", {message: err});
    }
}) 

app.post('/lego/addSet', async(req, res) => {
    try {
        const setData = req.body;
        await legoData.addSet(setData);
        res.redirect('/lego/sets');
    } catch(err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
}) 

app.get('/lego/editSet/:set_num', async (req, res) => {
    try {
        const { set_num } = req.params; 
        let setData = await legoData.getSetByNum(set_num);
        let themeData = await legoData.getAllThemes();
        res.render('editSet', { set: setData, themes: themeData });
    } catch(err) {
        res.status(404).render("404", {message: err});
    }
}) 

app.post('/lego/editSet', async(req, res) => {
    try{
        const set_num = req.body.set_num;
        const setData = req.body;
        await legoData.editSet(set_num, setData);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
})

app.get('/lego/deleteSet/:set_num', async(req, res) => {
    try {
        let set_num = req.params; 
        await legoData.deleteSet(set_num);
        res.redirect('/lego/sets');
    } catch(err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
})

app.use((req, res, next) => {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
});

legoData.initialize()
    .then(data => {
        console.log(data);
        app.listen(HTTP_PORT, () => {
            console.log("LISTEN TO PORT 3000!");
        })
    });
