import type { GhostSpecies, GhostType, Move, OwnedGhost } from "@ghost-game/shared";

/**
 * GhostDetailPanelのProps
 */
export interface GhostDetailPanelProps {
  /** 表示するゴースト */
  ghost: OwnedGhost;
  /** ゴースト種族データ */
  species: GhostSpecies;
  /** 技データ配列 */
  moves: Move[];
  /** 閉じる時のコールバック */
  onClose: () => void;
}

/**
 * タイプの日本語名を取得
 */
function getTypeLabel(type: GhostType): string {
  const typeLabels: Record<GhostType, string> = {
    fire: "ほのお",
    water: "みず",
    grass: "くさ",
    electric: "でんき",
    ghost: "ゴースト",
    normal: "ノーマル",
  };
  return typeLabels[type];
}

/**
 * タイプに応じた背景色クラスを取得
 */
function getTypeBgClass(type: GhostType): string {
  const typeColors: Record<GhostType, string> = {
    fire: "bg-red-500",
    water: "bg-blue-500",
    grass: "bg-green-500",
    electric: "bg-yellow-500",
    ghost: "bg-purple-500",
    normal: "bg-gray-400",
  };
  return typeColors[type];
}

/**
 * ゴースト詳細パネルコンポーネント
 *
 * - ゴーストのタイプをアイコンまたはラベルで表示
 * - 能力値（HP、攻撃、防御、素早さ）を数値で表示
 * - 覚えている技一覧（最大4つ）を技名とタイプで表示
 * - 技のPP残量表示
 */
export function GhostDetailPanel({ ghost, species, moves, onClose }: GhostDetailPanelProps) {
  const displayName = ghost.nickname ?? species.name;
  const showSpeciesName = ghost.nickname !== undefined;

  return (
    <div
      className="w-full max-w-md rounded-lg border-4 border-ghost-primary bg-ghost-surface p-4 shadow-lg"
      data-testid="ghost-detail-panel"
    >
      {/* ヘッダー: 名前・レベル・閉じるボタン */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-ghost-text-bright">{displayName}</h2>
          {showSpeciesName && <p className="text-sm text-ghost-text-muted">{species.name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ghost-text-muted">Lv.{ghost.level}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-ghost-text-muted hover:bg-ghost-bg hover:text-ghost-text-bright"
            data-testid="close-button"
            aria-label="閉じる"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* タイプとHP */}
      <div className="mb-4 flex items-center gap-4">
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold text-white ${getTypeBgClass(species.type)}`}
          data-testid="ghost-type"
        >
          {getTypeLabel(species.type)}
        </span>
        <span className="text-sm text-ghost-text-muted" data-testid="current-hp">
          HP: {ghost.currentHp}/{ghost.maxHp}
        </span>
      </div>

      {/* 能力値 */}
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-bold text-ghost-text-bright">のうりょく</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between rounded bg-ghost-bg px-2 py-1">
            <span className="text-ghost-text-muted">HP</span>
            <span className="text-ghost-text-bright" data-testid="stat-hp">
              {ghost.stats.hp}
            </span>
          </div>
          <div className="flex justify-between rounded bg-ghost-bg px-2 py-1">
            <span className="text-ghost-text-muted">こうげき</span>
            <span className="text-ghost-text-bright" data-testid="stat-attack">
              {ghost.stats.attack}
            </span>
          </div>
          <div className="flex justify-between rounded bg-ghost-bg px-2 py-1">
            <span className="text-ghost-text-muted">ぼうぎょ</span>
            <span className="text-ghost-text-bright" data-testid="stat-defense">
              {ghost.stats.defense}
            </span>
          </div>
          <div className="flex justify-between rounded bg-ghost-bg px-2 py-1">
            <span className="text-ghost-text-muted">すばやさ</span>
            <span className="text-ghost-text-bright" data-testid="stat-speed">
              {ghost.stats.speed}
            </span>
          </div>
        </div>
      </div>

      {/* 技一覧 */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-ghost-text-bright">わざ</h3>
        <div className="flex flex-col gap-2">
          {ghost.moves.map((ownedMove, index) => {
            const moveData = moves.find((m) => m.id === ownedMove.moveId);
            if (!moveData) return null;

            return (
              <div
                key={ownedMove.moveId}
                className="flex items-center justify-between rounded bg-ghost-bg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold text-white ${getTypeBgClass(moveData.type)}`}
                    data-testid={`move-${index}-type`}
                  >
                    {getTypeLabel(moveData.type)}
                  </span>
                  <span className="text-ghost-text-bright">{moveData.name}</span>
                </div>
                <span className="text-sm text-ghost-text-muted" data-testid={`move-${index}-pp`}>
                  {ownedMove.currentPP}/{ownedMove.maxPP}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 操作説明 */}
      <div className="mt-4 text-center text-xs text-ghost-text-muted">Esc: 閉じる</div>
    </div>
  );
}
