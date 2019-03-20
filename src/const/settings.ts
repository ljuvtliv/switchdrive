export const MAIN_SETTINGS = {
  BASE_DIR: "C:/code/switch",//Or C:/SomeOtherDir
  MEDIA_DIR: "D:/switchit/media",
  LOCAL_GAME_DIRS: {
    "base":"X:/Games/Switch/BaseNSP",
    "dlc":"X:/Games/Switch/DLC",
    "Updates":"X:/Games/Switch/Updates"
  },
  DRIVE_CREDENTIAL_DIR:"./drive_credentials", //For the credentials.json and token.json
  DRIVE_DIRS:{
    "base":["input","output"],
    "DLC":["input","output"],
    "Update":["input","output"]
  }
}
export const DB_SETTINGS = {
  TYPE:"postgres",
  HOST: "localhost",
  PORT: 5432,
  USERNAME:"switch",
  PASSWORD:"switch",
  DATABASE:"switch"
}
export const WEB_SETTINGS = {
  LISTEN_PORT:3000,
  //Authentication, koa settings etc todo.
}
