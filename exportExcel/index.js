const exportUsersToExcel = require('./exportService');
const franchise = require('../franchises.json');

const workSheetColumnName = [
    "Name",
    "Phone",
    "Segment",
    "Primary Segment",
    "Units Number",
    "Date",
]

const workSheetName = 'ABFfranchises';
const filePath = './fileOutput/ABFinfo.xlsx';

exportUsersToExcel(franchise, workSheetColumnName, workSheetName, filePath);