/**
 * The SSO option card.
 *
 * Ported from DTX `app/components/Auth/LoginScreen.jsx`. DOM order, class
 * names, the `aria-describedby`/`aria-busy` wiring and the mail glyph are
 * unchanged; the three labels moved verbatim into `locales/en/auth.json`.
 */
import {useTranslation} from 'react-i18next';
import { Button } from '~/shared/components/ui/Button';

export interface LoginScreenProps {
  onExternalLogin?: () => void;
  isExternalLoading?: boolean;
}

export function LoginScreen({
  onExternalLogin,
  isExternalLoading = false,
}: LoginScreenProps) {
  const {t} = useTranslation('auth');

  return (
    <SsoOptionCard
      id="external-user-label"
      label={t('login.sso.label')}
      buttonLabel={t('login.sso.button')}
      loadingLabel={t('login.sso.redirecting')}
      icon={<MailIcon size={20} />}
      onClick={onExternalLogin}
      isLoading={isExternalLoading}
    />
  );
}

interface SsoOptionCardProps {
  id: string;
  label: string;
  buttonLabel: string;
  loadingLabel: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isLoading: boolean;
}

function SsoOptionCard({
  id,
  label,
  buttonLabel,
  loadingLabel,
  icon,
  onClick,
  isLoading,
}: SsoOptionCardProps) {
  return (
    <div className="login-option">
      <div className="login-option-content">
        <p className="login-option-label" id={id}>
          {label}
        </p>
        <Button
          type="button"
          onClick={onClick}
          loading={isLoading}
          aria-describedby={id}
          shape="square"
          className="cursor-pointer w-full rounded"
        >
          <span className="login-button-icon" aria-hidden>
            {icon}
          </span>
          <span className="login-button-text">
            {isLoading ? loadingLabel : buttonLabel}
          </span>
        </Button>
      </div>
    </div>
  );
}

function MailIcon({size = 20}: {size?: number}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
