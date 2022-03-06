const franchises = require('./franchises.json');

franchises.forEach((franchise) => {
    const regex = /[0-9]/g
    const value = franchise.unitsNum.match(regex);
    if (value !== null) franchise.unitsNum = value.join('');
    franchise.name = franchise.name.split('\n')[1]
})

