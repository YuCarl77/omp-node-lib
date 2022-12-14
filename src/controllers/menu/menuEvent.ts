import { InvalidEnum } from "@/enums";
import { TCommonCallback } from "@/types";
import { promisifyCallback } from "@/utils/helperUtils";
import {
  OnGameModeExit,
  OnPlayerExitedMenu,
  OnPlayerSelectedMenuRow,
} from "@/wrapper/native/callbacks";
import { GetPlayerMenu } from "@/wrapper/native/functions";
import { BasePlayer } from "../player";
import { BaseMenu } from "./baseMenu";
import { menuBus, menuHooks } from "./menuBus";

export abstract class BaseMenuEvent<P extends BasePlayer, M extends BaseMenu> {
  private readonly menus = new Map<number, M>();
  private readonly players;

  constructor(playersMap: Map<number, P>, destroyOnExit = true) {
    this.players = playersMap;
    menuBus.on(menuHooks.created, (menu: M) => {
      this.menus.set(menu.id, menu);
    });
    menuBus.on(menuHooks.destroyed, (menu: M) => {
      this.menus.delete(menu.id);
    });
    if (destroyOnExit) {
      OnGameModeExit(() => {
        this.menus.forEach((m) => m.destroy());
        this.menus.clear();
      });
    }
    OnPlayerExitedMenu((playerid: number): number => {
      const menu = this.findMenuById(GetPlayerMenu(playerid));
      if (!menu) return 0;
      const player = this.findPlayerById(playerid);
      if (!player) return 0;
      const pFn = promisifyCallback.call(
        this,
        this.onPlayerExited,
        "OnPlayerExitedMenu"
      );
      return pFn(player, menu);
    });
    OnPlayerSelectedMenuRow((playerid: number, row: number): number => {
      const menu = this.findMenuById(GetPlayerMenu(playerid));
      if (!menu) return 0;
      const player = this.findPlayerById(playerid);
      if (!player) return 0;
      const pFn = promisifyCallback.call(
        this,
        this.onPlayerSelectedRow,
        "OnPlayerSelectedMenuRow"
      );
      return pFn(player, menu, row);
    });
  }
  protected abstract onPlayerExited(player: P, menu: M): TCommonCallback;
  protected abstract onPlayerSelectedRow(
    player: P,
    menu: M,
    row: number
  ): TCommonCallback;

  private findPlayerById(playerid: number) {
    return this.players.get(playerid);
  }

  public findMenuById(menuId: number) {
    if (menuId === InvalidEnum.MENU) return undefined;
    return this.menus.get(menuId);
  }

  public getMenusArr(): Array<M> {
    return [...this.menus.values()];
  }

  public getMenusMap(): Map<number, M> {
    return this.menus;
  }
}
