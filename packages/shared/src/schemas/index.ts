// Ghost and Move schemas (persisted to DB)

// Battle schemas (React state only, not persisted)
export {
  type BattleGhostState,
  BattleGhostStateSchema,
  type BattlePhase,
  BattlePhaseSchema,
  type BattleState,
  BattleStateSchema,
  type StatModifiers,
  StatModifiersSchema,
} from "./battle";
export {
  type BaseStats,
  BaseStatsSchema,
  type GhostSpecies,
  GhostSpeciesSchema,
  type GhostType,
  GhostTypeSchema,
  type LearnableMove,
  LearnableMoveSchema,
  type Move,
  MoveSchema,
  type OwnedGhost,
  OwnedGhostSchema,
  type OwnedMove,
  OwnedMoveSchema,
} from "./ghost";

// Item and Inventory schemas (persisted to DB)
export {
  type Inventory,
  type InventoryEntry,
  InventoryEntrySchema,
  InventorySchema,
  type Item,
  type ItemCategory,
  ItemCategorySchema,
  ItemSchema,
} from "./item";

// Player, Party, and Map schemas (persisted to DB)
export {
  type MapData,
  MapDataSchema,
  type MapTile,
  MapTileSchema,
  type Party,
  PartySchema,
  type PlayerData,
  PlayerDataSchema,
  type PlayerPosition,
  PlayerPositionSchema,
  type TileType,
  TileTypeSchema,
} from "./player";
