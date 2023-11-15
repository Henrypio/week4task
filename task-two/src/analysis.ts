/**
 * First task - Read the csv files in the inputPath and analyse them
 *
 * @param {string[]} inputPaths An array of csv files to read
 * @param {string} outputPath The path to output the analysis
 */

import * as fs from 'fs';
import * as dns from 'dns';
import * as validator from 'email-validator';


interface AnalysisObject {
  "valid-domains": string[];
  totalEamilsParsed: number;
  totalValidEmails: number;
  categories: { [key: string]: number };
}

// filter out Email and empty string
async function analyseFiles(inputhPaths: string[], outputPath: string): Promise<void> {
  const another_input = inputhPaths[0]
  async function convertCsvToJson(convertInput: string){
    // reading the file synchronously
    // const passthis = JSON.stringify(inputPaths)
    const passthis = another_input
    const csvfile = await fs.promises.readFile(passthis, {encoding: 'utf-8'});
    // converting the csv to string and concurrently splitting to an array at each break point 
    const arr = csvfile.split('\n');
    const newArray: {}[] = [];
    /*defining the key to each object, 
    this will use the first item in the arr
    which is Email, then further split it and pick 
    the first one which is email, inorder
    to remove the comma, 
    */
    const key: string[] = arr[0].split(',');
  
    // using for loop to create the array of objects
    for (let item in arr) {
      const data = arr[item].split(',');
      const object:{[key: string]: string} = {};
      for (let value in data) {
        object[key[value].trim()] = data[value].trim();
      }
  
      //console.log(object);
      newArray.push(object);
    }
    return newArray;
  }
  
  const arrayOfConvertedEmail: {[Email:string]: string}[] = await convertCsvToJson(another_input);
  const filteredEmailsArray = arrayOfConvertedEmail.filter((obj) => {
    return obj.Emails !== 'Emails' && obj.Emails !== '';
  });

  // getting array of valid domains

  // function to check mx recod using dns.resolveMX
  async function checkMxRecord(emailtoCheck: string) {
    const domain = emailtoCheck.split('@')[1];
    return new Promise((resolve, reject) => {
      try {
        dns.resolveMx(domain, (error, addresses) => {
          if (error) {
            return reject('Not a valid email address');
          } else {
            return resolve(addresses.length > 0);
          }
        });
      } catch (error) {
        return reject(error);
      }
    }).catch((error) => {
      return error;
    });
  }

  //function to check each email at each index
  async function getTrueEmail() {
    const returnthis = JSON.parse(JSON.stringify(filteredEmailsArray));
    const trueEmail:string[] = [];
    const falseEmail:string[] = [];
    for (let email of returnthis) {
      if (email.Emails) {
        const myOutput = await checkMxRecord(email.Emails)
          .then((result) => {
            if (result === true) {
              trueEmail.push(email.Emails);
            } else {
              falseEmail.push(email.Emails);
            }
          })
          .catch((result) => {
            falseEmail.push(email.Emails);
          });
      }
    }
    return trueEmail;
  }

  // variable to store the no. of true emails
  const validDomainArray = await getTrueEmail()
  // getting the array of valid-demails
  const validEmailArray: string[] = [];
  //EmailValidator.validate("test@email.com")
  for (let email of filteredEmailsArray) {
    const validEmails = validator.validate(email.Emails);
    if(validEmails === true){
      validEmailArray.push(email.Emails);
    }
  
  }

  // getting the total no. of email parsed;
  const arrayOfTotalEmailParsed: {[Email:string]: string}[] = await convertCsvToJson(another_input);
  const filteredTotalEmailParsed = arrayOfTotalEmailParsed.filter((item) => {
    return item.Emails !== 'Emails' && item.Emails !== '';
  });

  // to get the categories
  const category = filteredEmailsArray.reduce((accumulatorObject:{[key:string]: number}, eachEmail) => {
    const splitKey = eachEmail.Emails.split('@');
    // console.log(splitKey)
    const key = splitKey[1];
    if (!accumulatorObject[key]) {
      accumulatorObject[key] = 0;
    }

    accumulatorObject[key]++;
    return accumulatorObject;

  }, {});

  // console.log(category)
  const analysisObject: AnalysisObject = {
    "valid-domains": validDomainArray,
    totalEamilsParsed: filteredTotalEmailParsed.length,
    totalValidEmails: validEmailArray.length,
    categories: category
  };

  // to convert the second argument to be passed in to writeFileSync to a string, as the object I want to write is an object
  const jsonString = JSON.stringify(analysisObject, null, 2); // this convert the object to string using 2 space indentation
  try {
    const data = await fs.writeFile(outputPath, jsonString,(err)=>{
      if (err) {
        return (err);
      } else {
        console.log('CSV file saved successfully');
      }
    } )
    return data
  } catch (error) {
    console.log(error)
  }

}

export default analyseFiles;
// ./bin/email-analysis analysis ./fixtures/inputs/small-sample.csv small.json