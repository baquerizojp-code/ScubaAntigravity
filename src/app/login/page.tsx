import type { Metadata } from 'next';
import LoginForm from '../_components/LoginForm';

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
