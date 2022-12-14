import { logger } from "@/logger";
import { InvalidEnum } from "@/enums";
import { BasePlayer } from "@/controllers/player";
import { BaseVehicle } from "@/controllers/vehicle";
import { TDynamicArea, TDynamicAreaTypes } from "@/types";
import { areaBus, areaHooks } from "./areaBus";
import {
  AttachDynamicAreaToObject,
  AttachDynamicAreaToPlayer,
  AttachDynamicAreaToVehicle,
  CreateDynamicCircle,
  CreateDynamicCircleEx,
  CreateDynamicCuboid,
  CreateDynamicCuboidEx,
  CreateDynamicCylinder,
  CreateDynamicCylinderEx,
  CreateDynamicPolygon,
  CreateDynamicPolygonEx,
  CreateDynamicRectangle,
  CreateDynamicRectangleEx,
  CreateDynamicSphere,
  CreateDynamicSphereEx,
  DestroyDynamicArea,
  GetDynamicAreasForLine,
  GetDynamicAreasForPoint,
  GetDynamicAreaType,
  GetDynamicPolygonNumberPoints,
  GetDynamicPolygonPoints,
  GetNumberDynamicAreasForLine,
  GetNumberDynamicAreasForPoint,
  GetPlayerDynamicAreas,
  GetPlayerNumberDynamicAreas,
  IsAnyPlayerInAnyDynamicArea,
  IsAnyPlayerInDynamicArea,
  IsLineInAnyDynamicArea,
  IsLineInDynamicArea,
  IsPlayerInAnyDynamicArea,
  IsPlayerInDynamicArea,
  IsPointInAnyDynamicArea,
  IsPointInDynamicArea,
  IsToggleDynAreaSpectateMode,
  IsValidDynamicArea,
  StreamerAreaTypes,
  StreamerItemTypes,
  StreamerObjectTypes,
  ToggleDynAreaSpectateMode,
} from "omp-wrapper-streamer";
import { DynamicObject } from "../object";
import { Streamer } from "../common";

