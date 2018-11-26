// @flow
import { type Position } from 'css-box-model';
import getViewportElement from './get-viewport-element';

// Not guarenteed to scroll by the entire amount
export default (className?: string) => (change: Position): void => {
  const doc = getViewportElement(className);

  // IE doesn't support element scrollBy function
  doc.scrollTop += change.y;
  doc.scrollLeft += change.x;
};
