import { useEffect, useRef } from "react";

/**
 * キーボード入力を処理するカスタムフック
 *
 * このフックは以下の問題を解決します：
 * - useEffectの依存配列からhandlerを除外する必要がなくなる
 * - biome-ignoreによるlint警告抑制が不要になる
 * - stale closure（古いクロージャ）問題を防ぐ
 *
 * @param onKeyInput - 親から渡されるキー入力（undefinedまたはキー文字列）
 * @param handler - キー入力を処理するコールバック関数
 *
 * @example
 * ```tsx
 * function CommandPanel({ onKeyInput }) {
 *   const [selectedIndex, setSelectedIndex] = useState(0);
 *
 *   useKeyboardHandler(onKeyInput, (key) => {
 *     switch (key) {
 *       case "ArrowUp":
 *         setSelectedIndex(prev => prev - 1);
 *         break;
 *       // ...
 *     }
 *   });
 * }
 * ```
 */
export function useKeyboardHandler(
  onKeyInput: string | undefined,
  handler: (key: string) => void,
): void {
  // handlerをrefに保存（常に最新の値を参照）
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (onKeyInput) {
      handlerRef.current(onKeyInput);
    }
  }, [onKeyInput]);
}
