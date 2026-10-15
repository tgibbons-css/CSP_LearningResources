import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

export interface ResourceCardProps {
  title: string;
  href: string;
  children: ReactNode;
  label?: string;
}

export default function ResourceCard({title, href, children, label}: ResourceCardProps) {
  return (
    <article className="resource-card">
      {label && <span className="eyebrow">{label}</span>}
      <h3><Link to={href}>{title}</Link></h3>
      <div>{children}</div>
    </article>
  );
}
