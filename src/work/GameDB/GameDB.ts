import fs = require('fs');
import {promisify} from 'util';
const readdir = promisify(fs.readdir);
import * as readline from 'readline';

import { Connection } from 'typeorm';

//Logging
const chalk = require('chalk');
const log = console.log;

//Local imports
import {GameFile, RefreshResult} from '@base/work/Structures';
import { Game, Title } from '@base/db/entities';
import {cls_datahelper} from '@base/work/helpers';
import{DriveClass,DriveMap,DriveFile} from '@base/work/GameDB/DriveClass'


export class GameDB{
  // Loop through owned games
  connection: Connection;
  datahelper: cls_datahelper;
  drive: DriveClass;
  constructor(conn){
    this.connection = conn;
    this.datahelper = new cls_datahelper(this.connection);
    this.drive = new DriveClass();
  }
  async auth_drive(){
    await this.drive.authorize().catch(function(e){});
  }
  async load_dir(folder:string):Promise<GameFile[]>{
    let obj : Array<GameFile> = [];
    var files = await readdir(folder);
    for (var i=0; i<files.length; i++) {
      var file = files[i];
      switch(file){
        case "desktop.ini":
          continue;
      }
      obj.push(new GameFile(files[i]));
    }
    return obj;
  }
  async refresh(folder:string){ //import existing on hard drive/refresh

    var result: RefreshResult = new RefreshResult();
    let files : GameFile[] = await this.load_dir(folder);
    for(var i=0; i<files.length;i++){
      let o:GameFile = files[i];
      let temp_push : string = "N:["+o.name+"]T:["+o.titleid+"]V:[v"+o.version+"]";
      var exist = await this.datahelper.gameExist(o.titleid,o.version);
      if(!exist){
        var t_short=o.titleid.substr(0, o.titleid.length-4);
        var game : Game = new Game();
        game.location = folder+"/"+files[i].file;
        game.version = o.version;
        game.titleid = o.titleid;
        game.name = o.name;
        var title_db : Title = await this.datahelper.getLikeTitle(t_short);
        if(title_db === undefined){
          this.consoleLog('creating orphan',temp_push);
          result.add('orphan',files[i]);
        }else{
          game.title = title_db;
          this.consoleLog('creating with title',temp_push);
          result.add('added',files[i]);
        }
        await this.connection.manager.save(game);
      }else{
        this.consoleLog('exist in database',temp_push);
        result.add('exist',files[i]);
      }
    }
    console.log('ALL DONE');
    return result;
  }
  async update_orphans(){
    return await this.datahelper.getOrphans();
  }
  async import_local(folder: string){
    var files : GameFile[] = await this.load_dir(folder);
    var result: RefreshResult = new RefreshResult();
    for(var i=0; i<files.length;i++){
      let o:GameFile = files[i];
      var exist = await this.datahelper.gameExist(o.titleid,o.version);
      if(!exist){
        result.add('unowned',o);
      }
      else{
        result.add('owned',o);
      }
    }
    return result;
  }
  consoleLog(title,message){
    log(chalk.blue('||')+chalk.white.bold(title));
    log(chalk.green('||')+chalk.white(message));
  }
  async import_drive(map:DriveMap){
    let result : RefreshResult = new RefreshResult();

    let driveGames : DriveFile[] = await this.drive.getDir(map.input);
    let driveOutputGames: DriveFile[] = await this.drive.getDir(map.output);

    for(var i in driveGames){
      let o:DriveFile = driveGames[i];
      let exist = await this.datahelper.gameExist(o.titleid,o.version);
      if(exist){
        result.add('owned',o);
      }else{
        if(driveOutputGames[o.titleid] !== undefined){
          console.log('|| Exists in temp dir');
          result.add('intemp',o);
          continue;
        }
        result.add('import',o);
        console.log('||Importing');
        let res = await this.drive.copy(driveGames[i].id,map.output);
        console.log('Imported:'+res.data.id + "T:["+o.titleid+']');
      }
    }
    return result;
  }
}
