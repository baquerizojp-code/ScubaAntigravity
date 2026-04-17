import type { Metadata } from 'next';
import LoginForm from '../_components/LoginForm';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <LoginForm />;
}
