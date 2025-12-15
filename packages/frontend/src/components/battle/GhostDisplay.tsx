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
 * ゴースト情報パネルコンポーネント
 */
function GhostInfoPanel({
  ghost,
  currentHp,
  maxHp,
  hpPercentage,
  ghostType,
}: {
  ghost: BattleGhostState["ghost"];
  currentHp: number;
  maxHp: number;
  hpPercentage: number;
  ghostType?: string;
}) {
  return (
    <div
      className="rounded-lg border-2 border-ghost-primary bg-ghost-surface p-3"
      style={{ minWidth: "160px" }}
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
  );
}

/**
 * ゴーストスプライトコンポーネント
 */
function GhostSprite({ isEnemy }: { isEnemy: boolean }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center text-5xl" data-testid="ghost-sprite">
      {isEnemy ? "👻" : "🔥"}
    </div>
  );
}

/**
 * ゴースト表示コンポーネント
 *
 * 味方または敵のゴーストを表示する
 * 敵: [ステータス] --- [ゴースト]
 * 味方: [ゴースト] --- [ステータス]
 */
export function GhostDisplay({ ghostState, isEnemy, ghostType }: GhostDisplayProps) {
  const { ghost, currentHp } = ghostState;
  const maxHp = ghost.maxHp;
  const hpPercentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  const infoPanel = (
    <GhostInfoPanel
      ghost={ghost}
      currentHp={currentHp}
      maxHp={maxHp}
      hpPercentage={hpPercentage}
      ghostType={ghostType}
    />
  );

  const sprite = <GhostSprite isEnemy={isEnemy} />;

  return (
    <div
      className="flex w-full items-center justify-between"
      data-testid={isEnemy ? "enemy-ghost-display" : "player-ghost-display"}
    >
      {isEnemy ? (
        <>
          {/* 敵: 左にステータス、右にゴースト */}
          {infoPanel}
          {sprite}
        </>
      ) : (
        <>
          {/* 味方: 左にゴースト、右にステータス */}
          {sprite}
          {infoPanel}
        </>
      )}
    </div>
  );
}
