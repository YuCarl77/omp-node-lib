import type { BasePlayer } from "@/controllers/player";
import { TCommonCallback } from "@/types";
import { promisifyCallback } from "@/utils/helperUtils";
import { OnGameModeExit } from "@/wrapper/native/callbacks";
import {
  OnPlayerEnterDynamicRaceCP,
  OnPlayerLeaveDynamicRaceCP,
  StreamerItemTypes,
} from "omp-wrapper-streamer";
import { Streamer } from "../common";
import { DynamicRaceCP } from "./baseRaceCP";
import { raceCPBus, raceCPHooks } from "./raceCPBus";

export abstract class DynamicRaceCPEvent<
  P extends BasePlayer,
  R extends DynamicRaceCP
> {
  private readonly raceCPs = new Map<number, R>();
  private readonly players;

  constructor(playersMap: Map<number, P>, destroyOnExit = true) {
    this.players = playersMap;
    raceCPBus.on(raceCPHooks.created, (checkpoint: R) => {
      this.raceCPs.set(checkpoint.id, checkpoint);
    });
    raceCPBus.on(raceCPHooks.destroyed, (checkpoint: R) => {
      this.raceCPs.delete(checkpoint.id);
    });
    if (destroyOnExit) {
      OnGameModeExit(() => {
        this.raceCPs.forEach((r) => r.destroy());
        this.raceCPs.clear();
      });
    }
    OnPlayerEnterDynamicRaceCP(
      (playerid: number, checkpointid: number): number => {
        const cp = this.raceCPs.get(checkpointid);
        if (!cp) return 0;
        const p = this.players.get(playerid);
        if (!p) return 0;
        const pFn = promisifyCallback.call(
          this,
          this.onPlayerEnter,
          "OnPlayerEnterDynamicRaceCP"
        );
        return pFn(p, cp);
      }
    );
    OnPlayerLeaveDynamicRaceCP(
      (playerid: number, checkpointid: number): number => {
        const cp = this.raceCPs.get(checkpointid);
        if (!cp) return 0;
        const p = this.players.get(playerid);
        if (!p) return 0;
        const pFn = promisifyCallback.call(
          this,
          this.onPlayerLeave,
          "OnPlayerLeaveDynamicRaceCP"
        );
        return pFn(p, cp);
      }
    );
    Streamer.onItemStreamIn((type, item, player) => {
      if (type === StreamerItemTypes.RACE_CP) {
        const cp = this.raceCPs.get(item);
        const p = this.players.get(player);
        if (cp && p)
          return promisifyCallback.call(
            this,
            this.onStreamIn,
            "Streamer_OnItemStreamIn"
          )(cp, p);
      }
      return 1;
    });
    Streamer.onItemStreamOut((type, item, player) => {
      if (type === StreamerItemTypes.RACE_CP) {
        const cp = this.raceCPs.get(item);
        const p = this.players.get(player);
        if (cp && p)
          return promisifyCallback.call(
            this,
            this.onStreamOut,
            "Streamer_OnItemStreamOut"
          )(cp, p);
      }
      return 1;
    });
  }

  protected abstract onPlayerEnter(player: P, checkpoint: R): TCommonCallback;
  protected abstract onPlayerLeave(player: P, checkpoint: R): TCommonCallback;
  protected abstract onStreamIn(checkpoint: R, player: P): TCommonCallback;
  protected abstract onStreamOut(checkpoint: R, player: P): TCommonCallback;

  public getRaceCPsArr(): Array<R> {
    return [...this.raceCPs.values()];
  }

  public getRaceCPsMap(): Map<number, R> {
    return this.raceCPs;
  }
}
