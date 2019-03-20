import "reflect-metadata";
import {MAIN_SETTINGS,WEB_SETTINGS,DB_SETTINGS} from '@base/const';


import {TitleDB,GameDB, U_TYPE,GameFile} from './work/';
import { Connection, createConnection } from "typeorm";
import { Title,Game } from "@base/db/entities/";

import{DriveClass,DriveMap,DriveFile} from '@base/work/GameDB/DriveClass'

import { Web } from "@base/api/web";


import fs = require('fs');
import util = require('util');
import * as readline from 'readline';
import { SwitchRouter } from "@base/api/routers/switchRouter";
const readFile = util.promisify(fs.readFile);


async function boot(){
  const conn = await createConnection({
    type: "postgres",
    host: DB_SETTINGS.HOST,
    port: DB_SETTINGS.PORT,
    username: DB_SETTINGS.USERNAME,
    password: DB_SETTINGS.PASSWORD,
    database: DB_SETTINGS.DATABASE,
    entities: [Title,Game],
    synchronize: true,
  });
  let drive_folders : DriveMap[] = [];
  for(var i in MAIN_SETTINGS.DRIVE_DIRS){
    drive_folders[i] = new DriveMap(MAIN_SETTINGS.DRIVE_DIRS[i][0],MAIN_SETTINGS.DRIVE_DIRS[i][1]);
  }


  var worker = new TitleDB(conn);
  var loader = new GameDB(conn);
  await loader.auth_drive();

  let web : Web = new Web(WEB_SETTINGS.LISTEN_PORT);

  web.addContext('basedir',MAIN_SETTINGS.BASE_DIR);
  web.addContext('gamedirs',MAIN_SETTINGS.LOCAL_GAME_DIRS);
  web.addContext('drivedirs',drive_folders);
  web.addContext('conn',conn);
  web.addContext('loader',loader);
  web.addContext('titledb',worker);

  let switchRouter : SwitchRouter = new SwitchRouter();
  web.addRouter(switchRouter.getRouter());
  await web.boot();
}
boot();
