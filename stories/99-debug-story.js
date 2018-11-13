// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Draggable, Droppable, DragDropContext } from '../src';
import './99.css';

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

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 8;

const getItemStyle = (customStyle, snapshot, draggableStyle, id, type) => {
  const background = id % 2 === 0 ? 'darkgray' : 'darkgray';
  const height = id % 2 === 0 ? 60 : 60;
  const color = type === 'type1' ? 'yellow' : '#49edf0';

  const basicStyle = {
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    height,
    lineHeight: '60px',
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: snapshot.isDragging ? '#f0cace' : background,
    color,

    // styles we need to apply on draggables
    ...draggableStyle,
  };

  if (!snapshot.isDropAnimating) {
    return {
      ...basicStyle,
      ...customStyle,
    };
  }

  return {
    ...basicStyle,
    ...customStyle,
    transitionDuration: `0.1s`,
  };
};

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
});

const getPlaceholderStyle = isDraggingOver => ({
  background: isDraggingOver ? 'yellow' : '#f0ebb9',
});

const getOuterListStyle = isDraggingOver => ({
  display: 'flex',
  flexDirection: 'column',
  background: isDraggingOver ? 'yellow' : '#f0ebb9',
  padding: 1.5 * grid,
  height: 400,
  marginRight: 20,
});

class Kanban extends React.Component {
  state = {
    droppable1: getItems(8),
    droppable2: getItems(3, 10),
    droppable3: getItems(4, 13),
    droppable4: getItems(3, 17),
    droppable5: getItems(4, 20),
    isSortable: false,
  };

  onDragEnd = result => {
    const { source, destination } = result;
    // this.setState({
    //   isSortable: !this.state.isSortable,
    // })

    // dropped outside the list
    if (!destination) {
      return;
    }

    const droppableId = destination.droppableId;
    // dropped outside the list
    if (droppableId.includes('outer') || droppableId === 'root') {
      return;
    }

    if (destination.droppableId.includes('placeholder')) {
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

  renderDraggable = (item, index) => {
    let type;
    const ids = [2, 5, 6, 7, 12];
    if (ids.indexOf(item.uniqId) > -1) {
      type = 'type1';
    } else {
      type = 'type2';
    }

    type = 'type2';

    return (
      <Draggable key={item.id} draggableId={item.id} index={index} type={type}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(
              provided.draggableProps.style,
              snapshot,
              provided.draggableProps.style,
              item.uniqId,
              type,
            )}
          >
            {`${item.content}`}
          </div>
        )}
      </Draggable>
    );
  }

  renderDroppable = (droppableId, items, type, isSortable) => {
    return (
      <Droppable droppableId={droppableId} type={type} isSortable={isSortable}>
        {(provided, snapshot) => (
          <div
            className="list-droppable"
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {items.map((item, index) => (
              this.renderDraggable(item, index, droppableId)
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  renderPlaceholderDroppable = (droppableId, items, type) => {
    const id = `${droppableId}-placeholder`;
    return (
      <Droppable droppableId={id} type={type}>
        {(provided, snapshot) => (
          <div
            className="placeholder-droppable"
            style={getPlaceholderStyle(snapshot.isDraggingOver)}
            ref={provided.innerRef}
          >
            {snapshot.isDraggingOver && <div className="placeholder" />}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  renderOuterList(droppableId, items, type, isSortable) {
    return (
      <div className="outer-list-droppable">
        {this.renderDroppable(droppableId, items, type, isSortable)}
        <div className="add-placeholder">add task</div>
        {this.renderPlaceholderDroppable(droppableId, items, type)}
      </div>
    );
  }

  renderOuterDraggable(index, droppableId, items, type, isSortable) {
    const drag = `${droppableId} drag-me`;
    return (
      <Draggable
        key={`${droppableId}-draggable`}
        draggableId={`${droppableId}-draggable`}
        index={index}
        type="root"
      >
        {(provided) => (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <div {...provided.dragHandleProps}>{drag}</div>
            {this.renderOuterList(droppableId, items, type, isSortable)}
          </div>
        )}
      </Draggable>
    );
  }

  renderRootDroppable() {
    const draggable1 = this.renderOuterDraggable(1, 'droppable1', this.state.droppable1, 'type2')
    const draggable2 = this.renderOuterDraggable(2, 'droppable2', this.state.droppable2, 'type2')

    const draggable3 = this.renderOuterDraggable(3, 'droppable3', this.state.droppable3, 'type2', true)
    const draggable4 = this.renderOuterDraggable(4, 'droppable4', this.state.droppable4, 'type2', true)
    const droppable5 = this.renderOuterDraggable(5, 'droppable5', this.state.droppable5, 'type2', true)

    return (
      <Droppable droppableId="root" type="root" direction="horizontal">
        {(provided) => (
          <div className="root-droppable" ref={provided.innerRef}>
            {draggable1}
            {draggable2}
            {draggable3}
            {draggable4}
            {droppable5}
            <div className="empty-list">添加任务咯</div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  render() {
    return (
      <div className="kanban-container">
        <DragDropContext
          onDragEnd={this.onDragEnd}
          viewportClassName="kanban-container"
        >
          {this.renderRootDroppable()}
        </DragDropContext>
      </div>
    );
  }
}

class App extends React.Component<*> {
  render() {
    // return 'Used for debugging codesandbox examples (copy paste them into this file)';
    return (
      <div className="root1">
        <div className="root2">
          <Kanban />
        </div>
      </div>
    );
  }
}

storiesOf('Troubleshoot example', module).add('debug example', () => <App />);
