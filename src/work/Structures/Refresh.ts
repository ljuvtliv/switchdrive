import fs = require('fs');
import {GameFile} from './GameFile'
import { DriveFile } from '@base/work/GameDB/DriveClass';
export class RefreshStatus{
  status: string;
  items: GameFile[];
  constructor(){
    this.items = [];
  }
  add(item:GameFile){
    this.items.push(item);
  }

}
export class RefreshResult{
  items: RefreshStatus[];
  constructor(){
    this.items=[];
  }
  add(status:string,item:GameFile | DriveFile){
    try{
      if(this.items[status] === undefined){
        this.items[status] = new RefreshStatus();
      }
      this.items[status].add(item);
      return true;
      }catch(e){
      return false;
    }
  }
  toFile(file:string){
    var out = fs.createWriteStream(file);
    out.on('error', function(err) { /* error handling */ });
    for (var i in this.items) {
      out.write("WRITING STATUS:"+i+"\n")
      this.items[i].items.forEach(function(i){
        out.write("N:["+i.name+"]T:["+i.titleid+"]V:[v"+i.version+"]"+"\n");
      });
    }
    out.end();
  }
}
