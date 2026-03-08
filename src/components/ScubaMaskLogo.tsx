const ScubaMaskLogo = ({ className = "w-8 h-10" }: { className?: string }) => (
  <svg
    viewBox="0 0 80 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Location pin outline */}
    <path
      d="M40 2C20.1 2 4 17.4 4 36.5c0 12.6 6.8 24.2 14.8 33.5L40 96l21.2-26C69.2 60.7 76 49.1 76 36.5 76 17.4 59.9 2 40 2z"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Left lens */}
    <path
      d="M16 38c0-5.5 3.2-10 9-12h8c2 0 3.5 1 4 2.5.2.8.2 1.6 0 2.5-1 4.5-4.5 9.5-11 10.5C20.5 42.5 16 41.5 16 38z"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right lens */}
    <path
      d="M64 38c0-5.5-3.2-10-9-12h-8c-2 0-3.5 1-4 2.5-.2.8-.2 1.6 0 2.5 1 4.5 4.5 9.5 11 10.5C59.5 42.5 64 41.5 64 38z"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Nose bridge */}
    <path
      d="M37 31c0 0 1.5 4 3 4s3-4 3-4"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Left strap */}
    <path
      d="M16 36c-3-1-5.5 0-7 2"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Right strap */}
    <path
      d="M64 36c3-1 5.5 0 7 2"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Snorkel tube */}
    <path
      d="M66 26c2-4 4-8 4-12 0-3-1.5-5-4-5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Bottom pin dot */}
    <circle cx="40" cy="104" r="4" fill="currentColor" />
  </svg>
);

export default ScubaMaskLogo;
