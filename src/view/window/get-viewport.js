// @flow
import invariant from 'tiny-invariant';
import { getRect, type Rect, type Position } from 'css-box-model';
import type { Viewport } from '../../types';
import { origin } from '../../state/position';
import getWindowScroll from './get-window-scroll';
import getMaxWindowScroll from './get-max-window-scroll';
import getViewportElement from './get-viewport-element';

export default (viewportClassName: ?string): Viewport => {
  const doc = getViewportElement(viewportClassName);
  const scroll: Position = getWindowScroll(doc);
  const maxScroll: Position = getMaxWindowScroll(doc);

  let offsetTop: number = 0;
  let offsetLeft: number = 0;
  if (doc !== document.documentElement) {
    const position = doc.getBoundingClientRect();
    offsetTop = position.top;
    offsetLeft = position.left;
  }

  const top: number = offsetTop + scroll.y;
  const left: number = offsetLeft + scroll.x;

  invariant(doc, 'Could not find document.documentElement');

  // Using these values as they do not consider scrollbars
  // padding box, without scrollbar
  const width: number = doc.clientWidth;
  const height: number = doc.clientHeight;

  // Computed
  const right: number = left + width;
  const bottom: number = top + height;

  const frame: Rect = getRect({
    top,
    left,
    right,
    bottom,
  });

  const viewport: Viewport = {
    frame,
    scroll: {
      initial: scroll,
      current: scroll,
      max: maxScroll,
      diff: {
        value: origin,
        displacement: origin,
      },
    },
    element: doc,
    elementOffset: { y: offsetTop, x: offsetLeft },
  };

  return viewport;
};
