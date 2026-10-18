import React, {useEffect} from 'react';
import OriginalDocItem from '@theme-original/DocItem';
import type {Props} from '@theme/DocItem';
import {useActiveLesson} from '@site/src/components/ActiveLessonNavigation';

export default function DocItem(props: Props) {
  const {setLesson} = useActiveLesson();
  const {metadata, toc, frontMatter} = props.content;
  useEffect(() => {
    setLesson({href: metadata.permalink, headings: toc.filter((heading) =>
      heading.level >= (frontMatter.toc_min_heading_level ?? 2) &&
      heading.level <= (frontMatter.toc_max_heading_level ?? 3))});
    return () => setLesson(null);
  }, [metadata.permalink, toc, frontMatter.toc_min_heading_level, frontMatter.toc_max_heading_level, setLesson]);
  return <OriginalDocItem {...props} />;
}
