import { U_TYPE } from "@base/work";

const Router = require('koa-router')

export class SwitchRouter {
  router;
  constructor(){
    this.router = new Router();
    //Router defs here, tying into functions on this class

      this.router.get('/', function (ctx, next) {
        ctx.send('Hello World!')
      });
      this.router.get('/test', function (ctx, next) {

      });
      this.router.get('/orphans', async function (ctx, next) {

        ctx.body = await ctx.core.loader.update_orphans();
      });

      this.router.get('/update/:type', async function (ctx,next) {
        let type = ctx.params['type'];
        //Type is ALL,TitleDB,GameDB or Drive
        /*
          gamedb = games you own
          titledb = the titleid database
          drive = import_drive
        */
        let gamedirs = ctx.core.gamedirs;
        let drive_folders = ctx.core.drivedirs;

        if(type == "all" || type == "titledb"){
          await ctx.core.titledb.work(U_TYPE.ALL);
        }
        if(type == "all" || type == "gamedb"){
          let ret;
          for(var i in gamedirs){
              ret = await ctx.core.loader.refresh(gamedirs[i]);
              ret.toFile(ctx.core.basedir+'log/refresh_'+i+'.log');
          }
        }
        if(type == "all" || type == "drive"){
          for(var i in drive_folders){
            let ret = await ctx.core.loader.import_drive(drive_folders[i]);
            ret.toFile(ctx.core.basedir+'logs/driveImport_'+drive_folders[i].input+'.log');
          }
        }
        console.log(type);
        ctx.body = 'worked';
      });
  }
  getRouter(){
    return this.router;
  }
}
