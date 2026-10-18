import React from 'react';
import OriginalLink from '@theme-original/DocSidebarItem/Link';
import Link from '@docusaurus/Link';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import type {Props} from '@theme/DocSidebarItem/Link';
import ActiveLessonNavigation, {useActiveLesson} from '@site/src/components/ActiveLessonNavigation';

export default function DocSidebarItemLink(props: Props) {
  const {lesson} = useActiveLesson();
  const {item, activePath, onItemClick, level} = props;
  if (!lesson || !isActiveSidebarItem(item, activePath) || item.href !== lesson.href || !lesson.headings.length) {
    return <OriginalLink {...props} />;
  }
  const onNavigate = onItemClick ? () => onItemClick(item) : undefined;
  return <li className={`theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-${level} menu__list-item ${item.className ?? ''}`}>
    <Link className="menu__link menu__link--active" aria-current="page" to={item.href}
      autoAddBaseUrl={item.autoAddBaseUrl} onClick={onNavigate}>{item.label}</Link>
    <ActiveLessonNavigation key={lesson.href} {...lesson} onNavigate={onNavigate} />
  </li>;
}
