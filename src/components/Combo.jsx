import { setStyle, extractStringUntilSecondPeriod, getObjectTypeById } from '../utils';

import { useAppData, useResizeObserver } from '../hooks';
import { useState, useRef } from 'react';
import { useEffect } from 'react';

const Combo = ({ data, value, event = '', row = '', column = '', location = '', values = [] }) => {
  const parentSize = JSON.parse(localStorage.getItem(extractStringUntilSecondPeriod(data?.ID)));

  const inputRef = useRef();

  const { socket, handleData, findDesiredData, reRender, dataRef } = useAppData();
  const styles = setStyle(data?.Properties);
  const { Items, SelItems, Event, Visible, Posn, Size } = data?.Properties;
  const dimensions = useResizeObserver(
    document.getElementById(extractStringUntilSecondPeriod(data?.ID))
  );

  const [comboInput, setComboInput] = useState('+');
  const [position, setPosition] = useState({ top: Posn && Posn[0], left: Posn && Posn[1] });

  const [parentOldDimensions, setParentOldDimensions] = useState(parentSize?.Size);

  useEffect(() => {
    const index = SelItems?.findIndex((element) => element == 1);
    setComboInput(Items[index]);
    const triggerEvent = JSON.stringify({
      Event: {
        EventName: 'Select',
        ID: data?.ID,
        Info: index + 1,
        Text: Items && Items[index],
        Posn: [position?.top, position?.left],
        Size: [Size && Size[0], Size && Size[1]],
      },
    });
    localStorage.setItem(data?.ID, triggerEvent);
  }, [data]);

  const handleCellChangeEvent = (value) => {
    const gridEvent = findDesiredData(extractStringUntilSecondPeriod(data?.ID));
    values[parseInt(row) - 1][parseInt(column) - 1] = value;
    handleData(
      {
        ID: extractStringUntilSecondPeriod(data?.ID),
        Properties: {
          ...gridEvent.Properties,
          Values: values,
          CurCell: [row, column],
        },
      },
      'WS'
    );

    const triggerEvent = JSON.stringify({
      Event: {
        EventName: 'CellChanged',
        ID: extractStringUntilSecondPeriod(data?.ID),
        Row: parseInt(row),
        Col: parseInt(column),
        Value: value,
      },
    });

    const updatedGridValues = JSON.stringify({
      Event: {
        EventName: 'CellChanged',
        Values: values,
        CurCell: [row, column],
      },
    });

    localStorage.setItem(extractStringUntilSecondPeriod(data?.ID), updatedGridValues);
    const exists = event && event.some((item) => item[0] === 'CellChanged');
    if (!exists) return;

    console.log(triggerEvent);
    socket.send(triggerEvent);
  };

  const handleSelectEvent = (value) => {
    const triggerEvent = JSON.stringify({
      Event: {
        EventName: 'Select',
        ID: data?.ID,
        Info: parseInt(value + 1),
        Text: Items && Items[value],
        Posn: [position?.top, position?.left],
        Size: [Size && Size[0], Size && Size[1]],
      },
    });

    localStorage.setItem(data?.ID, triggerEvent);
    const exists = Event && Event.some((item) => item[0] === 'Select');
    if (!exists) return;
    console.log(triggerEvent);
    socket.send(triggerEvent);
  };

  const handleSelItemsEvent = (value) => {
    const index = Items.indexOf(value);

    if (location == 'inGrid') {
      handleSelectEvent(index);
      handleCellChangeEvent(value);
    } else {
      handleSelectEvent(index);
    }
  };

  useEffect(() => {
    if (!position) return;
    if (!parentOldDimensions) return;

    let calculateLeft =
      position && position.left && parentOldDimensions && parentOldDimensions[1]
        ? (position.left / parentOldDimensions[1]) * dimensions.width
        : 0;

    calculateLeft = Math.max(0, Math.min(calculateLeft, dimensions.width));

    let calculateTop =
      position && position.top && parentOldDimensions && parentOldDimensions[0]
        ? (position.top / parentOldDimensions[0]) * dimensions.height
        : 0;

    calculateTop = Math.max(0, Math.min(calculateTop, dimensions.height));

    setPosition({ top: calculateTop, left: calculateLeft });

    handleData(
      {
        ID: data?.ID,
        Properties: {
          Posn: [calculateTop, calculateLeft],
        },
      },
      'WS'
    );
    setParentOldDimensions([dimensions?.height, dimensions?.width]);

    // if (!localStorage.getItem(data?.ID)) {
    //   const index = SelItems?.findIndex((element) => element == 1);
    //   // setComboInput(Items[index]);
    //   const event = JSON.stringify({
    //     Event: {
    //       EventName: 'Select',
    //       ID: data?.ID,
    //       Info: index + 1,
    //       Posn: [calculateTop, calculateLeft],
    //       Size: [Size && Size[0], Size && Size[1]],
    //       Text: Items && Items[index],
    //     },
    //   });

    //   localStorage.setItem(data?.ID, event);
    // } else {
    //   const { Event } = JSON.parse(localStorage.getItem(data?.ID));
    //   const { Info, Text } = Event;
    //   const index = SelItems?.findIndex((element) => element == 1);
    //   const event = JSON.stringify({
    //     Event: {
    //       EventName: 'Select',
    //       ID: data?.ID,
    //       Info: index + 1,
    //       Posn: [calculateTop, calculateLeft],
    //       Size: [Size && Size[0], Size && Size[1]],
    //       Text: Items && Items[index],
    //     },
    //   });

    //   localStorage.setItem(data?.ID, event);
    // }

    reRender();
  }, [dimensions]);

  const triggerCellMoveEvent = (row, column, value) => {
    const Event = JSON.stringify({
      Event: {
        ID: extractStringUntilSecondPeriod(data?.ID),
        EventName: 'CellMove',
        Info: [row, column, 0, 0, 0, value],
      },
    });

    const exists = event && event.some((item) => item[0] === 'CellMove');
    if (!exists) return;
    console.log(Event);
    socket.send(Event);
  };

  const handleRightArrow = (value) => {
    if (location !== 'inGrid') return;
    console.log(inputRef);
    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const nextSibling = grandParent.nextSibling;
    const querySelector = getObjectTypeById(dataRef.current, nextSibling?.id);

    triggerCellMoveEvent(row, column + 1, value);
    const element = nextSibling?.querySelectorAll(querySelector);
    console.log({ element });

    if (querySelector == 'select') return element && element[0].focus();

    return element && element[0].select();
  };
  const handleLeftArrow = (value) => {
    if (location !== 'inGrid') return;
    console.log(inputRef);
    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const nextSibling = grandParent.previousSibling;
    const querySelector = getObjectTypeById(dataRef.current, nextSibling?.id);
    triggerCellMoveEvent(row, column - 1, value);
    const element = nextSibling?.querySelectorAll(querySelector);

    if (querySelector == 'select') return element && element[0].focus();

    return element && element[0].select();
  };
  const handleUpArrow = (value) => {
    if (location !== 'inGrid') return;
    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const superParent = grandParent.parentElement;
    const nextSibling = superParent.previousSibling;
    const element = nextSibling?.querySelectorAll('select');
    triggerCellMoveEvent(row - 1, column, value);
    element &&
      element.forEach((inputElement) => {
        if (inputElement.id === data?.ID) {
          inputElement.focus();
        }
      });
  };
  const handleCellMove = (value) => {
    if (location !== 'inGrid') return;
    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const superParent = grandParent.parentElement;
    const nextSibling = superParent.nextSibling;
    triggerCellMoveEvent(row + 1, column, value);
    const element = nextSibling?.querySelectorAll('select');
    element &&
      element.forEach((inputElement) => {
        if (inputElement.id === data?.ID) {
          inputElement.focus();
        }
      });
  };

  const handleKeyPress = (e) => {
    e.preventDefault();
    if (e.key == 'ArrowRight') handleRightArrow(e.target.value);
    else if (e.key == 'ArrowLeft') handleLeftArrow(e.target.value);
    else if (e.key == 'ArrowDown') handleCellMove(e.target.value);
    else if (e.key == 'ArrowUp') handleUpArrow(e.target.value);
  };

  // console.log({ comboInput });

  return (
    <div
      style={{
        ...styles,
        borderColor: '#ccc',
        display: Visible == 0 ? 'none' : 'block',
        top: position?.top,
        left: position?.left,
      }}
    >
      <select
        ref={inputRef}
        onKeyDown={(e) => handleKeyPress(e)}
        id={data?.ID}
        value={value ? value : comboInput}
        style={{
          width: '100%',
          border: 0,
          fontSize: '12px',
          height: location === 'inGrid' ? null : '100%',
          zIndex: 1,
        }}
        onChange={(e) => {
          setComboInput(e.target.value);
          handleSelItemsEvent(e.target.value);
        }}
      >
        {Items && Items.map((item, i) => <option value={item}>{item}</option>)}
      </select>
    </div>
  );
};

