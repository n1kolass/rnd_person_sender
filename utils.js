'use strict';

const fs = require('fs');
const config = require('./config.json');

function getChosenOne() {
    // Chosen ones shouldn't repeat during one week
    // Alexandra Plotichkina shouldn't be chosen one during specified week days

    let fileStringified, alreadyChosen;
    try {
        fileStringified = fs.readFileSync(config.pathToAlreadyChosen, {flag: 'a+', encoding: 'UTF-8'});
        alreadyChosen = JSON.parse(fileStringified);
    } catch (error) {
        console.error(`Error on attempt to read ${config.pathToAlreadyChosen}: ${error}`);
        return 'Error occurred during file reading. Please, retry or fix an issue.';
    }

    if (alreadyChosen.alreadyChosen.length >= config.persons.length) {
        return 'Nobody left :(';
    }
    let currentWeekDay = new Date().getDay();
    if (alreadyChosen.alreadyChosen.length && currentWeekDay === 1) {
        forgetAlreadyChosen();
        alreadyChosen.alreadyChosen = [];
        console.log('It\'s monday! Time to start a fresh new week.');
    }
    let randomIndex = getPersonIndex(alreadyChosen.alreadyChosen);
    if (randomIndex === -1) {
        return 'Nobody left :(';
    }
    let chosenOne = config.persons[randomIndex];
    alreadyChosen.alreadyChosen.push(chosenOne);

    try {
        fs.writeFileSync(config.pathToAlreadyChosen, JSON.stringify(alreadyChosen, '', 2));
    } catch (error) {
        console.error(`Error on attempt to write to ${config.pathToAlreadyChosen}: ${error}`);
        return 'Error occurred during file writing. Please, retry or fix an issue.';
    }

    return chosenOne;
}

function getPersonIndex(alreadyChosen) {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * config.persons.length);
        if (config.persons[randomIndex] === 'Alexandra Plotichkina'
            && isThisPersonAvailable(randomIndex, alreadyChosen) === false
            && config.persons.length === (alreadyChosen.length + 1)
        ) {
            console.log('Everybody have already been daily leaders, only Alexandra Plotichkina is left, but she is not working today :(');
            return -1;
        }
    } while (isThisPersonAvailable(randomIndex, alreadyChosen) === false);
    return randomIndex;
}

function isThisPersonAvailable(index, alreadyChosen) {
    let chosenOne = config.persons[index];
    if (chosenOne === 'Alexandra Plotichkina') {
        let currentWeekDay = new Date().getDay();
        if (config.alexandraUnavailableOn.includes(currentWeekDay)) {
            return false;
        }
    }
    return alreadyChosen.findIndex(person => person === chosenOne) === -1;
}

function forgetAlreadyChosen() {
    const alreadyChosen = {
        alreadyChosen: []
    };
    try {
        fs.writeFileSync(config.pathToAlreadyChosen, JSON.stringify(alreadyChosen, '', 2));
    } catch (error) {
        console.error(`Error on attempt to write to ${config.pathToAlreadyChosen}: ${error}`);
    }
}

module.exports = {
    getChosenOne,
    forgetAlreadyChosen
};

if (require.main === module) {
    console.log(getChosenOne());
}