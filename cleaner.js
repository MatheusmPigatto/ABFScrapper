const franchises = require('./ruthFranchise.json');
const fs = require('fs');

franchises.forEach((franchise) => {
    const regex = /[0-9]/g
    const value = franchise.unitsNum.match(regex);
    const date = franchise.updateDate.split(' ');
    franchise.updateDate = date[date.length -1];
    if (value !== null) franchise.unitsNum = value.join('');
    franchise.name = franchise.name.split('\n')[1]
})

fs.writeFile('franchises.json', JSON.stringify(franchises, null, 2), err => {
    if(err) throw new Error('somethin went wrong')
})
