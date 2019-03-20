export class GameFile {
  name: string;
  file:string;
  titleid: string;
  version: string;
  constructor(file:string){
    const titlereg = /\[[A-Z,0-9]{16}\]/g;
    const versionreg = /\[(v[0-9]{1,16})\]/g;
    this.file = file;
    var t = file.match(titlereg);
    var v = file.match(versionreg);
    var n = file.substring(0, file.indexOf("["));

    this.titleid = t[0].replace(/[\[\]']+/g, '');
    this.version = v[0].replace(/[\[\]']+/g, ''); this.version = this.version.replace("v",'');
    this.name = n.trim();
  }
}
