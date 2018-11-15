// @flow
import type { DraggableDimension } from '../../types';

export default (
  child: DraggableDimension | null,
  draggable: DraggableDimension,
): boolean =>
  Boolean(child) && child.descriptor.type === draggable.descriptor.type;
