interface SaveStatusProps {
  /** セーブ中かどうか */
  saving?: boolean;
  /** 保留中のキャッシュがあるかどうか */
  hasPendingCache?: boolean;
  /** 最後にセーブした時刻 */
  lastSavedAt?: Date | null;
}

/**
 * 相対時間をフォーマットする
 */
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 30) {
    return "たった今";
  }
  if (diffMinutes < 1) {
    return `${diffSeconds}秒前`;
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  }
  if (diffHours < 24) {
    return `${diffHours}時間前`;
  }
  return date.toLocaleDateString("ja-JP");
}

/**
 * セーブ状態表示コンポーネント
 *
 * 最終セーブ日時やセーブ状態を表示する。
 * オフライン時は警告を表示する。
 */
export function SaveStatus({
  saving = false,
  hasPendingCache = false,
  lastSavedAt = null,
}: SaveStatusProps) {
  // セーブ中
  if (saving) {
    return (
      <output data-testid="save-status" className="flex items-center gap-1 text-xs text-gray-400">
        <span
          data-testid="save-spinner"
          className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-500 border-t-purple-400"
        />
        <span>セーブ中...</span>
      </output>
    );
  }

  // オフライン（保留中キャッシュあり）
  if (hasPendingCache) {
    return (
      <output data-testid="save-status" className="flex items-center gap-1 text-xs text-yellow-500">
        <span data-testid="offline-warning" className="text-sm">
          ⚠
        </span>
        <span>オフライン</span>
      </output>
    );
  }

  // 未セーブ
  if (!lastSavedAt) {
    return (
      <output data-testid="save-status" className="flex items-center gap-1 text-xs text-gray-500">
        <span>未セーブ</span>
      </output>
    );
  }

  // 正常（最終セーブ時刻を表示）
  return (
    <output data-testid="save-status" className="flex items-center gap-1 text-xs text-gray-400">
      <span data-testid="save-check" className="text-green-500">
        ✓
      </span>
      <span>最終セーブ: {formatRelativeTime(lastSavedAt)}</span>
    </output>
  );
}
