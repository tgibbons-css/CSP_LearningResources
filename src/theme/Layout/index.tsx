import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import type {Props} from '@theme/Layout';
import {ActiveLessonProvider} from '@site/src/components/ActiveLessonNavigation';

export default function Layout(props: Props) {
  // The mobile navbar's sidebar sits outside DocRoot, so share metadata here.
  return <ActiveLessonProvider><OriginalLayout {...props} /></ActiveLessonProvider>;
}