export class DynamicArea {
  private sourceInfo: TDynamicArea;
  private _id = -1;
  public get type(): TDynamicAreaTypes {
    return this.sourceInfo.type;
  }
  public get id(): number {
    return this._id;
  }
  constructor(area: TDynamicArea) {
    this.sourceInfo = area;
  }
  public create(): void | this {
    if (this.id !== -1)
      return logger.warn("[StreamerArea]: Unable to create area again");
    let { worldid, interiorid, playerid } = this.sourceInfo;
    const { type, extended } = this.sourceInfo;

    if (extended) {
      if (typeof worldid === "number") worldid = [-1];
      else worldid ??= [-1];
      if (typeof interiorid === "number") interiorid = [-1];
      else interiorid ??= [-1];
      if (typeof playerid === "number") playerid = [-1];
      else playerid ??= [-1];

      if (type === "circle") {
        const { x, y, size } = this.sourceInfo;
        if (size < 0)
          return logger.error("[StreamerArea]: Invalid circle extend size");
        this._id = CreateDynamicCircleEx(
          x,
          y,
          size,
          worldid,
          interiorid,
          playerid
        );
      } else if (type === "cuboid") {
        const { minx, miny, minz, maxx, maxy, maxz } = this.sourceInfo;
        this._id = CreateDynamicCuboidEx(
          minx,
          miny,
          minz,
          maxx,
          maxy,
          maxz,
          worldid,
          interiorid,
          playerid
        );
      } else if (type === "cylinder") {
        const { x, y, minz, maxz, size } = this.sourceInfo;
        if (size < 0)
          return logger.error("[StreamerArea]: Invalid cylinder extend size");
        this._id = CreateDynamicCylinderEx(
          x,
          y,
          minz,
          maxz,
          size,
          worldid,
          interiorid,
          playerid
        );
      } else if (type === "polygon") {
        const { points, minz, maxz } = this.sourceInfo;
        if (points.length % 2 !== 0)
          return logger.warn(
            "[StreamerArea]: Unable to create polygon extended with asymmetrical points"
          );
        this._id = CreateDynamicPolygonEx(
          points,
          minz,
          maxz,
          worldid,
          interiorid,
          playerid
        );
      } else if (type === "rectangle") {
        const { minx, miny, maxx, maxy } = this.sourceInfo;
        this._id = CreateDynamicRectangleEx(
          minx,
          miny,
          maxx,
          maxy,
          worldid,
          interiorid,
          playerid
        );
      } else {
        const { x, y, z, size } = this.sourceInfo;
        if (size < 0)
          return logger.error("[StreamerArea]: Invalid sphere extended size");
        this._id = CreateDynamicSphereEx(
          x,
          y,
          z,
          size,
          worldid,
          interiorid,
          playerid
        );
      }
    } else {
      if (Array.isArray(worldid)) worldid = -1;
      else worldid ??= -1;
      if (Array.isArray(interiorid)) interiorid = -1;
      else interiorid ??= -1;
      if (Array.isArray(playerid)) playerid = -1;
      else playerid ??= -1;

      if (type === "circle") {
        const { x, y, size } = this.sourceInfo;
        if (size < 0)
          return logger.error("[StreamerArea]: Invalid circle size");
        this._id = CreateDynamicCircle(
          x,
          y,
          size,
          worldid,
          interiorid,
          playerid
        );
      } else if (type === "cuboid") {
        const { minx, miny, minz, maxx, maxy, maxz } = this.sourceInfo;
        this._id = CreateDynamicCuboid(
          minx,
          miny,
          minz,
          maxx,
          maxy,
          maxz,
          worldid,
          interiorid,
          playerid
        );
      } else if (type === "cylinder") {
        const { x, y, minz, maxz, size } = this.sourceInfo;
        if (size < 0)
          return logger.error("[StreamerArea]: Invalid cylinder size");
        this._id = CreateDynamicCylinder(
          x,
          y,
          minz,
          maxz,
          size,
          worldid,
          interiorid,
          playerid
        );
      } else if (type === "polygon") {
        const { points, minz, maxz } = this.sourceInfo;
        if (points.length % 2 !== 0)
          return logger.warn(
            "[StreamerArea]: Unable to create polygon with asymmetrical points"
          );
        this._id = CreateDynamicPolygon(
          points,
          minz,
          maxz,
          worldid,
          interiorid,
          playerid
        );
      } else if (type === "rectangle") {
        const { minx, miny, maxx, maxy } = this.sourceInfo;
        this._id = CreateDynamicRectangle(
          minx,
          miny,
          maxx,
          maxy,
          worldid,
          interiorid,
          playerid
        );
      } else {
        const { x, y, z, size } = this.sourceInfo;
        if (size < 0)
          return logger.error("[StreamerArea]: Invalid sphere size");
        this._id = CreateDynamicSphere(
          x,
          y,
          z,
          size,
          worldid,
          interiorid,
          playerid
        );
      }
    }
    areaBus.emit(areaHooks.created, this);
    return this;
  }
  public destroy(): void | this {
    if (this.id === -1)
      return logger.warn(
        "[StreamerArea]: Unable to destroy the area before create"
      );
    DestroyDynamicArea(this.id);
    areaBus.emit(areaHooks.destroyed, this);
    return this;
  }
  public isValid(): boolean {
    if (this.id === -1) return false;
    return IsValidDynamicArea(this.id);
  }
  public getType(): void | StreamerAreaTypes {
    if (this.id !== -1)
      return logger.warn("[StreamerArea]: Unable to get type before create");
    return GetDynamicAreaType(this.id);
  }
  public getPolygonPoints(): void | number[] {
    if (this.id !== -1)
      return logger.warn(
        "[StreamerArea]: Unable to get polygon points before create"
      );
    if (this.type !== "polygon") return undefined;
    return GetDynamicPolygonPoints(this.id);
  }
  public getPolygonNumberPoints(): void | number {
    if (this.id !== -1)
      return logger.warn(
        "[StreamerArea]: Unable to get polygon points number before create"
      );
    if (this.type !== "polygon") return undefined;
    return GetDynamicPolygonNumberPoints(this.id);
  }
  public isPlayerIn<P extends BasePlayer>(player: P, recheck = false): boolean {
    if (this.id === -1) return false;
    return IsPlayerInDynamicArea(player.id, this.id, recheck);
  }
  public static isPlayerInAny<P extends BasePlayer>(
    player: P,
    recheck = false
  ): boolean {
    return IsPlayerInAnyDynamicArea(player.id, recheck);
  }
  public isAnyPlayerIn(recheck = false): boolean {
    if (this.id === -1) return false;
    return IsAnyPlayerInDynamicArea(this.id, recheck);
  }
  public static isAnyPlayerInAny(recheck = false): boolean {
    return IsAnyPlayerInAnyDynamicArea(recheck);
  }
  public static getPlayerAreas<P extends BasePlayer, A extends DynamicArea>(
    player: P,
    areas: Map<number, A>
  ): Array<A | undefined> {
    if (!DynamicArea.getPlayerAreasNumber(player)) return [];
    const ids = GetPlayerDynamicAreas(player.id);
    return ids.map((a) => areas.get(a));
  }
  public static getPlayerAreasNumber<P extends BasePlayer>(player: P) {
    return GetPlayerNumberDynamicAreas(player.id);
  }
  public isPointIn(x: number, y: number, z: number): boolean {
    if (this.id === -1) return false;
    return IsPointInDynamicArea(this.id, x, y, z);
  }
  public static isPointInAny(x: number, y: number, z: number): boolean {
    return IsPointInAnyDynamicArea(x, y, z);
  }
  public isLineIn(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number
  ): boolean {
    if (this.id === -1) return false;
    return IsLineInDynamicArea(this.id, x1, y1, z1, x2, y2, z2);
  }
  public static isLineInAny(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number
  ): boolean {
    return IsLineInAnyDynamicArea(x1, y1, z1, x2, y2, z2);
  }
  public static getForPoint<A extends DynamicArea>(
    x: number,
    y: number,
    z: number,
    areas: Map<number, A>
  ): Array<A | undefined> {
    if (!DynamicArea.getNumberForPoint(x, y, z)) return [];
    const ids = GetDynamicAreasForPoint(x, y, z);
    return ids.map((a) => areas.get(a));
  }
  public static getNumberForPoint(x: number, y: number, z: number): number {
    return GetNumberDynamicAreasForPoint(x, y, z);
  }
  public static getForLine<A extends DynamicArea>(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    areas: Map<number, A>
  ): Array<A | undefined> {
    if (!DynamicArea.getNumberForLine(x1, y1, z1, x2, y2, z2)) return [];
    const ids = GetDynamicAreasForLine(x1, y1, z1, x2, y2, z2);
    return ids.map((a) => areas.get(a));
  }
  public static getNumberForLine(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number
  ): number {
    return GetNumberDynamicAreasForLine(x1, y1, z1, x2, y2, z2);
  }
  public attachToObject<O extends DynamicObject>(
    obj: O,
    offsetx = 0.0,
    offsety = 0.0,
    offsetz = 0.0
  ): void | number {
    if (this.id === -1 || obj.id === -1)
      return logger.warn(
        "[StreamerArea]: Unable to toggle attach to object before create"
      );
    return AttachDynamicAreaToObject(
      this.id,
      obj.id,
      StreamerObjectTypes.DYNAMIC,
      InvalidEnum.PLAYER_ID,
      offsetx,
      offsety,
      offsetz
    );
  }
  public attachToPlayer<P extends BasePlayer>(
    player: P,
    offsetx = 0.0,
    offsety = 0.0,
    offsetz = 0.0
  ): void | number {
    if (this.id === -1 || player.id === -1)
      return logger.warn(
        "[StreamerArea]: Unable to toggle attach to player before create"
      );
    return AttachDynamicAreaToPlayer(
      this.id,
      player.id,
      offsetx,
      offsety,
      offsetz
    );
  }
  public attachToVehicle<V extends BaseVehicle>(
    vehicle: V,
    offsetx = 0.0,
    offsety = 0.0,
    offsetz = 0.0
  ): void | number {
    if (this.id === -1 || vehicle.id === -1)
      return logger.warn(
        "[StreamerArea]: Unable to toggle attach to vehicle before create"
      );
    return AttachDynamicAreaToVehicle(
      this.id,
      vehicle.id,
      offsetx,
      offsety,
      offsetz
    );
  }
  public toggleSpectateMode(toggle: boolean): void | number {
    if (this.id === -1)
      return logger.warn(
        "[StreamerArea]: Unable to toggle specate mode before create"
      );
    return ToggleDynAreaSpectateMode(this.id, toggle);
  }
  public isToggleSpectateMode(): boolean {
    if (this.id === -1) return false;
    return IsToggleDynAreaSpectateMode(this.id);
  }
  public toggleCallbacks(toggle = true): void | number {
    if (this.id === -1)
      return logger.warn(
        "[StreamerArea]: Unable to toggle callbacks before create"
      );
    return Streamer.toggleItemCallbacks(
      StreamerItemTypes.AREA,
      this.id,
      toggle
    );
  }
  public isToggleCallbacks(): boolean {
    if (this.id === -1) false;
    return Streamer.isToggleItemCallbacks(StreamerItemTypes.AREA, this.id);
  }
}
