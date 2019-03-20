const CombineRouters = require('koa-combine-routers')
import * as Router from 'koa-router';
import * as Koa from "koa"
const Serve = require('koa-static');


export class Web {
  server:Koa;
  routers:Router[];
  online:boolean;
  ctx;
  port:number;
  constructor(port:number){
      this.online=false;
      this.routers = [];
      this.port = port;
      this.ctx = {};
  }
  async boot(){
    this.server = new Koa();
    this.server.use(Serve(__dirname + '/static'));

    //init context
    this.server.context.core = this.ctx;

    const router = CombineRouters(this.routers); this.server.use(router());
    await this.server.listen(this.port);
    this.online = true;
    console.log('ready for buisness');
  }
  addContext(id,ctx){
    this.ctx[id] = ctx;
  }
  addRouter(router:Router){
    this.routers.push(router);
  }
}
