/*********************************************************************************
* WEB322 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
* 
* Name: Thanh Hoang Phan Student ID: 101662229 Date: 10/11/2023
*
* Published URL: 
*
********************************************************************************/ 

const { render } = require('ejs');
const express = require('express'); 
const app = express();
const path = require('path');
const legoData = require("./modules/legoSets");

const HTTP_PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views')); // connect to 'views' directory 
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true})) // this one needs for the POST action
app.use(express.static('public'));



app.get('/', (req, res) => {
    res.render('home')
})

app.get('/about', (req, res) => {
    res.render('about');
})

app.get('/lego/sets', (req, res) => {
    const { theme } = req.query;
    if(theme === undefined) {
        legoData.getAllSets()
        .then(set => {
            res.render('sets', { set }); // show all data
        })
        
    } else {
        legoData.getSetsByTheme(theme)
            .then(set => {
                res.render('sets', { set }); // show some sets with the certain themes
            })
            .catch(err => {
                console.log(err);
                res.status(404).render("404", {message: err});
            })
    }
})

app.get('/lego/sets/:set_num', (req, res) => {
    const { set_num } = req.params; 
    legoData.getSetByNum(set_num)
        .then(set => {
            res.render('show', { set });
        })
        .catch(err => {
            console.log(err);
            res.status(404).render("404", {message: err});
        })
})

app.use((req, res, next) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize()
    .then(data => {
        console.log(data);
        app.listen(HTTP_PORT, () => {
            console.log("LISTEN TO PORT 3000!");
        })
    });
