import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import csv from 'csv-parser';
import { z } from 'zod';

const emailSchema = z.string().email();
async function analyseFiles(inputPaths: string[], outputPath: string) {  
    let totalEmailsParsed = 0;  
    let totalValidEmails = 0;  
    const categories = new Map<string, number>();  
    
    for (const filePath of inputPaths) {    
        const fileStream = createReadStream(filePath);    
        await pipeline(fileStream, csv(), async function analysisStream(source) { 
                 for await (const data of source) {       
                    
                    totalEmailsParsed += 1;        
                    
                    const validation = emailSchema.safeParse(data.Emails);        
                    if (!validation.success) {          
                        continue;        
                    }        
                    
                    const domain = validation.data.split('@')[1];        
                    
                    totalValidEmails += 1;        
                    categories.set(domain, (categories.get(domain) ?? 0) + 1);
                    
                    // if (categories.has(domain)) {        
                    //   categories.set(domain, categories.get(domain)! + 1);       
                    // } else {        
                    //   categories.set(domain, 1);        
                    // }      
                }    
            });    
            await fs.writeFile(      
                outputPath,      
                JSON.stringify({        
                totalEmailsParsed,        
                totalValidEmails,        
                categories: Object.fromEntries(categories),        
                'valid-domains': Array.from(categories.keys()),      
            }),    
            );    
            console.log('Analysis complete');  
        }
    }
        
    export default analyseFiles;