export const projects = [
  {
    id: 'truemoney', index: '01', eyebrow: 'FINTECH / FIELD OPERATIONS', title: 'TrueMoney Agent App',
    subtitle: 'Financial services built for the people behind the counter.',
    description: 'A production Android platform for agents managing remittance, bill payment, top-up and everyday customer transactions across Myanmar.',
    tags: ['Android', 'Kotlin', 'Fintech'], year: '2023—2026', screen: 'wallet', tint: '#b94f35', surface: '#d9b07a', layout: 'phone',
    href: './project.html?project=truemoney',
  },
  {
    id: 'mab', index: '02', eyebrow: 'DIGITAL BANKING / MOBILE', title: 'MAB Mobile',
    subtitle: 'Everyday banking shaped around confidence and clarity.',
    description: 'The customer app evolved from TrueMoney Myanmar into MAB Mobile, pairing secure transaction flows with a maintainable Android foundation.',
    tags: ['Android', 'Architecture', 'Security'], year: '2023—2026', screen: 'bank', tint: '#496c68', surface: '#b9c6b6', layout: 'split',
    href: './project.html?project=mab',
  },
  {
    id: 'tiger-kpi', index: '03', eyebrow: 'OPERATIONS / INTELLIGENCE', title: 'Tiger KPI Platform',
    subtitle: 'A complex organisation made legible at a glance.',
    description: 'A multi-tenant KPI platform spanning Flutter mobile and web, with live dashboards, approval workflows and a deeply modelled organisation hierarchy.',
    tags: ['Flutter', 'Web', 'Data systems'], year: '2026', screen: 'dashboard', tint: '#a56232', surface: '#d7c5a2', layout: 'landscape',
    href: './project.html?project=tiger-kpi',
  },
  {
    id: 'aether', index: '04', eyebrow: 'EXPERIMENT / ATMOSPHERE', title: 'Aether Weather',
    subtitle: 'Forecasting designed as a sense of place.',
    description: 'A native Android weather experiment where AGSL shaders and particle systems turn rain, snow and night skies into part of the interface.',
    tags: ['Android', 'AGSL shaders', 'Motion'], year: '2025', image: './images/projects/aether/rain.png', tint: '#536a83', surface: '#aebbc5', layout: 'offset',
    href: './project.html?project=aether',
  },
  {
    id: 'portfolio', index: '05', eyebrow: 'PERSONAL PRODUCT / STORYTELLING', title: 'Portfolio App',
    subtitle: 'A résumé that moves like a product, not a document.',
    description: 'A native Android portfolio built around expressive transitions, a focused information hierarchy and direct access to work, skills and experience.',
    tags: ['Android', 'Kotlin', 'Transitions'], year: '2024', image: './images/projects/portfolio/home.png', tint: '#cc5f36', surface: '#dac3ab', layout: 'phone',
    href: './project.html?project=portfolio',
  },
];

