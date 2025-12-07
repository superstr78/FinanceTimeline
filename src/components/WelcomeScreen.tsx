import { useState } from 'react';
import { Compass, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

interface WelcomeScreenProps {
  onContinueOffline: () => void;
}

export function WelcomeScreen({ onContinueOffline }: WelcomeScreenProps) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-100 mb-2">
            플랜마이라이프
          </h1>
          <p className="text-dark-400">
            나의 인생을 설계하세요
          </p>
        </div>

        {/* 로그인 옵션 */}
        <div className="card !p-6 space-y-4">
          <h2 className="text-lg font-semibold text-dark-100 text-center mb-2">
            시작하기
          </h2>

          {/* Google 로그인 */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full btn bg-white hover:bg-gray-100 text-gray-800 py-3 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{isLoading ? '로그인 중...' : 'Google 계정으로 시작'}</span>
          </button>

          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Cloud className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-400">
              여러 기기에서 데이터를 동기화할 수 있습니다
            </p>
          </div>

          {error && (
            <p className="text-sm text-rose-400 text-center">{error}</p>
          )}

          {/* 구분선 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-xs text-dark-500">또는</span>
            <div className="flex-1 h-px bg-dark-700" />
          </div>

          {/* 오프라인 모드 */}
          <button
            onClick={onContinueOffline}
            disabled={isLoading}
            className="w-full btn btn-secondary py-3 disabled:opacity-50"
          >
            <CloudOff className="w-5 h-5" />
            <span>로그인 없이 사용하기</span>
          </button>

          <div className="flex items-center gap-2 p-3 bg-dark-800/50 rounded-lg">
            <CloudOff className="w-4 h-4 text-dark-400 flex-shrink-0" />
            <p className="text-xs text-dark-400">
              이 기기에만 데이터가 저장됩니다
            </p>
          </div>
        </div>

        {/* 하단 정보 */}
        <p className="text-center text-xs text-dark-500 mt-6">
          Made by 이용우
        </p>
      </div>
    </div>
  );
}
