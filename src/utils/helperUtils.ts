import { rgba } from "./colorUtils";
import { IDialog } from "@/interfaces";
import { LimitsEnum } from "@/enums";
import { I18n } from "@/controllers/i18n";
import { BasePlayer } from "@/controllers/player";
import { defaultCharset } from "@/controllers/gamemode/settings";
import { TCommonCallback } from "@/types";

type processTuple = [string, string | number[]];

export const processMsg = (msg: string, charset: string): processTuple => {
  const res: string | number[] = ["utf8", "utf-8"].includes(charset)
    ? msg
    : I18n.encodeToBuf(msg, charset);
  const flag = res instanceof Array ? "a" : "s";
  return [flag, res];
};

// Here are some i18n functions used to override the original functions
export const SendClientMessage = <P extends BasePlayer>(
  player: P,
  color: string | number,
  msg: string
): number => {
  const res = processMsg(msg, player.charset);
  return callNative(
    "SendClientMessage",
    `ii${res[0]}`,
    player.id,
    rgba(color),
    res[1]
  );
};

export const SendClientMessageToAll = <P extends BasePlayer>(
  fn: Array<P>,
  color: string | number,
  msg: string
): number => {
  fn.forEach((player) => SendClientMessage(player, color, msg));
  return 1;
};

export const SendPlayerMessageToPlayer = <P extends BasePlayer>(
  player: P,
  senderId: number,
  message: string
): number => {
  const res = processMsg(message, player.charset);
  return callNative(
    "SendPlayerMessageToPlayer",
    `ii${res[0]}`,
    player.id,
    senderId,
    res[1]
  );
};

export const SendPlayerMessageToAll = <P extends BasePlayer>(
  fn: Array<P>,
  senderId: number,
  message: string
): number => {
  fn.forEach((player) => SendPlayerMessageToPlayer(player, senderId, message));
  return 1;
};

export const ShowPlayerDialog = <P extends BasePlayer>(
  player: P,
  id: number,
  dialog: IDialog
): number => {
  const { charset } = player;
  const { style, caption, info, button1, button2 } = dialog;
  const [flag, processCaption] = processMsg(caption || "", charset);
  const [, processInfo] = processMsg(info || "", charset);
  const [, processButton1] = processMsg(button1 || "", charset);
  const [, processButton2] = processMsg(button2 || "", charset);
  return callNative(
    "ShowPlayerDialog",
    `iii${flag.repeat(4)}`,
    player.id,
    id,
    style,
    processCaption,
    processInfo,
    processButton1,
    processButton2
  );
};

// see https://github.com/AmyrAhmady/samp-node/wiki/Events#sampnode_callevent.
// in short, when you write the flag a, you must add I after it, but this I will actually be ignored.

samp.registerEvent("OnPlayerTextI18n", "iai");
export const OnPlayerText = (
  fn: (playerid: number, buf: number[]) => number
) => {
  // get the player input text
  // and you can decode with the player's charset;
  samp.addEventListener("OnPlayerTextI18n", fn);
};

samp.registerEvent("OnPlayerCommandTextI18n", "iai");
export const OnPlayerCommandText = (
  fn: (playerid: number, buf: number[]) => number
) => {
  samp.addEventListener("OnPlayerCommandTextI18n", fn);
};

samp.registerEvent("OnDialogResponseI18n", "iiiiai");
export const OnDialogResponse = (
  fn: (
    playerid: number,
    dialogid: number,
    response: number,
    listitem: number,
    inputbuf: number[]
  ) => number
) => {
  samp.addEventListener("OnDialogResponseI18n", fn);
};

samp.registerEvent("OnClientMessageI18n", "iai");
export const OnClientMessage = (
  fn: (color: number, text: string) => number,
  charset = defaultCharset
) => {
  samp.addEventListener(
    "OnClientMessageI18n",
    (color: number, buf: number[]): number => {
      return fn(color, I18n.decodeFromBuf(buf, charset));
    }
  );
};

samp.registerEvent("OnRconCommandI18n", "ai");
export const OnRconCommand = (
  fn: (cmd: string) => number,
  charset = defaultCharset
) => {
  samp.addEventListener("OnRconCommandI18n", (buf: number[]): number => {
    return fn(I18n.decodeFromBuf(buf, charset));
  });
};

samp.registerEvent("OnRconLoginAttemptI18n", "aiaii");
export const OnRconLoginAttempt = (
  fn: (ip: string, password: string, success: boolean) => number,
  charset = defaultCharset
) => {
  samp.addEventListener(
    "OnRconLoginAttemptI18n",
    (ip: number[], password: number[], success: number): number => {
      return fn(
        I18n.decodeFromBuf(ip, charset),
        I18n.decodeFromBuf(password, charset),
        Boolean(success)
      );
    }
  );
};

export const GetPlayerName = <P extends BasePlayer>(player: P): string => {
  const buf: number[] = callNative(
    "GetPlayerName",
    "iAi",
    player.id,
    LimitsEnum.MAX_PLAYER_NAME
  );
  return I18n.decodeFromBuf(I18n.getValidStr(buf), player.charset);
};

