const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = []; 

const initialize = () => {
    return new Promise((resolve, reject) => {
        setData.forEach(set => {
            set.theme = themeData.find((theme) => theme.id === set.theme_id).name;
            sets.push(set);
        })

        resolve('the "sets" array is filled with objects');
    });
}

const getAllSets = () => { 
    return new Promise((resolve, reject) => {
        resolve(sets);
    });
}

const getSetByNum = (setNum) => {
    return new Promise((resolve, reject) => {
        const res = sets.find(set => set.set_num == setNum);

        if (res == null || res === 'undefined') {
            reject("unable to find a request set");
        }
        else
            resolve(res);
    });
}

const getSetsByTheme = (theme) => {
    return new Promise((resolve, reject) => {
        const res = sets.filter(set => set.theme.toUpperCase().includes(theme.toUpperCase()));

        if (res.length === 0) 
            reject("unable to find a request sets");
        else
            resolve(res);
    })
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };