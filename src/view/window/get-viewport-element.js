// @flow

let viewport: HTMLElement | null = null;

export default (viewportClassName: ?string): HTMLElement => {
  if (viewport) {
    return viewport;
  }

  if (viewportClassName) {
    viewport = document.getElementsByClassName(viewportClassName)[0];
  } else {
    viewport = document.documentElement;
  }
  return viewport;
};

export const resetViewportElement = () => {
  viewport = null;
};
