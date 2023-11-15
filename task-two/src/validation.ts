/**
 * Stretch goal - Validate all the emails in this files and output the report
 *
 * @param {string[]} inputPath An array of csv files to read
 * @param {string} outputFile The path where to output the report
 */

import * as dns from 'dns';
import * as fs from 'fs';
import { convertArrayToCSV } from 'convert-array-to-csv';


async function validateEmailAddresses(inputFilePath: string[], outputFilePath: string) {
  const another_input = inputFilePath[0]
  async function convertCsvToJson(convertInput:string) {
    //const passthis = JSON.stringify(inputFilePath)
    const passthis = another_input
    const csvfile: string = await fs.promises.readFile(passthis, { encoding: 'utf-8' });
    
    // const csvfile:string = await fs.readFile(passthis, {encoding: 'utf-8'}, (error, data:string)=>{
    //   if(error){
    //     console.log(error, 'file not found')
    //   }
    //   return data
    // });
    const arr = csvfile.split('\n');
    const newArray = [];
    const key = arr[0].split(',');

    for (let item in arr) {
      const data = arr[item].split(',');
      const object:{[key: string]: string} = {};
      for (let value in data) {
        object[key[value].trim()] = data[value].trim();
      }
      newArray.push(object);
    }
    return newArray;
  }

  const arrayOfConvertedEmail = await convertCsvToJson(another_input); 
  const analysedResult = arrayOfConvertedEmail.filter((obj) => {
    return obj.Emails !== 'Emails' && obj.Emails !== ''
  });
  
  //const arrayOfConvertedEmail = convertCsvToJson(inputFilePath);

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

  async function getTrueEmail() {
    const returnthis = JSON.parse(JSON.stringify(analysedResult));
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

  async function convertDataToCSV() {
    try {
      const header = ['Email'];
      const dataArrays = (await getTrueEmail()).map((item) => {
        //to ensure each email is treated as a whole
        return [item];
      });
  
      const csvFromArrayOfArrays = convertArrayToCSV(dataArrays, {
        header,
        separator: ',',
      });
  
      // writing to new csv file
      const data = new Promise((resolve, reject) => {
        fs.writeFile(outputFilePath, csvFromArrayOfArrays, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve('CSV file saved successfully');
          }
        });
        //return data
      });
    } catch (error) {
      console.log(error, 'an Error occured')
    }
    

  }
  const finalResult = await convertDataToCSV();
  return finalResult;
}


export default validateEmailAddresses;
