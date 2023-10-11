/*********************************************************************************
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
* 
* Name: Thanh Hoang Phan Student ID: 101662229 Date: 09/25/2023
*
********************************************************************************/ 

const express = require('express'); 
const app = express();
const path = require('path');

const legoData = require("./modules/legoSets");

const HTTP_PORT = process.env.PORT || 3000;

app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"));
})

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "views/about.html"));
})

app.get('/lego/sets', (req, res) => {
    const { theme } = req.query;
    
    legoData.getSetsByTheme(theme)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        legoData.getAllSets()
        .then(data => {
            res.send(data);
        })
        .catch( error => {
            console.log(error);
            res.status(404).sendFile(path.join(__dirname, "views/404.html"));
        })
    })
})

app.get('/lego/sets/:set_num', (req, res) => {
    const { set_num } = req.params; 
    legoData.getSetByNum(set_num)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err);
            res.status(404).sendFile(path.join(__dirname, "views/404.html"));
        })
})

app.listen(HTTP_PORT, () => {
    console.log("LISTEN TO PORT 3000!");
    legoData.initialize()
    .then(data => {
        console.log(data);
    });
})