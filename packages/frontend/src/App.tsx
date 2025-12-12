import { useClerk } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useSaveData } from "./api";
import { ErrorScreen } from "./components/auth/ErrorScreen";
import { LoadingScreen } from "./components/auth/LoadingScreen";
import { WelcomeScreen } from "./components/auth/WelcomeScreen";
import { GameContainer } from "./components/game/GameContainer";
import { SaveStatus } from "./components/game/SaveStatus";
import { MapScreen } from "./components/map/MapScreen";
import { useAuthState } from "./hooks/useAuthState";
import { useGameState } from "./hooks/useGameState";
import type { Direction, EncounterResult } from "./hooks/useMapState";
import { useMapState } from "./hooks/useMapState";

function App() {
  const clerk = useClerk();
  const { state: authState, needsInitialization, initializeNewPlayer, retry } = useAuthState();
  const { data: saveData, saving, hasPendingCache, lastSavedAt } = useSaveData();
  const { state: gameState, setParty, setInventory, setLoaded } = useGameState();
  const { state: mapState, setPosition, move } = useMapState();

  // セーブデータをゲーム状態に反映
  useEffect(() => {
    if (saveData && !gameState.isLoaded) {
      setParty(saveData.party);
      setInventory(saveData.inventory);
      setPosition(saveData.position);
      setLoaded();
    }
  }, [saveData, gameState.isLoaded, setParty, setInventory, setPosition, setLoaded]);

  // 新規プレイヤーの初期化が必要な場合は自動実行
  useEffect(() => {
    if (needsInitialization) {
      initializeNewPlayer();
    }
  }, [needsInitialization, initializeNewPlayer]);

  // 移動処理
  const handleMove = (direction: Direction) => {
    return move(direction);
  };

  // エンカウント処理
  const handleEncounter = (encounter: EncounterResult) => {
    // エンカウント処理（将来実装）
    console.log("Encounter:", encounter);
  };

  // キー入力ハンドラ
  const handleKeyDown = (key: string) => {
    if (gameState.currentScreen === "map" && mapState.currentMap) {
      let direction: Direction | null = null;
      switch (key.toLowerCase()) {
        case "w":
        case "arrowup":
          direction = "up";
          break;
        case "s":
        case "arrowdown":
          direction = "down";
          break;
        case "a":
        case "arrowleft":
          direction = "left";
          break;
        case "d":
        case "arrowright":
          direction = "right";
          break;
      }
      if (direction) {
        const result = move(direction);
        if (result.encounter?.occurred) {
          handleEncounter(result.encounter);
        }
      }
    }
  };

  // 画面に応じたコンテンツをレンダリング
  const renderContent = () => {
    switch (authState.currentScreen) {
      case "welcome":
        return (
          <WelcomeScreen onSignIn={() => clerk.openSignIn()} onSignUp={() => clerk.openSignUp()} />
        );

      case "loading":
        return <LoadingScreen message="ゲームデータを読み込み中..." />;

      case "error":
        return <ErrorScreen error={authState.error} onRetry={retry} />;

      case "game":
        return (
          <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
            {/* セーブ状態表示 */}
            <div className="mb-2 self-end">
              <SaveStatus
                saving={saving}
                hasPendingCache={hasPendingCache}
                lastSavedAt={lastSavedAt}
              />
            </div>
            <GameContainer currentScreen={gameState.currentScreen} onKeyDown={handleKeyDown}>
              {gameState.currentScreen === "map" && mapState.currentMap && (
                <MapScreen
                  mapData={mapState.currentMap}
                  playerX={mapState.position.x}
                  playerY={mapState.position.y}
                  onMove={handleMove}
                  onEncounter={handleEncounter}
                />
              )}
              {gameState.currentScreen === "map" && !mapState.currentMap && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-400">マップデータを読み込み中...</p>
                </div>
              )}
            </GameContainer>
          </div>
        );

      default:
        return <LoadingScreen />;
    }
  };

  return renderContent();
}

export default App;
