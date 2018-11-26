// @flow
/* eslint-disable no-use-before-define */
import type { EventBinding, EventOptions } from './event-types';
import { bindEvents, unbindEvents } from './bind-events';

type getViewportFn = () => HTMLElement;

export type EventPreventer = {|
  preventNext: () => void,
  abort: () => void,
|};

const sharedOptions: EventOptions = { capture: true };

export default (getViewport: getViewportFn): EventPreventer => {
  let isBound: boolean = false;

  const bind = () => {
    if (isBound) {
      return;
    }
    isBound = true;
    bindEvents(getViewport(), pointerEvents, sharedOptions);
  };

  const unbind = () => {
    if (!isBound) {
      return;
    }
    isBound = false;
    unbindEvents(getViewport(), pointerEvents, sharedOptions);
  };

  const pointerEvents: EventBinding[] = [
    {
      eventName: 'click',
      fn: (event: MouseEvent) => {
        event.preventDefault();
        unbind();
      },
    },
    // These events signal that the click prevention is no longer needed
    {
      eventName: 'mousedown',
      // a new mouse interaction is starting: we can unbind
      fn: unbind,
    },
    {
      eventName: 'touchstart',
      fn: unbind,
    },
  ];

  const preventNext = (): void => {
    if (isBound) {
      unbind();
    }

    bind();
  };

  const preventer: EventPreventer = {
    preventNext,
    abort: unbind,
  };

  return preventer;
};
