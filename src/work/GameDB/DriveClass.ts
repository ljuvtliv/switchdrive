import {google,GoogleApis} from "googleapis";
import {MAIN_SETTINGS} from '@base/const';

import fs = require('fs');
import util = require('util');
import * as readline from 'readline';

const readFile = util.promisify(fs.readFile);
export class DriveMap{
  input: string;//directory id's
  output: string;
  constructor(input:string,output:string){
    this.input = input;
    this.output = output;
  }
}
export class DriveFile{
  id:string;
  name: string;
  titleid: string;
  version: string;
  constructor(id:string,file:string){
    this.id = id
    const titlereg = /\[[A-Z,0-9]{16}\]/g;
    const versionreg = /\[(v[0-9]{1,16})\]/g;
    var t = file.match(titlereg);
    var v = file.match(versionreg);
    var n = file.substring(0, file.indexOf("["));

    this.titleid = t[0].replace(/[\[\]']+/g, '');
    this.version = v[0].replace(/[\[\]']+/g, ''); this.version = this.version.replace("v",'');
    this.name = n.trim();
  }
}
export class DriveClass{
  readonly SCOPES = ['https://www.googleapis.com/auth/drive'];
  readonly TOKEN_PATH : string = MAIN_SETTINGS.DRIVE_CREDENTIAL_DIR + '/token.json';
  authorized:boolean;
  oAuth2Client;
  constructor(){
    this.authorized = false;
  }
  async authorize(){
   let credential_file = await readFile(MAIN_SETTINGS.DRIVE_CREDENTIAL_DIR + '/credentials.json');
   let credentials = JSON.parse(credential_file.toString());

   const {client_secret, client_id, redirect_uris} = credentials.installed;
   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
   this.oAuth2Client = oAuth2Client;

   let token_file:Buffer=undefined;
   let token:string=undefined;
   try{
     token_file = await readFile(this.TOKEN_PATH);
     token = token_file.toString();
   }catch(e){
     console.log(e.code);
     if(e.code == "ENOENT"){
       token = await this.getAccessToken();

     }
   }
   oAuth2Client.setCredentials(JSON.parse(token));
   this.authorized = true;
  }
  async getAccessToken() :Promise<string>{
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
    });
    let that = this;
    let token:string;
    console.log('Authorize this app by visiting this url:', authUrl);
    let pr: Promise<string> = new Promise(function(resolve,reject){
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        that.oAuth2Client.getToken(code, (err, token) => {
          if (err) reject('error retrieving');
          // Store the token to disk for later program executions
          if(token===null){
            reject('error')
          }else{
          fs.writeFile(that.TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) console.error(err);
            console.log('Token stored to', that.TOKEN_PATH);
          });
          resolve(token);
        }
        });
      });
    });
    return pr;
  }
  async getDir(dirid:string = undefined){
    if(this.authorized == false){console.log('not authorized');return [];}
    let auth = this.oAuth2Client;
    const drive = google.drive({version: 'v3', auth});
    let opts = {
      pageSize: 1000,
      pageToken:"",
      fields: 'nextPageToken, files(id, name)',
      q:""
    }
    let fileReturn : DriveFile[] = [];

    if(dirid != undefined && dirid.length != 0){
        opts.q = "'"+ dirid +"' in parents";
    }else{
        opts.pageSize=10;
    }
    while(true){
          var data = await this.list(drive,opts);
          var files = data.files;
          files.map((file) => {
                  let f = new DriveFile(file.id,file.name);
                  fileReturn[f.titleid] = f;
                });
          if(data.nextPageToken === undefined){
            break;
          }
          opts.pageToken = data.nextPageToken;
   }

   return fileReturn;
  }
  async list(drive,opts){
    var data;
    var pr : any = new Promise(function(resolve,reject){
      drive.files.list(opts, (err, res) => {
         if (err) return console.log('The API returned an error: ' + err);
         data = res.data;
         resolve(data);
     });
   });
   return pr;
  }
  async copy(file_id:string,dest_id:string){
    if(this.authorized == false){console.log('not authorized');return [];}
    let auth = this.oAuth2Client;
    const drive = google.drive({version: 'v3', auth});
    let opts = {
      fileId: file_id,
      resource:{
        parents:[dest_id],
      }
    }
    var pr : any = new Promise(function(resolve,reject){
      drive.files.copy(opts, (err, res) => {
         if (err) return console.log('The API returned an error: ' + err);
         resolve(res);
     });
   });
   return pr;
  }
}