export default Combo;

//  console.log(
//    event == 'CellChanged'
//      ? JSON.stringify({
//          Event: {
//            EventName: event,
//            ID: extractStringUntilSecondPeriod(data?.ID),
//            Row: parseInt(row),
//            Col: parseInt(column),
//            Value: e.target.value,
//          },
//        })
//      : JSON.stringify({
//          Event: {
//            EventName: data?.Properties?.Event[0],
//            ID: data?.ID,
//            Info: parseInt(index + 1),
//          },
//        })
//  );

//  if (event == 'CellChanged') {
//    localStorage.setItem(
//      extractStringUntilSecondPeriod(data?.ID),
//      JSON.stringify({
//        Event: {
//          EventName: event,
//          ID: extractStringUntilSecondPeriod(data?.ID),
//          Row: parseInt(row),
//          Col: parseInt(column),
//          Value: e.target.value,
//        },
//      })
//    );
//  } else {
//    localStorage.setItem(
//      data?.ID,
//      JSON.stringify({
//        Event: {
//          EventName: emitEvent && emitEvent[0],
//          ID: data?.ID,
//          Info: parseInt(index + 1),
//        },
//      })
//    );
//  }

//  socket.send(
//    event == 'CellChanged'
//      ? JSON.stringify({
//          Event: {
//            EventName: event,
//            ID: extractStringUntilSecondPeriod(data?.ID),
//            Row: parseInt(row),
//            Col: parseInt(column),
//            Value: e.target.value,
//          },
//        })
//      : JSON.stringify({
//          Event: {
//            EventName: emitEvent && emitEvent[0],
//            ID: data?.ID,
//            Info: parseInt(index + 1),
//          },
//        })
//  );
