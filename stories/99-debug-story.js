// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Draggable, Droppable, DragDropContext } from '../src';
import './99.css'
// fake data generator
const getItems = (count, offset = 0) => {
  return Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}`,
    content: `item ${k + offset}`,
    uniqId: k + offset,
  }));
}


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
    // border: '1px solid',
    // padding: grid * 2,
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
  padding: grid,
  width: 250,
  maxHeight: '100%',
  overflowX: 'hidden',
  overflowY: 'auto',
  float: 'left',
});

const getOuterListStyle = isDraggingOver => ({
  display: 'flex',
  flexDirection: 'column',
  background: isDraggingOver ? 'yellow' : '#f0ebb9',
  padding: grid,
  height: 300,
  // overflowX: 'hidden',
  // overflowY: 'auto',
  // float: 'left',
  marginRight: 130,
});

const VIEW_PORT_CLASS = 'kanban-container'

const getHorizontalStyle = isDraggingOver => ({
  padding: grid,
  display: 'block',
  width: '100%',
  height: '100',
  marginBottom: 30,
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
});

const getHorizontalItemStyle = (isDragging, draggableStyle, id, disabled) => {
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

class Kanban extends React.Component {
  state = {
    droppable1: getItems(8),
    droppable2: getItems(2, 10),
    droppable3: getItems(2, 13),
    droppable4: getItems(1, 17),
    droppable5: getItems(4, 20),
    isSortable: false,
  };

  onDragEnd = result => {
    const { source, destination } = result;
    this.setState({
      isSortable: !this.state.isSortable,
    })

    // dropped outside the list
    if (!destination) {
      return;
    }

    // dropped outside the list
    if (destination.droppableId.includes('outer')) {
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
    let type
    // if (droppableId === 'droppable1') {
    //   type2 = index % 2 === 0 ? 'type1' : 'type2'
    // } else {
    //   type2 = 'type2'
    // }
    const ids = [2, 5, 6, 7, 12]
    if (ids.indexOf(item.uniqId) > -1) {
      type = 'type1'
    } else {
      type = 'type2'
    }

    type = 'type2'

    return (
      <Draggable
        key={item.id}
        draggableId={item.id}
        index={index}
        type={ type }
      >
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

  renderDroppable(droppableId, items, type, isSortable, isDraggingOver) {
    const style = {
      width: '100%',
      height: 4,
      background: 'green',
    }
    return (
      <Droppable droppableId={droppableId} type={type} isSortable={isSortable}>
        {(provided, snapshot) => (
          <div
            className='list-droppable'
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {items.map((item, index) => (
              this.renderDraggable(item, index, droppableId)
            ))}
            { isDraggingOver && <div style={style}></div> }
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  renderOuterDroppable(droppableId, items, type, isSortable) {
    return (
      <Droppable droppableId={`${droppableId}-outer`} type={type} isSortable={ isSortable }>
        {(provided, snapshot) => (
          <div
            className='outer-list-droppable'
            ref={provided.innerRef}
            style={getOuterListStyle(snapshot.isDraggingOver)}
          >
            {this.renderDroppable(droppableId, items, type, isSortable, snapshot.isDraggingOver)}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  renderOuterDraggable(index, droppableId, items, type, isSortable) {
    return (
      <Draggable
        key={`${droppableId}-draggable`}
        draggableId={`${droppableId}-draggable`}
        index={index}
        type={'root'}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <div {...provided.dragHandleProps}>drag me</div>
            { this.renderOuterDroppable(droppableId, items, type, isSortable) }
          </div>
        )}
      </Draggable>
    )
  }

  renderRootDroppable() {
    const draggable1 = this.renderOuterDraggable(1, 'droppable1', this.state.droppable1, 'type2')
    const draggable2 = this.renderOuterDraggable(2, 'droppable2', this.state.droppable2, 'type2')

    const draggable3 = this.renderOuterDraggable(3, 'droppable3', this.state.droppable3, 'type2', true)
    const draggable4 = this.renderOuterDraggable(4, 'droppable4', this.state.droppable4, 'type2', false)

    return (
      <Droppable droppableId={`root`} type={ 'root'} direction={'horizontal'}>
        {(provided, snapshot) => (
          <div
            className={'rootDroppable'}
            ref={provided.innerRef}
          >
            {draggable1}
            {draggable2}
            {draggable3}
            {draggable4}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    )
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    // const droppable1 = this.renderDroppable('droppable1', this.state.droppable1, 'type1')
    // const droppable2 = this.renderDroppable('droppable2', this.state.droppable2, 'type1')

    const droppable1 = this.renderOuterDroppable('droppable1', this.state.droppable1, 'type2')
    const droppable2 = this.renderOuterDroppable('droppable2', this.state.droppable2, 'type2')

    const droppable3 = this.renderOuterDroppable('droppable3', this.state.droppable3, 'type2', this.state.isSortable)
    const droppable4 = this.renderOuterDroppable('droppable4', this.state.droppable4, 'type2', false)
    // const droppable5 = this.renderDroppable('droppable5', this.state.droppable5, 'type3')

    return (
      <div className={VIEW_PORT_CLASS}>
        {/*<DragDropContext onDragEnd={this.onDragEnd} >*/}
        <DragDropContext onDragEnd={this.onDragEnd} viewportClassName={VIEW_PORT_CLASS}>
          { this.renderRootDroppable() }
          {/*<div style={outerContainerStyle}>*/}
          {/*{droppable1}*/}
          {/*{droppable2}*/}
          {/*{droppable3}*/}
          {/*{droppable4}*/}
          {/*</div>*/}
        </DragDropContext>
      </div>
    );
  }
}

class App extends React.Component<*> {
  render() {
    return (
      <div className='root1'>
        <div className='root2'>
          {/*<div className='sidebar'>side bar</div>*/}
          <Kanban />
        </div>
      </div>
    )
  }

  // render() {
  //   return (
  //     <div className='root1'>
  //       <div className='sidebar'>side bar</div>
  //       <div className='kanban-container'>
  //         <Kanban />
  //       </div>
  //     </div>
  //   );
  //   // return 'Used for debugging codesandbox examples (copy paste them into this file)';
  // }
}

storiesOf('Troubleshoot example', module).add('debug example', () => <App />);
