import { useClerk } from "@clerk/clerk-react";
import {
  ALL_GHOST_SPECIES,
  ALL_MOVES,
  type GhostSpecies,
  type GhostType,
  generateWildGhost,
  getGhostSpeciesById,
  getMapById,
  getMoveById,
  type PlayerData,
} from "@ghost-game/shared";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useAutoSave, useInitializePlayerMutation, useSaveDataQuery } from "./api/useSaveData";
import { ErrorScreen } from "./components/auth/ErrorScreen";
import { LoadingScreen } from "./components/auth/LoadingScreen";
import { WelcomeScreen } from "./components/auth/WelcomeScreen";
import { BattleScreen } from "./components/battle/BattleScreen";
import { type BattleCommand, CommandPanel } from "./components/battle/CommandPanel";
import { type DisplayMove, SkillSelectPanel } from "./components/battle/SkillSelectPanel";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { GameContainer } from "./components/game/GameContainer";
import { SaveStatus } from "./components/game/SaveStatus";
import { MapScreen } from "./components/map/MapScreen";
import { type MenuItem, MenuScreen } from "./components/menu/MenuScreen";
import { PartyScreen } from "./components/party/PartyScreen";
import { useAuthState } from "./hooks/useAuthState";
import { useBattleEndSync } from "./hooks/useBattleEndSync";
import { useBattleState } from "./hooks/useBattleState";
import { useGameState } from "./hooks/useGameState";
import type { Direction, EncounterResult } from "./hooks/useMapState";
import { useMapState } from "./hooks/useMapState";

/**
 * 認証済みユーザー向けのゲームコンテンツ
 *
 * Suspense内で使用され、useSuspenseQueryでデータ取得を行う
 */
