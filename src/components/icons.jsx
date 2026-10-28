/* Small inline SVG icon set — avoids pulling in an icon dependency. */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const Svg = ({ size = 20, children, ...rest }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...base} {...rest}>
    {children}
  </svg>
);

export const IconSearch = (props) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const IconArrowRight = (props) => (
  <Svg {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconCopy = (props) => (
  <Svg {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6.5A2.5 2.5 0 0 0 4 5.5v6A2.5 2.5 0 0 0 6.5 14" />
  </Svg>
);

export const IconCheck = (props) => (
  <Svg {...props}>
    <path d="m5 13 4.5 4.5L19 6.5" />
  </Svg>
);

export const IconCheckCircle = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.5 2.5L16 9.5" />
  </Svg>
);

export const IconXCircle = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </Svg>
);

export const IconClock = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const IconDownload = (props) => (
  <Svg {...props}>
    <path d="M12 4v10m0 0 4-4m-4 4-4-4" />
    <path d="M5 18h14" />
  </Svg>
);

export const IconClose = (props) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconChevronLeft = (props) => (
  <Svg {...props}>
    <path d="m14 6-6 6 6 6" />
  </Svg>
);

export const IconChevronRight = (props) => (
  <Svg {...props}>
    <path d="m10 6 6 6-6 6" />
  </Svg>
);

export const IconChevronDown = (props) => (
  <Svg {...props}>
    <path d="m6 10 6 6 6-6" />
  </Svg>
);

export const IconPlay = (props) => (
  <Svg {...props}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </Svg>
);

export const IconPause = (props) => (
  <Svg {...props}>
    <path d="M9 5v14M15 5v14" />
  </Svg>
);

export const IconExpand = (props) => (
  <Svg {...props}>
    <path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />
  </Svg>
);

export const IconLink = (props) => (
  <Svg {...props}>
    <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1-1" />
  </Svg>
);

export const IconUser = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
  </Svg>
);

export const IconBriefcase = (props) => (
  <Svg {...props}>
    <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18" />
  </Svg>
);

export const IconSparkles = (props) => (
  <Svg {...props}>
    <path d="M12 4.5l1.6 4.1 4.1 1.6-4.1 1.6L12 16l-1.6-4.2L6.3 10.2l4.1-1.6L12 4.5Z" />
    <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
  </Svg>
);

export const IconShield = (props) => (
  <Svg {...props}>
    <path d="M12 3.5 5 6.2v5.3c0 4 2.9 7.4 7 8.9 4.1-1.5 7-4.9 7-8.9V6.2L12 3.5Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Svg>
);

export const IconInfo = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.8v.4" />
  </Svg>
);

export const IconAlert = (props) => (
  <Svg {...props}>
    <path d="M12 4.5 3.5 19.5h17L12 4.5Z" />
    <path d="M12 10v4M12 16.6v.4" />
  </Svg>
);

export const IconFilter = (props) => (
  <Svg {...props}>
    <path d="M4 7h16M7 12h10M10 17h4" />
  </Svg>
);

export const IconPresentation = (props) => (
  <Svg {...props}>
    <rect x="3" y="4.5" width="18" height="11.5" rx="2" />
    <path d="M12 16v3M9 21h6" />
    <path d="m9.5 11.5 2.5-3 2 2.4 1.5-2" />
  </Svg>
);

export const IconMapPin = (props) => (
  <Svg {...props}>
    <path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" />
    <circle cx="12" cy="11" r="2.3" />
  </Svg>
);

export const IconMail = (props) => (
  <Svg {...props}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m4 8 7.1 5a1.6 1.6 0 0 0 1.8 0L20 8" />
  </Svg>
);

export const IconPhone = (props) => (
  <Svg {...props}>
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3c0 1.1-.9 2-2 2A15.5 15.5 0 0 1 4.5 5.5c0-1.1.9-2 2-2Z" />
  </Svg>
);

export const IconExternal = (props) => (
  <Svg {...props}>
    <path d="M14 4h6v6M20 4l-8.5 8.5" />
    <path d="M18 14.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5" />
  </Svg>
);

export const IconPlus = (props) => (
  <Svg {...props}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
