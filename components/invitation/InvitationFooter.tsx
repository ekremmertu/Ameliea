'use client';

import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface InvitationData {
  coupleName: string;
  theme: {
    primaryColor: string;
  };
}

interface InvitationFooterProps {
  invitationData: InvitationData;
}

export function InvitationFooter({ invitationData }: InvitationFooterProps) {
  const { t } = useI18n();
  
  return (
    <footer className="py-12 px-4 border-t" style={{ borderColor: 'var(--border-base)' }}>
      <div className="max-w-4xl mx-auto text-center">
        <p
          className="text-lg mb-4"
          style={{
            fontFamily: tokens.typography.fontFamily.serif.join(', '),
            color: tokens.colors.text.primary,
          }}
        >
          {invitationData.coupleName}
        </p>
        <p
          className="text-sm mb-6"
          style={{
            color: tokens.colors.text.muted,
            fontFamily: tokens.typography.fontFamily.sans.join(', '),
          }}
        >
          {t('invitation_celebrate')}
        </p>
        <div
          className="h-px w-24 mx-auto mb-6"
          style={{ background: invitationData.theme.primaryColor }}
        />
        <p
          className="text-xs"
          style={{
            color: tokens.colors.text.muted,
            fontFamily: tokens.typography.fontFamily.brand.join(', '),
          }}
        >
          Powered by Ameliea
        </p>
      </div>
    </footer>
  );
}

