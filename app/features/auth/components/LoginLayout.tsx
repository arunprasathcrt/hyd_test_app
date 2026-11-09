/**
 * Two-panel login shell: brand imagery left (hidden below 1024px), card right.
 *
 * Ported from DTX `app/components/Auth/LoginLayout.jsx`. DOM order, class
 * names and the decorative `aria-hidden` image are unchanged; the heading
 * moved verbatim into `locales/en/auth.json`.
 *
 * 🔧 SUGGESTED — the `.login-error` paragraph is NOT in the prototype. It was
 * added because the OIDC routes redirect to `/login?error=…` on failure and
 * the prototype has no slot to show that, which leaves a user stuck on an
 * unchanged screen. Remove it, and the matching rule in `login.css`, if the
 * business would rather keep the screen byte-identical.
 */
import {useTranslation} from 'react-i18next';
import loginBgImage from '~/assets/login-bg.png';
import {LoginScreen, type LoginScreenProps} from './LoginScreen';

export interface LoginLayoutProps extends LoginScreenProps {
  errorMessage?: string | null;
}

export function LoginLayout({errorMessage, ...screenProps}: LoginLayoutProps) {
  const {t} = useTranslation('auth');

  return (
    <div className="login-container">
      {/* Left panel - Brand imagery (hidden on mobile) */}
      <div className="login-left-panel" aria-hidden="true">
        <img
          alt=""
          src={loginBgImage}
          className="w-full h-full object-contain object-center"
        />
      </div>

      {/* Right panel - Login form */}
      <div className="login-right-panel">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">{t('login.title')}</h1>
            {errorMessage ? (
              <p className="login-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <div className="login-options">
            <LoginScreen {...screenProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
