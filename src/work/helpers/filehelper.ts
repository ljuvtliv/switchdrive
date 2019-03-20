var http = require('http');
var https = require('https');
var fs = require('fs');
import {URL} from 'url';
export class cls_filehelper {
        constructor () {
          //Constructing
        }
        async dirthere(directory,create:boolean = false){
          return new Promise(function(resolve,reject){
            fs.stat(directory, function(err, stats) {
              //Check if error defined and the error code is "not exists"
              if (err && (err.errno === 34 || err.errno === -4058)) {
                if(create){
                  fs.mkdir(directory,function(){
                    resolve('created');
                  });
                }else{resolve(false);}
              } else if(err) {
                console.log(err);
                //just in case there was a different error:
                reject("unknown error");
              }else{
                resolve(true)
              }
            });
          });
        }


        async fetch(url,dest){
          return new Promise(function(resolve, reject) {

            const qurl = new URL(url);
            const proto = qurl.protocol;
            //const filename = qurl.pathname.split("/").slice(-1)[0];
            var file = fs.createWriteStream(dest);
            var error = function(err){
              fs.unlink(dest); // Delete the file async. (But we don't check the result)
              reject(err.message)
            }
            var response = function(response){
              if(response.statusCode !== 200){
                reject('get failed');
              }
              response.pipe(file);
              file.on('finish', function() {
                    file.close(function(){
                      //Here we can return the promise
                      resolve(true);
                    });  // close() is async, call cb after close completes.
              });
            };
            try{
            switch(proto){
              case "http:":
                http.get(url,response).on('error',console.log('failed'));
                break;
              case "https:":
                https.get(url,response).on('error',console.log('failed'));
                break;
            }
          }catch(e){
            console.log(e);
          }
          });
        }

}
