import React from 'react';

interface MaricaLogoProps {
  className?: string;
  variant?: 'black' | 'white';
  height?: number | string;
}

export const MaricaLogo: React.FC<MaricaLogoProps> = ({
  className = '',
  variant = 'black',
  height = 50,
}) => {
  const color = variant === 'white' ? '#FFFFFF' : '#111827';
  const dividerColor = variant === 'white' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(17, 24, 39, 0.3)';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 520 230"
      className={`select-none ${className}`}
      style={{ height, width: 'auto', display: 'inline-block' }}
    >
      {/* LEFT PORTION: SECRETARIA DE CIÊNCIA E TECNOLOGIA */}
      <g fill={color} fontFamily="'Inter', sans-serif" fontWeight="800">
        <text x="240" y="80" fontSize="24" textAnchor="end" letterSpacing="0.05em">
          SECRETARIA DE
        </text>
        <text x="240" y="125" fontSize="33" textAnchor="end" letterSpacing="0.05em">
          CIÊNCIA E
        </text>
        <text x="240" y="170" fontSize="31" textAnchor="end" letterSpacing="0.05em">
          TECNOLOGIA
        </text>
      </g>

      {/* CENTER DIVIDER LINE */}
      <line x1="262" y1="35" x2="262" y2="195" stroke={dividerColor} strokeWidth="3.5" strokeLinecap="round" />

      {/* VERTICAL TEXT: PREFEITURA DE */}
      <text
        fill={color}
        fontSize="17.5"
        fontFamily="'Inter', sans-serif"
        fontWeight="900"
        letterSpacing="0.3em"
        transform="translate(294, 195) rotate(-90)"
        opacity="0.9"
      >
        PREFEITURA DE
      </text>

      {/* RIGHT PORTION: STACKED GEOMETRIC MARICÁ */}
      {/* Row 1: M & A */}
      {/* M path */}
      <path
        d="M310,35 C310,35 315,35 345,35 C353,35 357,43 361,50 C365,43 369,35 377,35 C407,35 412,35 412,35 V85 H392 V58 C392,54 388,52 386,55 L371,82 C369,85 364,85 361,85 C358,85 353,85 351,82 L336,55 C334,52 330,54 330,58 V85 H310 Z"
        fill={color}
      />
      {/* A path */}
      <path
        d="M424,85 L444,35 C446,30 454,30 456,35 L476,85 H454 L450,192 H430 L424,85 Z M435,78 H445 L440,63 Z"
        fill={color}
      />

      {/* Row 2: R & I */}
      {/* R path */}
      <path
        d="M310,140 V90 H345 C356,90 363,97 363,107 C363,116 356,121 345,121 L358,140 H336 L326,121 H326 V140 H310 Z M326,106 H342 C345,106 347,104 347,101 C347,98 345,96 342,96 H326 V106 Z"
        fill={color}
      />
      {/* I path */}
      <rect x="424" y="90" width="22" height="50" rx="3.5" fill={color} />

      {/* Row 3: C & Á */}
      {/* C path */}
      <path
        d="M363,150 C363,150 356,145 345,145 C325,145 310,157 310,170 C310,183 325,195 345,195 C356,195 363,190 363,190 V177 C363,177 356,182 348,182 C335,182 328,175 328,170 C328,165 335,158 348,158 C356,158 363,163 363,163 Z"
        fill={color}
      />
      {/* Á path & accent */}
      <path
        d="M424,195 L444,145 C446,140 454,140 456,145 L476,195 H454 L450,192 H430 L424,195 Z M435,188 H445 L440,173 Z"
        fill={color}
      />
      <path d="M455,129 L440,138 L444,141 L459,132 Z" fill={color} />
    </svg>
  );
};
