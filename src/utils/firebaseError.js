const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/invalid-email': '올바른 이메일 주소를 입력해주세요.',
  'auth/network-request-failed': '네트워크 연결을 확인한 후 다시 시도해주세요.',
  'auth/requires-recent-login': '비밀번호 변경을 위해 다시 로그인해주세요.',
  'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  'auth/user-not-found': '가입되지 않은 이메일입니다.',
  'auth/weak-password': '비밀번호는 8자 이상으로 입력해주세요.',
  'auth/wrong-password': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'permission-denied': '회원정보 저장 권한이 없습니다. 보안 규칙 적용 상태를 확인해주세요.',
  'failed-precondition': 'Firestore 요청 조건을 충족하지 못했습니다. 데이터베이스 설정을 확인해주세요.',
  'resource-exhausted': 'Firestore 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  'unavailable': 'Firebase 서버에 연결하지 못했습니다. 네트워크 연결을 확인해주세요.',
}

export const getFirebaseErrorMessage = (error) => (
  AUTH_ERROR_MESSAGES[error?.code] || '처리 중 오류가 발생했습니다. 다시 시도해주세요.'
)

export const getFirebaseErrorCode = (error) => error?.code || '확인할 수 없음'
