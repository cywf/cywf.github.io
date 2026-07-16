export interface NavItem {
  href: string;
  label: string;
  section: "portfolio" | "developer-hq" | "utility";
  description?: string;
}
export const primaryNavigation: NavItem[] = [
  { href: "/", label: "Home", section: "portfolio" },
  { href: "/about", label: "About", section: "portfolio" },
  { href: "/expertise", label: "Expertise", section: "portfolio" },
  { href: "/projects", label: "Projects", section: "portfolio" },
  { href: "/case-studies", label: "Case Studies", section: "portfolio" },
  { href: "/experience", label: "Experience", section: "portfolio" },
  { href: "/research", label: "Research / Writing", section: "portfolio" },
  { href: "/labs", label: "Labs", section: "portfolio" },
  { href: "/architecture", label: "Architecture", section: "portfolio" },
  { href: "/contact", label: "Contact", section: "portfolio" },
  { href: "/developer-hq", label: "Developer HQ", section: "developer-hq" },
];
export const developerHqNavigation: NavItem[] = [
  {
    href: "/statistics",
    label: "Repository Health",
    section: "developer-hq",
    description: "Repository health and language snapshots.",
  },
  {
    href: "/development-board",
    label: "Development Board",
    section: "developer-hq",
    description: "Public project/task snapshot board.",
  },
  {
    href: "/discussions",
    label: "Public Activity / Discussions",
    section: "developer-hq",
    description: "Recent public GitHub discussion snapshot.",
  },
  {
    href: "/docs",
    label: "Documentation",
    section: "developer-hq",
    description: "README and wiki coverage evidence.",
  },
  {
    href: "/dashboard",
    label: "Legacy Dashboard",
    section: "developer-hq",
    description: "Native and legacy operational dashboard views.",
  },
  {
    href: "/dev-hq",
    label: "Spec Map",
    section: "developer-hq",
    description: "Traceability page for KP-DEV-HQ v2.0.",
  },
  {
    href: "/visualizer",
    label: "Visualizer",
    section: "developer-hq",
    description: "Compatibility route for static diagrams.",
  },
];
export const allRoutes = [
  ...primaryNavigation,
  ...developerHqNavigation,
  { href: "/404", label: "404", section: "utility" as const },
];
