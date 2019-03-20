export class TitleJSON{
  private url: string;
  private filename: string;
  constructor(url,filename: string = null){
    if(filename !== null){
      this.filename = filename;
    } else{
      this.filename = this.get_filename(url);
    }
    this.url = url;
  }
  private get_filename(url){
    //this removes the anchor at the end, if there is one
    url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
    //this removes the query after the file name, if there is one
    url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
    //this removes everything before the last slash in the path
    url = url.substring(url.lastIndexOf("/") + 1, url.length);
    //return
    return url;
  }
  public getUrl(){
    return this.url;
  }
  public getFilename(){
    return this.filename;
  }
}
