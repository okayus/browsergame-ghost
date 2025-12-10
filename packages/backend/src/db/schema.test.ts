import { describe, expect, it } from "vitest";
import {
  ghostSpecies,
  items,
  learnableMoves,
  moves,
  playerGhostMoves,
  playerGhosts,
  playerItems,
  players,
} from "./schema";

describe("Database Schema", () => {
  it("should have ghost_species table defined", () => {
    expect(ghostSpecies).toBeDefined();
  });

  it("should have moves table defined", () => {
    expect(moves).toBeDefined();
  });

  it("should have learnable_moves table defined", () => {
    expect(learnableMoves).toBeDefined();
  });

  it("should have items table defined", () => {
    expect(items).toBeDefined();
  });

  it("should have players table defined", () => {
    expect(players).toBeDefined();
  });

  it("should have player_ghosts table defined", () => {
    expect(playerGhosts).toBeDefined();
  });

  it("should have player_ghost_moves table defined", () => {
    expect(playerGhostMoves).toBeDefined();
  });

  it("should have player_items table defined", () => {
    expect(playerItems).toBeDefined();
  });
});
