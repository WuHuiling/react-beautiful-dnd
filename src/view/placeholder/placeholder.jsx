// @flow
import React, { PureComponent } from 'react';
import type { DroppableId, Placeholder as PlaceholderType } from '../../types';
import type { PlaceholderStyle } from './placeholder-types';

type Props = {|
  placeholder: PlaceholderType,
  innerRef?: () => ?HTMLElement,
  droppableId?: DroppableId,
  isVisible?: boolean,
|};

export default class Placeholder extends PureComponent<Props> {
  render() {
    const { isVisible = true } = this.props;
    const placeholder: PlaceholderType = this.props.placeholder;
    const { client, display, tagName } = placeholder;

    // draggable in foreign list and the foreign list is not sortable
    // thus should hide the placeholder
    const hidePlaceholder = this.props.droppableId && !isVisible;

    const height = hidePlaceholder ? 0 : client.borderBox.height;
    const width = hidePlaceholder ? 0 : client.borderBox.width;
    const marginTop = isVisible ? client.margin.top : 0;
    const marginRight = isVisible ? client.margin.right : 0;
    const marginBottom = isVisible ? client.margin.bottom : 0;
    const marginLeft = isVisible ? client.margin.left : 0;

    // The goal of the placeholder is to take up the same amount of space
    // as the original draggable
    const style: PlaceholderStyle = {
      display,
      // ## Recreating the box model
      // We created the borderBox and then apply the margins directly
      // this is to maintain any margin collapsing behaviour

      // creating borderBox
      boxSizing: 'border-box',
      width,
      height,
      // creating marginBox
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,

      // ## Avoiding collapsing
      // Avoiding the collapsing or growing of this element when pushed by flex child siblings.
      // We have already taken a snapshot the current dimensions we do not want this element
      // to recalculate its dimensions
      // It is okay for these properties to be applied on elements that are not flex children
      flexShrink: '0',
      flexGrow: '0',
      // Just a little performance optimisation: avoiding the browser needing
      // to worry about pointer events for this element
      pointerEvents: 'none',
    };

    return React.createElement(tagName, { style, ref: this.props.innerRef });
  }
}
