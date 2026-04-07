import PrivacyPage from './PrivacyPageContent';

export const metadata = {
  title: 'Privacy Policy',
  robots: {
    index: false,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPage />;
}
