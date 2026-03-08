import logoDark from '@/assets/logo-dark.png';
import logoWhite from '@/assets/logo-white.png';

interface AppLogoProps {
  variant?: 'dark' | 'white';
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const AppLogo = ({
  variant = 'dark',
  className = 'h-9 w-9',
  showText = true,
  textClassName = 'text-xl font-bold',
}: AppLogoProps) => {
  const src = variant === 'white' ? logoWhite : logoDark;

  return (
    <span className="inline-flex items-center gap-2">
      <img src={src} alt="ScubaTrip logo" className={`${className} object-contain`} />
      {showText && <span className={textClassName}>ScubaTrip</span>}
    </span>
  );
};

export default AppLogo;
