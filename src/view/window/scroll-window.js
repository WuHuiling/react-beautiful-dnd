// @flow
import { type Position } from 'css-box-model';
import getViewportElement from './get-viewport-element';

export default (className?: string) => (change: Position): void => {
  const doc = getViewportElement(className);
  doc.scrollBy(change.x, change.y);
};
