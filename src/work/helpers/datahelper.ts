import { Connection,IsNull } from "typeorm";
import { Title,Game } from "@base/db/entities";


export class cls_datahelper{
  connection: Connection;
  constructor(conn:Connection){
    this.connection=conn;
  }
  async getOrphans(){
    var conn = this.connection;
    let ret = await conn.getRepository(Game).createQueryBuilder("game")
    .leftJoinAndSelect("game.title", "title")
    .where('"titleId" is NULL').getMany();
    console.log(ret);
    return ret;
  }
  async titleExist(nsuid){
    var conn = this.connection;
    return new Promise(async function(resolve, reject) {
      var title = await conn.getRepository(Title).createQueryBuilder("title").where("title.nshopid = :id", { id: nsuid }).getOne().then(function(title){
        if(title === undefined){
          resolve(false);
        } else {
         resolve(true);
        }
      });
    });
  }
  async newTitle(title:Title){
     await this.connection.manager.save(title);
  }
  async gameExist(nsuid,version){
    var conn = this.connection;
    return new Promise(async function(resolve, reject) {
      var game = await conn.getRepository(Game).findOne({ where: { titleid: nsuid,version: version } }).then(function(game){
        if(game === undefined){
          resolve(false);
        } else {
         resolve(true);
        }
      });
    });
  }
  async getTitle(titleid){
    var conn = this.connection;
    return conn.getRepository(Title).createQueryBuilder("title").where("title.titleid = :id", { id: titleid }).getOne();
  }
  async getLikeTitle(titleid){
    var conn = this.connection;
    return conn.getRepository(Title).createQueryBuilder("title").where("title.titleid like :id", {id: '%' + titleid + '%' }).getOne();
  }
  async newGame(title:Game){
     await this.connection.manager.save(title);
  }
}
