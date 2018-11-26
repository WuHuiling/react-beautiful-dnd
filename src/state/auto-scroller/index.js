// @flow
import { type Position } from 'css-box-model';
import createFluidScroller, { type FluidScroller } from './fluid-scroller';
import createJumpScroller, { type JumpScroller } from './jump-scroller';
import type { AutoScroller } from './auto-scroller-types';
import type { DroppableId } from '../../types';
import type { MoveArgs } from '../action-creators';

type Args = {|
  scrollDroppable: (id: DroppableId, change: Position) => void,
  move: (args: MoveArgs) => mixed,
  scrollViewport: (offset: Position) => void,
|};

export default ({
  scrollDroppable,
  scrollViewport,
  move,
}: Args): AutoScroller => {
  const fluidScroll: FluidScroller = createFluidScroller({
    scrollViewport,
    scrollDroppable,
  });

  const jumpScroll: JumpScroller = createJumpScroller({
    move,
    scrollViewport,
    scrollDroppable,
  });

  const marshal: AutoScroller = {
    cancel: fluidScroll.cancel,
    fluidScroll,
    jumpScroll,
  };

  return marshal;
};
