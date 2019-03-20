import {MAIN_SETTINGS} from '@base/const';

var moment = require('moment');
var path = require('path');

import {cls_filehelper,cls_datahelper} from '@base/work/helpers';

import {TitleJSON,U_TYPE} from './structs';
import { Title } from '@base/db/entities/title';
import { Connection } from 'typeorm';
import fs = require('fs');

export class TitleDB {
  filehelper: cls_filehelper; // internal class for fetching files from http/https
  connection: Connection;
  datahelper:cls_datahelper;
  titledb_items: TitleJSON[]; // List of urls to download
  media_folder: string; //location of titledb
  constructor(conn:Connection){
    this.connection = conn;
    this.titledb_items = [
        new TitleJSON('https://raw.githubusercontent.com/blawar/nut/master/titledb/US.en.json'),
        new TitleJSON('https://raw.githubusercontent.com/blawar/nut/master/titledb/JP.ja.json'),

      ];
    this.filehelper = new cls_filehelper();
    this.datahelper = new cls_datahelper(this.connection);
    this.media_folder = MAIN_SETTINGS.MEDIA_DIR;
  }
  async work(type){
    switch(type){
      case U_TYPE.ALL:
        await this.refresh_db();
        await this.process_db();
        break;
      case U_TYPE.REFRESH:
        await this.refresh_db();
        break;
    }
  }
  async refresh_db(){
    for (var i = 0, len = this.titledb_items.length; i < len; i++) {
      await this.filehelper.fetch(this.titledb_items[i].getUrl(),this.media_folder+'/titledb/'+this.titledb_items[i].getFilename());
    }
  }
  async process_db(){
    for (var i = 0, len = this.titledb_items.length; i < len; i++) {
      await this.process_titledb(this.media_folder+'/titledb/'+this.titledb_items[i].getFilename());
    }
  }
  async process_titledb(file){
    console.log('processing TITLE_DB');

    var data = require(this.media_folder+'/titledb/US.en.json');
    var count = 0;
    for (var key in data) {
        // skip loop if the property is from prototype
        if (!data.hasOwnProperty(key)) continue;
        var obj = data[key];
        var nshopid = obj['nsuId'].toString();
        var exists = await this.datahelper.titleExist(nshopid);

        console.log('nsuID:'+nshopid);
        console.log('exists==:'+exists);
        if(exists){
          console.log('continuing');
          continue;
        }
        var title = new Title();
          title.titleid = obj['id'];
          if(title.titleid === null){
            title.titleid = "NOID";
          }
          title.nshopid = nshopid;
          title.name= obj['name'];
          title.description= obj['description'];
          title.intro= obj['intro'];
          title.category= obj['category'];
          title.ratingContent= obj['ratingContent'];
          title.languages= obj['languages'];
          title.rating=obj['rating'];
          title.numberOfPlayers= obj['numberOfPlayers'];
          if(obj['releaseDate'] !== null){
            title.releaseDate=new moment(obj['releaseDate'], 'YYYYMMDD').toDate();
          }else{
            continue;
          }
          title.isDemo=obj['isDemo'];
          title.size= obj['size'];
          title.region= obj['region'];
          title.key= obj['key'];
          title.version= obj['version'];
          title.rightsid= obj['rightsId'];
          title.developer= obj['developer'];
          title.publisher= obj['publisher'];

        var screenshots = obj['screenshots'];
        var processed_screenshots = [];

        var screenshot_dir = this.media_folder+"/screenshots/["+title.titleid+"]/";
        var dir_result = await this.filehelper.dirthere(screenshot_dir,true);
        for(var screenshot in screenshots){
            var screen_ext = path.extname(screenshots[screenshot]);
            processed_screenshots[screenshot] = "["+title.titleid+"]["+screenshot+"]"+screen_ext;
            if(dir_result == "created"){
              this.filehelper.fetch(screenshots[screenshot],screenshot_dir+"["+title.titleid+"]["+screenshot+"]"+screen_ext).catch(function(reason){
                console.log('failed to download:'+screenshot+' for:'+title.titleid);
                console.log('reason:'+reason);
              });
            }
        }
        var background_url = obj['bannerUrl'];
        if(background_url !== null){
          var background_ext = path.extname(background_url);
          var background_file =  this.media_folder+"/banners/["+title.titleid+"]"+background_ext;
          if (!fs.existsSync(background_file)) {
            console.log('writing background');
            this.filehelper.fetch(background_url,background_file).catch(function(reason){
              console.log('failed to download background for:'+title.titleid);
              console.log('reason:'+reason);
            });
          }
        }
        var icon_url = obj['iconUrl'];
        if(icon_url !== null){
          var icon_ext = path.extname(icon_url);
          var icon_file =  this.media_folder+"/icons/["+title.titleid+"]"+icon_ext;
          if (!fs.existsSync(icon_file)) {
            console.log('writing icon');
          this.filehelper.fetch(icon_url,icon_file).catch(function(reason){
            console.log('failed to download icon for:'+title.titleid);
            console.log('reason:'+reason);
          });
          }
        }
        title.screenshots = processed_screenshots;
        this.datahelper.newTitle(title);
        count = count+1;
      }
    }
}
