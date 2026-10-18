/** User-facing error categories. Messages are Korean guidance, never stack traces. */
export type AppErrorCode =
  | 'file-access-lost'
  | 'decode-failed'
  | 'permission-denied'
  | 'storage-failed'
  | 'share-unavailable'
  | 'backend-not-configured'
  | 'backend-quota'
  | 'backend-paused'
  | 'network'
  | 'auth-required'
  | 'auth-failed'
  | 'rate-limited'
  | 'validation'
  | 'unknown';

const MESSAGES: Record<AppErrorCode, string> = {
  'file-access-lost': '사진 파일에 더 이상 접근할 수 없어요. 프로젝트에서 사진을 다시 선택해 주세요.',
  'decode-failed': '이 사진 형식을 읽지 못했어요. 다른 사진으로 바꾸거나 제외해 주세요.',
  'permission-denied': '권한이 거부됐어요. 기기 설정 > CutPick에서 권한을 허용할 수 있어요.',
  'storage-failed': '기기 저장 공간에 쓰지 못했어요. 저장 공간을 확인한 뒤 다시 시도해 주세요.',
  'share-unavailable': '이 기기에서는 공유 기능을 사용할 수 없어요. 사진 앱에 저장한 뒤 직접 올려 주세요.',
  'backend-not-configured': '커뮤니티 서버가 설정되지 않았어요. 사진 추천과 저장은 계속 사용할 수 있어요.',
  'backend-quota': '커뮤니티 이용 한도에 도달해 게시가 잠시 제한됐어요. 로컬 기능은 정상 동작해요.',
  'backend-paused': '커뮤니티 서버가 일시 중지 상태예요. 잠시 후 다시 시도해 주세요.',
  network: '네트워크에 연결할 수 없어요. 연결 상태를 확인해 주세요.',
  'auth-required': '커뮤니티 기능은 로그인 후 이용할 수 있어요.',
  'auth-failed': '인증에 실패했어요. 코드를 다시 확인해 주세요.',
  'rate-limited': '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.',
  validation: '입력값을 확인해 주세요.',
  unknown: '알 수 없는 문제가 생겼어요. 다시 시도해 주세요.',
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  constructor(code: AppErrorCode, message?: string, readonly cause?: unknown) {
    super(message ?? MESSAGES[code]);
    this.code = code;
    this.name = 'AppError';
  }
  get userMessage(): string {
    return this.message || MESSAGES[this.code];
  }
}

export function toUserMessage(err: unknown): string {
  if (err instanceof AppError) return err.userMessage;
  return MESSAGES.unknown;
}

/** Logs without sensitive data (no URIs, no EXIF). */
export function logError(scope: string, err: unknown): void {
  const code = err instanceof AppError ? err.code : 'unknown';
  const name = err instanceof Error ? err.name : typeof err;
  // Release builds log only the category. Dev builds add the raw message for debugging.
  const cause = err instanceof AppError ? err.cause : err;
  const detail = __DEV__ && cause instanceof Error ? `: ${cause.message}` : '';
  console.warn(`[cutpick:${scope}] ${code} (${name})${detail}`);
}