export const SetPlayerName = <P extends BasePlayer>(
  player: P,
  name: string
): number => {
  return callNative(
    "SetPlayerName",
    "ia",
    player.id,
    I18n.encodeToBuf(name, player.charset)
  );
};

export const BanEx = (
  playerid: number,
  reason: string,
  charset: string
): number => {
  const buf = I18n.encodeToBuf(reason, charset);
  return callNative("BanEx", "ia", playerid, buf);
};

export const CreateDynamic3DTextLabel = (
  charset: string,
  text: string,
  color: number,
  x: number,
  y: number,
  z: number,
  drawdistance: number,
  attachedplayer: number,
  attachedvehicle: number,
  testlos: boolean,
  worldid: number,
  interiorid: number,
  playerid: number,
  streamdistance: number,
  areaid: number,
  priority: number
): number => {
  const buf = I18n.encodeToBuf(text, charset);
  return callNative(
    "CreateDynamic3DTextLabel",
    "aiffffiiiiiifii",
    buf,
    color,
    x,
    y,
    z,
    drawdistance,
    attachedplayer,
    attachedvehicle,
    testlos,
    worldid,
    interiorid,
    playerid,
    streamdistance,
    areaid,
    priority
  );
};

export const CreateDynamic3DTextLabelEx = (
  text: string,
  color: number,
  x: number,
  y: number,
  z: number,
  drawdistance: number,
  attachedplayer: number,
  attachedvehicle: number,
  testlos: boolean,
  streamdistance: number,
  worlds: number[],
  interiors: number[],
  players: number[],
  areas: number[],
  priority: number,
  charset: string
): number => {
  const buf = I18n.encodeToBuf(text, charset);
  return callNative(
    "CreateDynamic3DTextLabelEx",
    "aiffffiiifaaaaiiiii",
    buf,
    color,
    x,
    y,
    z,
    drawdistance,
    attachedplayer,
    attachedvehicle,
    testlos,
    streamdistance,
    worlds,
    interiors,
    players,
    areas,
    priority,
    worlds.length,
    interiors.length,
    players.length,
    areas.length
  );
};

export const UpdateDynamic3DTextLabelText = (
  id: number,
  color: number,
  text: string,
  charset: string
): number => {
  const buf = I18n.encodeToBuf(text, charset);
  return callNative("UpdateDynamic3DTextLabelText", "iia", id, color, buf);
};

export const GetDynamic3DTextLabelText = (
  id: number,
  charset: string
): string => {
  const buf: number[] = callNative(
    "GetDynamic3DTextLabelText",
    "iAi",
    id,
    1024
  );
  return I18n.decodeFromBuf(I18n.getValidStr(buf), charset);
};

export const SetDynamicObjectMaterialText = (
  charset: string,
  objectid: number,
  materialindex: number,
  text: string,
  materialsize: number,
  fontface: string,
  fontsize: number,
  bold: number,
  fontcolor: number,
  backcolor: number,
  textalignment: number
): number => {
  const textBuf = I18n.encodeToBuf(text, charset);
  const fontFaceBuf = I18n.encodeToBuf(fontface, charset);
  return callNative(
    "SetDynamicObjectMaterialText",
    "iiaiaiiiii",
    objectid,
    materialindex,
    textBuf,
    materialsize,
    fontFaceBuf,
    fontsize,
    bold,
    fontcolor,
    backcolor,
    textalignment
  );
};

export const GetDynamicObjectMaterialText = (
  objectid: number,
  materialindex: number,
  charset: string
) => {
  const [
    text,
    materialsize,
    fontface,
    bold,
    fontcolor,
    backcolor,
    textalignment,
  ]: [number[], number, number[], number, number, number, number] = callNative(
    "GetDynamicObjectMaterialText",
    "iiAIAIIIIIii",
    objectid,
    materialindex,
    2048,
    32
  );
  const textStr = I18n.decodeFromBuf(text, charset);
  const fontFaceStr = I18n.decodeFromBuf(fontface, charset);
  return {
    text: textStr,
    materialsize,
    fontface: fontFaceStr,
    bold,
    fontcolor,
    backcolor,
    textalignment,
  };
};

export const promisifyCallback = function (
  this: any,
  fn: (...args: any) => TCommonCallback | void,
  cbName: string,
  retNum = 1 // should return handled number
) {
  return (...args: any) => {
    const result = fn.call(this, ...args);
    if (typeof result === "number") return result;
    if (result instanceof Promise) {
      result.then((value) => {
        const promiseFn = () => value;
        samp.addEventListener(cbName, promiseFn);
        samp.removeEventListener(cbName, promiseFn);
      });
    }
    return retNum;
  };
};

export const NOOP = (cbName: string, unhandled = 0) =>
  promisifyCallback(() => unhandled, cbName);

export const { callNative, callNativeFloat } = samp;
