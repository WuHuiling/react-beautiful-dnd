// @flow
import { getRect, type Rect } from 'css-box-model';
import type { Position } from 'css-box-model';
import { subtract, negate } from './position';
import type { Viewport } from '../types';

export default (viewport: Viewport, newScroll: Position): Viewport => {
  const diff: Position = subtract(newScroll, viewport.scroll.initial);
  const displacement: Position = negate(diff);

  const top = viewport.elementOffset.y + newScroll.y;
  const left = viewport.elementOffset.x + newScroll.x;

  // We need to update the frame so that it is always a live value
  // The top / left of the frame should always match the newScroll position
  const frame: Rect = getRect({
    top,
    bottom: top + viewport.frame.height,
    left,
    right: left + viewport.frame.width,
  });

  const updated: Viewport = {
    frame,
    scroll: {
      initial: viewport.scroll.initial,
      max: viewport.scroll.max,
      current: newScroll,
      diff: {
        value: diff,
        displacement,
      },
    },
    element: viewport.element,
    elementOffset: viewport.elementOffset,
  };

  return updated;
};
