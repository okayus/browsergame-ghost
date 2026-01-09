import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

/**
 * エラーバウンダリコンポーネント
 *
 * 子コンポーネントで発生したエラーをキャッチし、fallback UIを表示する。
 * Suspense + useSuspenseQuery と組み合わせて使用する。
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>Error: {error.message}</p>
 *       <button onClick={reset}>Retry</button>
 *     </div>
 *   )}
 * >
 *   <Suspense fallback={<Loading />}>
 *     <DataComponent />
 *   </Suspense>
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught:", error, errorInfo);
	}

	reset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			const { fallback } = this.props;
			if (typeof fallback === "function") {
				return fallback(this.state.error, this.reset);
			}
			return fallback;
		}
		return this.props.children;
	}
}
