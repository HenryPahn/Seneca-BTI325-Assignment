require('dotenv').config();
const { resolve } = require('path');
const Sequelize = require('sequelize');

let sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
});

const Theme = sequelize.define(
    'Theme',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true, 
            autoIncrement: true, 
        },
        name: Sequelize.STRING,
    },
    {
        createdAt: false, // disable createdAt
        updatedAt: false, // disable updatedAt
    }
);

const Set = sequelize.define(
    'Set',
    {
        set_num: {
            type: Sequelize.STRING,
            primaryKey: true, 
        },
        name: Sequelize.STRING,
        year: Sequelize.INTEGER,
        num_parts: Sequelize.INTEGER,
        theme_id: Sequelize.INTEGER,
        img_url: Sequelize.STRING,
    },
    {
        createdAt: false, // disable createdAt
        updatedAt: false, // disable updatedAt
    }
);

Set.belongsTo(Theme, {foreignKey: 'theme_id'})

const initialize = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.sync();
            resolve('Success load!!!');
        } catch (err) {
            reject(err);
        }
    });
}

const getAllSets = () => { 
    return new Promise(async (resolve, reject) => {
        try {
            let sets = await Set.findAll({ include: [Theme] })
            resolve(sets);
        } catch (err) {
            reject(err);
        }
    });
}

const getSetByNum = (setNum) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sets = await Set.findAll({
                include: [Theme], 
                where: { set_num: setNum }
            })
            resolve(sets[0]);
        } catch (err) {
            reject(err);
        }
    })
}

const getSetsByTheme = (theme) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sets = await Set.findAll({
                include: [Theme], 
                where: { '$Theme.name$': { [Sequelize.Op.iLike]: `%${theme}%` } }
            });
            resolve(sets);
        } catch(err) {
            resolve("Unable to find requested sets");
        }
    })
}

const addSet = (setData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let newSet = await Set.create(setData);
            resolve();
        } catch (err) {
            reject(err.errors[0].message);
        }
    }) 
}

const getAllThemes = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let themes = await Theme.findAll();
            resolve(themes);
        } catch (err) {
            reject(err);
        }
    })
}

const editSet = (setNum, setData) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Set.update(setData, {
                where: {
                    set_num: setNum
                }
            })
            resolve();
        } catch(err) {
            reject(err.errors[0].message);
        } 
    })
}

const deleteSet = (setNum) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Set.destroy({
                where: { set_num: setNum }
            }); 
            resolve();
        } catch(err) {
            reject(err.errors[0].message);
        }
    })
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet};