export const projectDetails = {
  truemoney: {
    role: 'Senior Android Developer', period: 'APR 2023 — APR 2026', location: 'YANGON, MYANMAR',
    intro: 'The Agent App supports the people who turn a broad financial network into a local service. The work centred on dependable transaction flows, security hardening and a codebase that could keep changing safely.',
    statement: 'At field scale, calm software is part of the financial infrastructure.',
    contributions: [
      ['01', 'Transaction craft', 'Built and maintained agent-facing flows for customer interactions and financial services, with clear operational states.'],
      ['02', 'Security hardening', 'Applied Android network-security guidance to protect sensitive data and transactions.'],
      ['03', 'A healthier codebase', 'Refactored legacy Java, removed unused libraries and introduced repository-based boundaries for stronger maintenance and testing.'],
    ],
    facts: [['500K+', 'PLAY STORE DOWNLOADS'], ['23,000', 'AGENTS NATIONWIDE'], ['4.4', 'PLAY STORE RATING']], visual: 'network',
    mediaNote: 'Live access requires the company network. This view maps the public product footprint without reproducing private screens.',
    links: [['VIEW ON GOOGLE PLAY', 'https://play.google.com/store/apps/details?id=com.truemoney.myanmar.agentapp']],
  },
  mab: {
    role: 'Senior Android Developer', period: 'APR 2023 — APR 2026', location: 'YANGON, MYANMAR',
    intro: 'The customer-facing TrueMoney Myanmar app became MAB Mobile after its acquisition by Myanmar Apex Bank. My contribution focused on dependable customer transactions, security and the long-term health of the Android codebase.',
    statement: 'Trust grows when every state is clear, especially when money is moving.',
    contributions: [
      ['01', 'Customer journeys', 'Delivered transaction and account experiences designed to make routine financial services feel direct and understandable.'],
      ['02', 'Secure foundations', 'Strengthened network security and removed ageing dependencies from a legacy Java application.'],
      ['03', 'Maintainable delivery', 'Applied repository boundaries and measured performance with Firebase Performance Monitoring.'],
    ],
    facts: [['ANDROID', 'PLATFORM'], ['FINTECH', 'DOMAIN'], ['MAB', 'ACQUIRED PRODUCT']], visual: 'layers',
    mediaNote: 'The original product is no longer available to me. The visual shows the engineering layers behind the work rather than invented UI.', links: [],
  },
  'tiger-kpi': {
    role: 'Mobile Software Engineer', period: 'APR 2026 — PRESENT', location: 'HO CHI MINH CITY, VIET NAM',
    intro: 'A multi-tenant performance platform built across Flutter mobile and a web administration surface. The system connects an organisation hierarchy, permissions, approvals and live KPI scoring into one operational model.',
    statement: 'Dense business rules become useful when the structure stays visible.',
    contributions: [
      ['01', 'System architecture', 'Designed the database model, KPI roll-ups, cascading score updates and period locking.'],
      ['02', 'Cross-platform product', 'Co-developed the Flutter app and web admin with real-time dashboards and configurable role-based access.'],
      ['03', 'Operational integrity', 'Built approval workflows and an immutable audit trail, alongside release ownership and live client demos.'],
    ],
    facts: [['MOBILE + WEB', 'SURFACES'], ['REAL TIME', 'KPI RECALCULATION'], ['MULTI-TENANT', 'ORGANISATION MODEL']], visual: 'hierarchy',
    mediaNote: 'Product screens are confidential. This system map represents the authored architecture and workflow without exposing client data.', links: [],
  },
  aether: {
    role: 'Designer & Android Engineer', period: 'PERSONAL PROJECT · 2025', location: 'HO CHI MINH CITY, VIET NAM',
    intro: 'Aether explores weather as atmosphere. Live forecast data sets the colour, motion and character of the screen while GPU shaders and particles make each implemented condition feel present.',
    statement: 'The forecast can describe a feeling as clearly as it describes a number.',
    contributions: [
      ['01', 'Weather as material', 'Built distinct clear, rainy, snowy and starry scenes with AGSL shaders and Compose particle systems.'],
      ['02', 'Live data', 'Connected Open-Meteo forecasts and location services through a modular clean architecture.'],
      ['03', 'Motion with purpose', 'Kept weather effects behind the information hierarchy so temperature and forecast data remain readable.'],
    ],
    facts: [['04', 'IMPLEMENTED SCENES'], ['AGSL', 'SHADER LANGUAGE'], ['OPEN-METEO', 'FORECAST DATA']], visual: 'weather',
    mediaNote: 'Real emulator captures from the working Android app. Choose a state to change both the screen and the atmosphere around it.',
    links: [['VIEW ANDROID SOURCE', 'https://github.com/GawLay/Aether'], ['VIEW FLUTTER MIGRATION', 'https://github.com/GawLay/Aether-Flutter']],
  },
  portfolio: {
    role: 'Designer & Android Engineer', period: 'PERSONAL PROJECT · 2024', location: 'HO CHI MINH CITY, VIET NAM',
    intro: 'A native portfolio that treats professional history as an interactive product. Strong visual transitions connect the résumé, skills, experience and project stories without losing the clarity of a conventional profile.',
    statement: 'A career story becomes memorable when movement helps reveal its structure.',
    contributions: [
      ['01', 'Expressive navigation', 'Designed animated transitions that establish continuity between profile sections.'],
      ['02', 'Useful depth', 'Combined projects, experience, skills, FAQ and contact in a focused mobile structure.'],
      ['03', 'Production foundation', 'Built with Kotlin, Coroutines and Flow, Koin, WorkManager and Firebase in a clean architecture.'],
    ],
    facts: [['KOTLIN', 'LANGUAGE'], ['FIREBASE', 'CONTENT'], ['CLEAN', 'ARCHITECTURE']], visual: 'portfolio',
    mediaNote: 'Real emulator captures and a live recording of the section transition.',
    links: [['VIEW SOURCE', 'https://github.com/GawLay/My-Portfolio'], ['VIEW ON GOOGLE PLAY', 'https://play.google.com/store/apps/details?id=com.kyrie.myportfolio']],
  },
};