function AuthenticatedContent() {
  const { data: saveData } = useSaveDataQuery();
  const initializeMutation = useInitializePlayerMutation();
  const { saving, hasPendingCache, lastSavedAt, updatePendingSaveData } = useAutoSave();

  const gameStateHook = useGameState();
  const { state: gameState, setScreen, setParty, setInventory, setLoaded } = gameStateHook;
  const { state: mapState, setMap, setPosition, move } = useMapState();
  const {
    state: battleState,
    startBattle,
    setPhase,
    executePlayerAction,
    reset: resetBattle,
  } = useBattleState();

  // バトル終了時のHP同期
  const { syncPartyHp } = useBattleEndSync(gameStateHook, updatePendingSaveData);

  // バトル中のゴーストタイプを保持
  const [playerGhostType, setPlayerGhostType] = useState<GhostType | null>(null);
  const [enemyGhostType, setEnemyGhostType] = useState<GhostType | null>(null);
  // キー入力状態（パネルに渡すため）
  const [keyInput, setKeyInput] = useState<string | undefined>(undefined);

  // ゴースト種族データのマップを作成
  const speciesMap = useMemo(() => {
    return ALL_GHOST_SPECIES.reduce(
      (acc, species) => {
        acc[species.id] = species;
        return acc;
      },
      {} as Record<string, GhostSpecies>,
    );
  }, []);

  // ロードしたデータをゲーム状態に適用
  const applyLoadedData = useCallback(
    (data: PlayerData) => {
      setParty(data.party);
      setInventory(data.inventory);
      setPosition(data.position);

      // マップデータをロード
      const mapData = getMapById(data.position.mapId);
      if (mapData) {
        setMap(mapData);
      }

      setLoaded();
    },
    [setParty, setInventory, setPosition, setMap, setLoaded],
  );

  // 新規プレイヤーの初期化（saveDataがnullの場合）
  useEffect(() => {
    if (saveData === null && !initializeMutation.isPending && !initializeMutation.isSuccess) {
      initializeMutation.mutate();
    }
  }, [saveData, initializeMutation]);

  // セーブデータをゲーム状態に反映（初回のみ）
  useEffect(() => {
    if (saveData && !gameState.isLoaded) {
      applyLoadedData(saveData);
    }
  }, [saveData, gameState.isLoaded, applyLoadedData]);

  // 移動処理
  const handleMove = (direction: Direction) => {
    return move(direction);
  };

  // エンカウント処理
  const handleEncounter = useCallback(
    (encounter: EncounterResult) => {
      if (!encounter.occurred || !encounter.speciesId || !encounter.level) {
        return;
      }

      // パーティから先頭のゴーストを取得
      const playerGhost = gameState.party?.ghosts[0];
      if (!playerGhost) {
        console.error("No player ghost available for battle");
        return;
      }

      // 野生ゴーストを生成
      const wildGhost = generateWildGhost(encounter.speciesId, encounter.level);
      if (!wildGhost) {
        console.error("Failed to generate wild ghost:", encounter.speciesId);
        return;
      }

      // ゴーストタイプを取得
      const playerSpecies = getGhostSpeciesById(playerGhost.speciesId);
      const enemySpecies = getGhostSpeciesById(encounter.speciesId);
      if (!playerSpecies || !enemySpecies) {
        console.error("Failed to get ghost species");
        return;
      }

      // タイプを保存
      setPlayerGhostType(playerSpecies.type);
      setEnemyGhostType(enemySpecies.type);

      // バトル開始
      startBattle(playerGhost, wildGhost, enemySpecies.type);
      setScreen("battle");
    },
    [gameState.party?.ghosts, startBattle, setScreen],
  );

  // バトルコマンド選択ハンドラ
  const handleBattleCommand = useCallback(
    (command: BattleCommand) => {
      switch (command) {
        case "fight":
          setPhase("move_select");
          break;
        case "item":
          // アイテム選択（将来実装）
          break;
        case "capture":
          // 捕獲処理
          if (playerGhostType && enemyGhostType) {
            const result = executePlayerAction(
              { type: "capture", itemBonus: 1.0 },
              playerGhostType,
              enemyGhostType,
            );
            if (result.battleEnded && battleState.endReason) {
              // HP同期（捕獲成功時）
              const activeGhostId = gameState.party?.ghosts[0]?.id;
              if (activeGhostId) {
                syncPartyHp(battleState, battleState.endReason, activeGhostId);
              }
              // バトル終了処理
              setTimeout(() => {
                resetBattle();
                setScreen("map");
                setPlayerGhostType(null);
                setEnemyGhostType(null);
              }, 2000);
            }
          }
          break;
        case "run":
          // 逃走処理
          if (playerGhostType && enemyGhostType) {
            const result = executePlayerAction({ type: "escape" }, playerGhostType, enemyGhostType);
            if (result.battleEnded && battleState.endReason) {
              // HP同期（逃走成功時）
              const activeGhostId = gameState.party?.ghosts[0]?.id;
              if (activeGhostId) {
                syncPartyHp(battleState, battleState.endReason, activeGhostId);
              }
              // 逃走成功
              setTimeout(() => {
                resetBattle();
                setScreen("map");
                setPlayerGhostType(null);
                setEnemyGhostType(null);
              }, 1500);
            }
          }
          break;
      }
    },
    [
      playerGhostType,
      enemyGhostType,
      battleState,
      gameState.party?.ghosts,
      setPhase,
      executePlayerAction,
      syncPartyHp,
      resetBattle,
      setScreen,
    ],
  );

  // 技選択ハンドラ
  const handleMoveSelect = useCallback(
    (moveId: string) => {
      if (!battleState.playerGhost || !playerGhostType || !enemyGhostType) {
        return;
      }

      const moveIndex = battleState.playerGhost.ghost.moves.findIndex((m) => m.moveId === moveId);
      if (moveIndex === -1) {
        return;
      }

      const result = executePlayerAction(
        { type: "attack", moveIndex },
        playerGhostType,
        enemyGhostType,
      );

      if (result.battleEnded && battleState.endReason) {
        // HP同期（勝利/敗北時）
        const activeGhostId = gameState.party?.ghosts[0]?.id;
        if (activeGhostId) {
          syncPartyHp(battleState, battleState.endReason, activeGhostId);
        }
        // バトル終了処理
        setTimeout(() => {
          resetBattle();
          setScreen("map");
          setPlayerGhostType(null);
          setEnemyGhostType(null);
        }, 2000);
      } else {
        // コマンド選択に戻る
        setPhase("command_select");
      }
    },
    [
      battleState.playerGhost,
      battleState.endReason,
      gameState.party?.ghosts,
      playerGhostType,
      enemyGhostType,
      executePlayerAction,
      syncPartyHp,
      resetBattle,
      setScreen,
      setPhase,
    ],
  );

  // 技選択から戻る
  const handleMoveSelectBack = useCallback(() => {
    setPhase("command_select");
  }, [setPhase]);

  // プレイヤーゴーストの技情報を取得
  const getPlayerMoves = useCallback((): DisplayMove[] => {
    if (!battleState.playerGhost) {
      return [];
    }

    return battleState.playerGhost.ghost.moves
      .map((ownedMove) => {
        const moveData = getMoveById(ownedMove.moveId);
        if (!moveData) {
          return null;
        }
        return { move: moveData, ownedMove };
      })
      .filter((m): m is DisplayMove => m !== null);
  }, [battleState.playerGhost]);

  // メニューを開く
  const handleOpenMenu = useCallback(() => {
    setScreen("menu");
  }, [setScreen]);

  // メニューを閉じる
  const handleCloseMenu = useCallback(() => {
    setScreen("map");
  }, [setScreen]);

  // メニュー項目選択ハンドラ
  const handleMenuSelect = useCallback(
    (item: MenuItem) => {
      switch (item) {
        case "party":
          setScreen("party");
          break;
        case "items":
          // アイテム画面（将来実装）
          console.log("Items screen - not implemented");
          break;
        case "save":
          // セーブ機能（将来実装）
          console.log("Save - not implemented");
          break;
        case "settings":
          // 設定画面（将来実装）
          console.log("Settings screen - not implemented");
          break;
        case "close":
          handleCloseMenu();
          break;
      }
    },
    [setScreen, handleCloseMenu],
  );

  // パーティ画面を閉じる
  const handleCloseParty = useCallback(() => {
    setScreen("menu");
  }, [setScreen]);

  // キー入力ハンドラ
  const handleKeyDown = (key: string) => {
    // バトル画面のキー入力
    if (gameState.currentScreen === "battle") {
      setKeyInput(key);
      // 次のフレームでリセット
      setTimeout(() => setKeyInput(undefined), 0);
      return;
    }

    // メニュー画面のキー入力
    if (gameState.currentScreen === "menu") {
      setKeyInput(key);
      // 次のフレームでリセット
      setTimeout(() => setKeyInput(undefined), 0);
      return;
    }

    // パーティ画面のキー入力
    if (gameState.currentScreen === "party") {
      setKeyInput(key);
      // 次のフレームでリセット
      setTimeout(() => setKeyInput(undefined), 0);
      return;
    }

    // マップ画面のキー入力
    if (gameState.currentScreen === "map" && mapState.currentMap) {
      // Escapeキーでメニューを開く
      if (key === "Escape") {
        handleOpenMenu();
        return;
      }

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

  // 初期化中またはデータなしの場合はローディング
  if (saveData === null || initializeMutation.isPending) {
    return <LoadingScreen message="プレイヤーデータを初期化中..." />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      {/* セーブ状態表示 */}
      <div className="mb-2 self-end">
        <SaveStatus saving={saving} hasPendingCache={hasPendingCache} lastSavedAt={lastSavedAt} />
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
        {gameState.currentScreen === "battle" && (
          <BattleScreen
            phase={battleState.phase}
            playerGhost={battleState.playerGhost}
            enemyGhost={battleState.enemyGhost}
            playerGhostType={playerGhostType ?? undefined}
            enemyGhostType={enemyGhostType ?? undefined}
            messages={battleState.messages}
            commandPanel={
              battleState.phase === "command_select" ? (
                <CommandPanel
                  onSelectCommand={handleBattleCommand}
                  canCapture={true}
                  onKeyInput={keyInput}
                />
              ) : battleState.phase === "move_select" ? (
                <SkillSelectPanel
                  moves={getPlayerMoves()}
                  onSelectMove={handleMoveSelect}
                  onBack={handleMoveSelectBack}
                  onKeyInput={keyInput}
                />
              ) : undefined
            }
          />
        )}
        {gameState.currentScreen === "menu" && (
          <MenuScreen
            onSelectItem={handleMenuSelect}
            onClose={handleCloseMenu}
            onKeyInput={keyInput}
          />
        )}
        {gameState.currentScreen === "party" && gameState.party && (
          <PartyScreen
            party={gameState.party.ghosts}
            speciesMap={speciesMap}
            moves={ALL_MOVES}
            onClose={handleCloseParty}
            onKeyInput={keyInput}
          />
        )}
      </GameContainer>
    </div>
  );
}

/**
 * メインアプリケーションコンポーネント
 *
 * 認証状態に応じて適切な画面を表示する。
 * 認証済みの場合はSuspense + ErrorBoundaryでゲームコンテンツをラップ。
 */
function App() {
  const clerk = useClerk();
  const { state: authState } = useAuthState();

  // 認証読み込み中
  if (authState.currentScreen === "loading") {
    return <LoadingScreen message="認証情報を確認中..." />;
  }

  // 未認証
  if (authState.currentScreen === "welcome") {
    return (
      <WelcomeScreen onSignIn={() => clerk.openSignIn()} onSignUp={() => clerk.openSignUp()} />
    );
  }

  // 認証済み - Suspense + ErrorBoundary でゲームコンテンツをラップ
  return (
    <ErrorBoundary
      fallback={(error, reset) => <ErrorScreen error={error.message} onRetry={reset} />}
    >
      <Suspense fallback={<LoadingScreen message="ゲームデータを読み込み中..." />}>
        <AuthenticatedContent />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
