import React from 'react';
import OriginalLayout from '@theme-original/DocItem/Layout';
import type {Props} from '@theme/DocItem/Layout';

export default function DocItemLayout(props: Props) {
  return <div className="lesson-layout"><OriginalLayout {...props} /></div>;
}
