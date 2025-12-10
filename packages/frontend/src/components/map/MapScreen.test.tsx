import type { MapData } from "@ghost-game/shared";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { EncounterResult } from "../../hooks/useMapState";
import { getDirectionFromKey, MapScreen } from "./MapScreen";

const createMockMapData = (): MapData => ({
  id: "test-map",
  name: "テストマップ",
  width: 4,
  height: 3,
  tiles: [
    [
      { type: "wall", walkable: false, encounterRate: 0 },
      { type: "ground", walkable: true, encounterRate: 0 },
      { type: "grass", walkable: true, encounterRate: 0.1 },
      { type: "wall", walkable: false, encounterRate: 0 },
    ],
    [
      { type: "wall", walkable: false, encounterRate: 0 },
      { type: "ground", walkable: true, encounterRate: 0 },
      { type: "ground", walkable: true, encounterRate: 0 },
      { type: "water", walkable: false, encounterRate: 0 },
    ],
    [
      { type: "wall", walkable: false, encounterRate: 0 },
      { type: "wall", walkable: false, encounterRate: 0 },
      { type: "wall", walkable: false, encounterRate: 0 },
      { type: "wall", walkable: false, encounterRate: 0 },
    ],
  ],
  encounters: [{ speciesId: "spiritpuff", weight: 100, minLevel: 2, maxLevel: 5 }],
});

describe("MapScreen", () => {
  describe("rendering", () => {
    it("should render map screen with map name", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: false, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
        />,
      );

      expect(screen.getByTestId("map-screen")).toBeInTheDocument();
      expect(screen.getByTestId("map-name")).toHaveTextContent("テストマップ");
    });

    it("should render map grid", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: false, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
        />,
      );

      expect(screen.getByTestId("map-grid")).toBeInTheDocument();
    });

    it("should render player marker at correct position", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: false, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={2}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
        />,
      );

      expect(screen.getByTestId("player-marker")).toBeInTheDocument();
      const playerTile = screen.getByTestId("tile-2-1");
      expect(playerTile).toContainElement(screen.getByTestId("player-marker"));
    });

    it("should display controls hint", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: false, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
        />,
      );

      expect(screen.getByTestId("controls-hint")).toBeInTheDocument();
    });

    it("should display position", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: false, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={3}
          playerY={2}
          onMove={onMove}
          onEncounter={onEncounter}
        />,
      );

      expect(screen.getByTestId("position-display")).toHaveTextContent("位置: (3, 2)");
    });
  });

  describe("key input handling", () => {
    it("should call onMove with up direction on W key", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: true, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
          onKeyInput="w"
        />,
      );

      expect(onMove).toHaveBeenCalledWith("up");
    });

    it("should call onMove with down direction on S key", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: true, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
          onKeyInput="s"
        />,
      );

      expect(onMove).toHaveBeenCalledWith("down");
    });

    it("should call onMove with left direction on A key", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: true, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
          onKeyInput="a"
        />,
      );

      expect(onMove).toHaveBeenCalledWith("left");
    });

    it("should call onMove with right direction on D key", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: true, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
          onKeyInput="d"
        />,
      );

      expect(onMove).toHaveBeenCalledWith("right");
    });

    it("should call onMove with arrow keys", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: true, encounter: null });
      const onEncounter = vi.fn();

      const { rerender } = render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
          onKeyInput="ArrowUp"
        />,
      );

      expect(onMove).toHaveBeenCalledWith("up");

      rerender(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
          onKeyInput="ArrowDown"
        />,
      );

      expect(onMove).toHaveBeenCalledWith("down");
    });

    it("should not call onMove for non-movement keys", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: false, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
          onKeyInput="Enter"
        />,
      );

      expect(onMove).not.toHaveBeenCalled();
    });
  });

  describe("encounter handling", () => {
    it("should call onEncounter when encounter occurs", () => {
      const mapData = createMockMapData();
      const mockEncounter: EncounterResult = {
        occurred: true,
        speciesId: "spiritpuff",
        level: 3,
      };
      const onMove = vi.fn().mockReturnValue({ success: true, encounter: mockEncounter });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
          onKeyInput="w"
        />,
      );

      expect(onEncounter).toHaveBeenCalledWith(mockEncounter);
    });

    it("should not call onEncounter when no encounter", () => {
      const mapData = createMockMapData();
      const onMove = vi.fn().mockReturnValue({ success: true, encounter: null });
      const onEncounter = vi.fn();

      render(
        <MapScreen
          mapData={mapData}
          playerX={1}
          playerY={1}
          onMove={onMove}
          onEncounter={onEncounter}
          onKeyInput="w"
        />,
      );

      expect(onEncounter).not.toHaveBeenCalled();
    });
  });
});

describe("getDirectionFromKey", () => {
  it("should return up for W and ArrowUp", () => {
    expect(getDirectionFromKey("w")).toBe("up");
    expect(getDirectionFromKey("W")).toBe("up");
    expect(getDirectionFromKey("ArrowUp")).toBe("up");
  });

  it("should return down for S and ArrowDown", () => {
    expect(getDirectionFromKey("s")).toBe("down");
    expect(getDirectionFromKey("S")).toBe("down");
    expect(getDirectionFromKey("ArrowDown")).toBe("down");
  });

  it("should return left for A and ArrowLeft", () => {
    expect(getDirectionFromKey("a")).toBe("left");
    expect(getDirectionFromKey("A")).toBe("left");
    expect(getDirectionFromKey("ArrowLeft")).toBe("left");
  });

  it("should return right for D and ArrowRight", () => {
    expect(getDirectionFromKey("d")).toBe("right");
    expect(getDirectionFromKey("D")).toBe("right");
    expect(getDirectionFromKey("ArrowRight")).toBe("right");
  });

  it("should return null for other keys", () => {
    expect(getDirectionFromKey("Enter")).toBeNull();
    expect(getDirectionFromKey("Escape")).toBeNull();
    expect(getDirectionFromKey("x")).toBeNull();
  });
});
