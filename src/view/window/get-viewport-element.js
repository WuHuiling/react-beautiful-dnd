// @flow

export default (viewportClassName: ?string): HTMLElement => {
  let viewport: HTMLElement;

  if (viewportClassName) {
    viewport = document.getElementsByClassName(viewportClassName)[0];
  }

  return viewport || document.documentElement;
};
