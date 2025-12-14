import type { GhostSpecies, OwnedGhost } from "@ghost-game/shared";

/**
 * GhostSummaryCardのProps
 */
export interface GhostSummaryCardProps {
  /** 表示するゴースト */
  ghost: OwnedGhost;
  /** ゴースト種族データ */
  species: GhostSpecies;
  /** 選択状態 */
  isSelected: boolean;
  /** クリック時のコールバック */
  onClick: () => void;
}

/**
 * HP割合に応じた色を返す
 */
function getHpBarColor(currentHp: number, maxHp: number): string {
  const ratio = currentHp / maxHp;
  if (ratio >= 0.5) {
    return "bg-green-500";
  }
  if (ratio >= 0.25) {
    return "bg-yellow-500";
  }
  return "bg-red-500";
}

/**
 * ゴースト簡易表示カードコンポーネント
 *
 * - ゴーストの名前（種族名またはニックネーム）を表示
 * - レベル表示（Lv. X形式）
 * - 現在HP/最大HPをHPバーと数値で表示
 * - 選択状態の視覚的フィードバック
 */
export function GhostSummaryCard({ ghost, species, isSelected, onClick }: GhostSummaryCardProps) {
  const displayName = ghost.nickname ?? species.name;
  const hpPercentage = ((ghost.currentHp / ghost.maxHp) * 100).toFixed(2);
  const hpBarColor = getHpBarColor(ghost.currentHp, ghost.maxHp);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border-2 p-3 transition-all ${
        isSelected
          ? "border-ghost-primary bg-ghost-primary/20"
          : "border-ghost-border bg-ghost-surface hover:border-ghost-primary-light"
      }`}
      data-testid="ghost-summary-card"
      data-selected={isSelected}
    >
      {/* 上段: 名前とレベル */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-ghost-text-bright">{displayName}</span>
        <span className="text-sm text-ghost-text-muted">Lv.{ghost.level}</span>
      </div>

      {/* 下段: HPバーと数値 */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-ghost-text-muted">
          <span>HP</span>
          <span>
            {ghost.currentHp}/{ghost.maxHp}
          </span>
        </div>
        <div
          className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ghost-bg"
          data-testid="hp-bar"
        >
          <div
            className={`h-full transition-all ${hpBarColor}`}
            style={{ width: `${hpPercentage}%` }}
            data-testid="hp-bar-fill"
          />
        </div>
      </div>
    </button>
  );
}
