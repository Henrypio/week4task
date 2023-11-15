//const dns= require('dns');
const convertJSon = require('convert-csv-to-json');

function validate(inputFilePath, outputFilePath){

const jsonObject = convertJSon.generateJsonFileFromCsv(inputFilePath, outputFilePath)
return jsonObject
}

validate('../fixtures/inputs/small-sample.csv', './tutorial.json');
module.exports = validate


