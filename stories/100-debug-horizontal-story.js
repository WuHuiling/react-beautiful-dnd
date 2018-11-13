// @flow
import React from 'react';
import { Draggable, Droppable, DragDropContext } from '../src';
import './99.css';

const grid = 8;
// fake data generator
const getItems = (count, offset = 0) => {
  return Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}`,
    content: `item ${k + offset}`,
    uniqId: k + offset,
  }));
};

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getHorizontalStyle = isDraggingOver => ({
  padding: grid,
  display: 'block',
  width: '100%',
  height: '100',
  marginBottom: 30,
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
});

const getHorizontalItemStyle = (isDragging, draggableStyle, id) => {
  const background = id % 2 === 0 ? 'darkgray' : 'grey';
  const height = id % 2 === 0 ? 60 : 60;

  return {
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    height,
    width: 60,
    display: 'inline-block',
    marginRight: 20,
    // border: '1px solid',
    // padding: grid * 2,
    // margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? '#f0cace' : background,
    color: id >= 8 ? 'yellow' : '#49edf0',

    // styles we need to apply on draggables
    ...draggableStyle,
  };
};

class Horizontal extends React.Component {
  state = {
    droppable1: getItems(8),
    droppable2: getItems(3, 10),
  };

  onDragEnd = result => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.state[source.droppableId],
        source.index,
        destination.index,
      );

      this.setState({
        [source.droppableId]: items,
      });
    } else {
      const result = move(
        this.state[source.droppableId],
        this.state[destination.droppableId],
        source,
        destination,
      );
      this.setState({
        [source.droppableId]: result[source.droppableId],
        [destination.droppableId]: result[destination.droppableId],
      });
    }
  };

  renderDraggable(item, index, droppableId) {
    let type2
    // if (droppableId === 'droppable1') {
    //   type2 = index % 2 === 0 ? 'type1' : 'type2'
    // } else {
    //   type2 = 'type2'
    // }
    const ids = [1, 2, 12]
    if (ids.indexOf(item.uniqId) > -1) {
      type2 = 'type1'
    } else {
      type2 = 'type2'
    }

    return (
      <Draggable
        key={item.id}
        draggableId={item.id}
        type={ type2 }
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getHorizontalItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style,
              item.uniqId,
            )}>
            {`${item.content}_${type2}`}
          </div>
        )}
      </Draggable>
    );
  }

  renderDroppable(id, items, type) {
    return (
      <Droppable droppableId={id} type={type} direction={'horizontal'}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getHorizontalStyle(snapshot.isDraggingOver)}
          >
            {items.map((item, index) => (
              this.renderDraggable(item, index, id)
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  render() {
    // const droppable1 = this.renderDroppable('droppable1', this.state.droppable1, 'type1')
    // const droppable2 = this.renderDroppable('droppable2', this.state.droppable2, 'type1')

    const droppable1 = this.renderDroppable('droppable1', this.state.droppable1, ['type1', 'type2'])
    const droppable2 = this.renderDroppable('droppable2', this.state.droppable2, ['type1', 'type2'])
    // const droppable5 = this.renderDroppable('droppable5', this.state.droppable5, 'type3')

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        {droppable1}
        {droppable2}
      </DragDropContext>
    );
  }
}
