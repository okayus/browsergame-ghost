import type { MapData } from "@ghost-game/shared";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapGrid } from "./MapGrid";

const createMockMapData = (): MapData => ({
  id: "test-map",
  name: "Test Map",
  width: 4,
  height: 3,
  tiles: [
    // y=0
    [
      { type: "wall", walkable: false, encounterRate: 0 },
      { type: "ground", walkable: true, encounterRate: 0 },
      { type: "grass", walkable: true, encounterRate: 0.1 },
      { type: "wall", walkable: false, encounterRate: 0 },
    ],
    // y=1
    [
      { type: "wall", walkable: false, encounterRate: 0 },
      { type: "ground", walkable: true, encounterRate: 0 },
      { type: "ground", walkable: true, encounterRate: 0 },
      { type: "water", walkable: false, encounterRate: 0 },
    ],
    // y=2
    [
      { type: "wall", walkable: false, encounterRate: 0 },
      { type: "wall", walkable: false, encounterRate: 0 },
      { type: "wall", walkable: false, encounterRate: 0 },
      { type: "wall", walkable: false, encounterRate: 0 },
    ],
  ],
  encounters: [],
});

describe("MapGrid", () => {
  describe("rendering", () => {
    it("should render map grid with correct dimensions", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      const grid = screen.getByTestId("map-grid");
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveAttribute("data-width", "4");
      expect(grid).toHaveAttribute("data-height", "3");
    });

    it("should render correct number of tiles", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      // 4 x 3 = 12 tiles
      const tiles = screen.getAllByTestId(/^tile-\d+-\d+$/);
      expect(tiles).toHaveLength(12);
    });

    it("should render tiles with correct coordinates", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      expect(screen.getByTestId("tile-0-0")).toBeInTheDocument();
      expect(screen.getByTestId("tile-3-0")).toBeInTheDocument();
      expect(screen.getByTestId("tile-0-2")).toBeInTheDocument();
      expect(screen.getByTestId("tile-3-2")).toBeInTheDocument();
    });
  });

  describe("tile types", () => {
    it("should render wall tiles with correct data attribute", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      const wallTile = screen.getByTestId("tile-0-0");
      expect(wallTile).toHaveAttribute("data-tile-type", "wall");
      expect(wallTile).toHaveAttribute("data-walkable", "false");
    });

    it("should render ground tiles with correct data attribute", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      const groundTile = screen.getByTestId("tile-1-0");
      expect(groundTile).toHaveAttribute("data-tile-type", "ground");
      expect(groundTile).toHaveAttribute("data-walkable", "true");
    });

    it("should render grass tiles with correct data attribute", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      const grassTile = screen.getByTestId("tile-2-0");
      expect(grassTile).toHaveAttribute("data-tile-type", "grass");
      expect(grassTile).toHaveAttribute("data-walkable", "true");
    });

    it("should render water tiles with correct data attribute", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      const waterTile = screen.getByTestId("tile-3-1");
      expect(waterTile).toHaveAttribute("data-tile-type", "water");
      expect(waterTile).toHaveAttribute("data-walkable", "false");
    });
  });

  describe("player marker", () => {
    it("should render player marker at correct position", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      const playerMarker = screen.getByTestId("player-marker");
      expect(playerMarker).toBeInTheDocument();

      // Player marker should be inside tile-1-1
      const playerTile = screen.getByTestId("tile-1-1");
      expect(playerTile).toContainElement(playerMarker);
    });

    it("should move player marker when position changes", () => {
      const mapData = createMockMapData();
      const { rerender } = render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      let playerTile = screen.getByTestId("tile-1-1");
      expect(playerTile).toContainElement(screen.getByTestId("player-marker"));

      rerender(<MapGrid mapData={mapData} playerX={2} playerY={1} />);

      playerTile = screen.getByTestId("tile-2-1");
      expect(playerTile).toContainElement(screen.getByTestId("player-marker"));
    });

    it("should only have one player marker", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      const playerMarkers = screen.getAllByTestId("player-marker");
      expect(playerMarkers).toHaveLength(1);
    });
  });

  describe("tile size", () => {
    it("should use default tile size of 40px", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} />);

      const tile = screen.getByTestId("tile-0-0");
      expect(tile).toHaveStyle({ width: "40px", height: "40px" });
    });

    it("should use custom tile size when provided", () => {
      const mapData = createMockMapData();
      render(<MapGrid mapData={mapData} playerX={1} playerY={1} tileSize={32} />);

      const tile = screen.getByTestId("tile-0-0");
      expect(tile).toHaveStyle({ width: "32px", height: "32px" });
    });
  });
});
