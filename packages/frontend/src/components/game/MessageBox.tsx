import { useCallback, useEffect, useState } from "react";

/**
 * メッセージボックスのProps
 */
export interface MessageBoxProps {
  /** 表示するメッセージキュー */
  messages: string[];
  /** 現在表示中のメッセージインデックス */
  currentIndex?: number;
  /** メッセージ送り時のコールバック */
  onAdvance?: () => void;
  /** 全メッセージ表示完了時のコールバック */
  onComplete?: () => void;
  /** 自動送り有効化 */
  autoAdvance?: boolean;
  /** 自動送り間隔（ミリ秒） */
  autoAdvanceDelay?: number;
  /** タイプライター効果を有効にするか */
  typewriter?: boolean;
  /** タイプライター効果の速度（ミリ秒/文字） */
  typewriterSpeed?: number;
}

/**
 * メッセージボックスコンポーネント
 *
 * バトルメッセージの表示とメッセージキューの順次表示を行う
 */
export function MessageBox({
  messages,
  currentIndex = 0,
  onAdvance,
  onComplete,
  autoAdvance = false,
  autoAdvanceDelay = 2000,
  typewriter = true,
  typewriterSpeed = 30,
}: MessageBoxProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentMessage = messages[currentIndex] ?? "";
  const hasMoreMessages = currentIndex < messages.length - 1;
  const isComplete = currentIndex >= messages.length - 1 && displayedText === currentMessage;

  // タイプライター効果
  useEffect(() => {
    if (!typewriter) {
      setDisplayedText(currentMessage);
      setIsTyping(false);
      return;
    }

    if (!currentMessage) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    setDisplayedText("");
    setIsTyping(true);
    let charIndex = 0;

    const timer = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, typewriterSpeed);

    return () => clearInterval(timer);
  }, [currentMessage, typewriter, typewriterSpeed]);

  // 自動送り
  useEffect(() => {
    if (!autoAdvance || isTyping || !hasMoreMessages) {
      return;
    }

    const timer = setTimeout(() => {
      onAdvance?.();
    }, autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [autoAdvance, autoAdvanceDelay, isTyping, hasMoreMessages, onAdvance]);

  // 全メッセージ表示完了通知
  useEffect(() => {
    if (isComplete && !isTyping) {
      onComplete?.();
    }
  }, [isComplete, isTyping, onComplete]);

  // クリック/キー入力でメッセージを進める
  const handleAdvance = useCallback(() => {
    if (isTyping) {
      // タイプライター中はスキップして全文表示
      setDisplayedText(currentMessage);
      setIsTyping(false);
    } else if (hasMoreMessages) {
      onAdvance?.();
    }
  }, [isTyping, hasMoreMessages, currentMessage, onAdvance]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      className="absolute bottom-0 left-0 right-0 border-t-4 border-ghost-primary bg-ghost-surface/95 p-4 text-left"
      data-testid="message-box"
      onClick={handleAdvance}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleAdvance();
        }
      }}
    >
      <div className="min-h-[60px]">
        <p className="text-lg text-ghost-text-bright" data-testid="message-text">
          {displayedText}
        </p>
      </div>

      {/* メッセージ送りインジケーター */}
      <div className="absolute bottom-2 right-4">
        {!isTyping && hasMoreMessages && (
          <span className="animate-bounce text-ghost-primary-light" data-testid="advance-indicator">
            ▼
          </span>
        )}
        {!isTyping && !hasMoreMessages && messages.length > 0 && (
          <span className="text-ghost-text-muted" data-testid="complete-indicator">
            ●
          </span>
        )}
      </div>

      {/* メッセージカウンター */}
      {messages.length > 1 && (
        <div
          className="absolute bottom-2 left-4 text-sm text-ghost-text-muted"
          data-testid="message-counter"
        >
          {currentIndex + 1} / {messages.length}
        </div>
      )}
    </button>
  );
}
