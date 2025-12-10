import type { BattleGhostState } from "@ghost-game/shared";

/**
 * ゴースト表示のProps
 */
export interface GhostDisplayProps {
  /** ゴースト状態 */
  ghostState: BattleGhostState;
  /** 敵ゴーストかどうか */
  isEnemy: boolean;
  /** ゴーストタイプ（表示用） */
  ghostType?: string;
}

/**
 * HPバーの色を取得
 */
function getHpBarColor(hpPercentage: number): string {
  if (hpPercentage > 50) return "bg-green-500";
  if (hpPercentage > 25) return "bg-yellow-500";
  return "bg-red-500";
}

/**
 * ゴースト表示コンポーネント
 *
 * 味方または敵のゴーストを表示する
 */
export function GhostDisplay({ ghostState, isEnemy, ghostType }: GhostDisplayProps) {
  const { ghost, currentHp } = ghostState;
  const maxHp = ghost.maxHp;
  const hpPercentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  return (
    <div
      className={`flex flex-col ${isEnemy ? "items-end" : "items-start"}`}
      data-testid={isEnemy ? "enemy-ghost-display" : "player-ghost-display"}
    >
      {/* ゴースト情報パネル */}
      <div
        className={`mb-2 rounded-lg border-2 border-ghost-primary bg-ghost-surface p-3 ${
          isEnemy ? "ml-auto" : "mr-auto"
        }`}
        style={{ minWidth: "180px" }}
      >
        {/* 名前とレベル */}
        <div className="mb-2 flex items-center justify-between">
          <span className="font-bold text-ghost-text-bright" data-testid="ghost-name">
            {ghost.speciesId}
          </span>
          <span className="text-sm text-ghost-text-muted" data-testid="ghost-level">
            Lv.{ghost.level}
          </span>
        </div>

        {/* タイプ */}
        {ghostType && (
          <div className="mb-2">
            <span
              className="rounded bg-ghost-primary/30 px-2 py-0.5 text-xs text-ghost-primary-light"
              data-testid="ghost-type"
            >
              {ghostType}
            </span>
          </div>
        )}

        {/* HPバー */}
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs text-ghost-text-muted">HP</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-ghost-bg">
            <div
              className={`h-full transition-all duration-300 ${getHpBarColor(hpPercentage)}`}
              style={{ width: `${hpPercentage}%` }}
              data-testid="hp-bar"
            />
          </div>
        </div>

        {/* HP数値 */}
        <div className="text-right text-sm text-ghost-text" data-testid="hp-text">
          {currentHp} / {maxHp}
        </div>
      </div>

      {/* ゴーストスプライト */}
      <div
        className={`flex h-24 w-24 items-center justify-center text-6xl ${
          isEnemy ? "ml-auto" : "mr-auto"
        }`}
        data-testid="ghost-sprite"
      >
        {isEnemy ? "👻" : "🔥"}
      </div>
    </div>
  );
}
