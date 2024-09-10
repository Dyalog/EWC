import { setStyle, extractStringUntilSecondPeriod, getObjectTypeById } from '../utils';
import { useAppData, useResizeObserver } from '../hooks';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { getObjectById, getImageStyles } from '../utils';

const Button = ({
  data,
  inputValue,
  event = '',
  row = '',
  column = '',
  location = '',
  values = [],
}) => {
  const PORT = localStorage.getItem('PORT');

  const parentSize = JSON.parse(localStorage.getItem(extractStringUntilSecondPeriod(data?.ID)));

  const styles = setStyle(data?.Properties);
  const { socket, findDesiredData, dataRef, handleData, reRender } = useAppData();
  const { Picture, State, Visible, Event, Caption, Align, Posn, Size } = data?.Properties;
  const inputRef = useRef();

  const dimensions = useResizeObserver(
    document.getElementById(extractStringUntilSecondPeriod(data?.ID))
  );

  const [checkInput, setCheckInput] = useState();

  const [radioValue, setRadioValue] = useState(State ? State : 0);

  const hasCaption = data.Properties.hasOwnProperty('Caption');

  const isCheckBox = data?.Properties?.Style && data?.Properties?.Style == 'Check';

  const isRadio = data?.Properties?.Style && data?.Properties?.Style == 'Radio';

  const ImageData = findDesiredData(Picture && Picture[0]);

  const buttonEvent = data.Properties.Event && data?.Properties?.Event[0];

  const imageStyles = getImageStyles(Picture && Picture[1], PORT, ImageData);
  const [position, setPosition] = useState({ top: Posn && Posn[0], left: Posn && Posn[1] });
  const [parentOldDimensions, setParentOldDimensions] = useState(parentSize?.Size);

  const decideInput = () => {
    if (location == 'inGrid') {
      return setCheckInput(inputValue);
    }
    setCheckInput(State && State);
  };

  useEffect(() => {
    decideInput();
    setPosition({ top: Posn && Posn[0], left: Posn && Posn[1] });
  }, [data]);

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

    setPosition({ top: Math.round(calculateTop), left: Math.round(calculateLeft) });

    setParentOldDimensions([dimensions?.height, dimensions?.width]);
    handleData(
      {
        ID: data?.ID,
        Properties: {
          ...(data?.Properties?.hasOwnProperty('Posn')
            ? { Posn: [Math.round(calculateTop), Math.round(calculateLeft)] }
            : {}),
        },
      },
      'WS'
    );

    if (!localStorage.getItem(data?.ID)) {
      const event = JSON.stringify({
        Event: {
          EventName: 'Select',
          ID: data?.ID,
          Value: 0,
          Posn: [Math.round(calculateTop), Math.round(calculateLeft)],
          Size: [Size && Size[0], Size && Size[1]],
        },
      });

      localStorage.setItem(data?.ID, event);
    } else {
      const { Event } = JSON.parse(localStorage.getItem(data?.ID));
      const { Value } = Event;
      const event = JSON.stringify({
        Event: {
          EventName: 'Select',
          ID: data?.ID,
          Value,
          Posn: [Math.round(calculateTop), Math.round(calculateLeft)],
          Size: [Size && Size[0], Size && Size[1]],
        },
      });

      localStorage.setItem(data?.ID, event);
    }
    setParentOldDimensions([dimensions?.height, dimensions?.width]);
    reRender();
  }, [dimensions]);

  const handleCellChangedEvent = (value) => {
    const gridEvent = findDesiredData(extractStringUntilSecondPeriod(data?.ID));
    (values[parseInt(row) - 1][parseInt(column) - 1] = value ? 1 : 0),
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
        Value: value ? 1 : 0,
      },
    });

    const updatedGridValues = JSON.stringify({
      Event: {
        EventName: 'CellChanged',
        Values: values,
        CurCell: [row, column],
      },
    });

    const formatCellEvent = JSON.stringify({
      FormatCell: {
        Cell: [row, column],
        ID: extractStringUntilSecondPeriod(data?.ID),
        Value: value ? 1 : 0,
      },
    });

    localStorage.setItem(extractStringUntilSecondPeriod(data?.ID), updatedGridValues);
    const exists = event && event.some((item) => item[0] === 'CellChanged');
    if (!exists) return;
    console.log(triggerEvent);
    console.log(formatCellEvent);
    socket.send(formatCellEvent);
    socket.send(triggerEvent);
  };

  const handleSelectEvent = (value) => {
    const triggerEvent = JSON.stringify({
      Event: {
        EventName: 'Select',
        ID: data?.ID,
        Value: value ? 1 : 0,
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

  const handleCheckBoxEvent = (value) => {
    if (location == 'inGrid') {
      handleSelectEvent(value);
      handleCellChangedEvent(value);
    } else {
      handleSelectEvent(value);
    }
  };

  const triggerCellMoveEvent = (row, column) => {
    const Event = JSON.stringify({
      Event: {
        ID: extractStringUntilSecondPeriod(data?.ID),
        EventName: 'CellMove',
        Info: [row, column, 0, 0, 0, checkInput ? 1 : 0],
      },
    });
    const exists = event && event.some((item) => item[0] === 'CellMove');
    if (!exists) return;
    console.log(Event);
    socket.send(Event);
  };

  const handleCellMove = () => {
    if (location !== 'inGrid') return;
    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const superParent = grandParent.parentElement;
    const nextSibling = superParent.nextSibling;
    triggerCellMoveEvent(row + 1, column);
    const element = nextSibling?.querySelectorAll('input');
    element &&
      element.forEach((inputElement) => {
        if (inputElement.id === data?.ID) {
          inputElement.focus();
        }
      });
  };

  const handleRightArrow = () => {
    if (location !== 'inGrid') return;
    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const nextSibling = grandParent.nextSibling;
    const querySelector = getObjectTypeById(dataRef.current, nextSibling?.id);
    triggerCellMoveEvent(row, column + 1);
    const element = nextSibling?.querySelectorAll(querySelector);

    if (querySelector == 'select') return element && element[0].focus();

    return element && element[0].select();
  };
  const handleLeftArrow = () => {
    if (location !== 'inGrid') return;
    console.log(inputRef);
    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const nextSibling = grandParent.previousSibling;
    const querySelector = getObjectTypeById(dataRef.current, nextSibling?.id);
    triggerCellMoveEvent(row, column - 1);
    const element = nextSibling?.querySelectorAll(querySelector);

    element && element[0]?.focus();

    return element && element[0]?.select();
  };
  const handleUpArrow = () => {
    if (location !== 'inGrid') return;
    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const superParent = grandParent.parentElement;
    const nextSibling = superParent.previousSibling;
    triggerCellMoveEvent(row - 1, column);
    const element = nextSibling?.querySelectorAll('input');
    element &&
      element.forEach((inputElement) => {
        if (inputElement.id === data?.ID) {
          inputElement.focus();
        }
      });
  };

  const handleKeyPress = (e) => {
    if (e.key == 'Enter') handleCellMove();
    else if (e.key == 'ArrowRight') handleRightArrow();
    else if (e.key == 'ArrowLeft') handleLeftArrow();
    else if (e.key == 'ArrowDown') handleCellMove();
    else if (e.key == 'ArrowUp') handleUpArrow();
  };

  //handle got focus event on all controls
  const handleGotFocus = () => {
    const previousFocusedId = localStorage.getItem('current-focus');
    const gotFocusEvent = JSON.stringify({
      Event: {
        EventName: 'GotFocus',
        ID: data?.ID,
        Info: !previousFocusedId ? [''] : [previousFocusedId],
      },
    });
    localStorage.setItem('current-focus', data?.ID);
    const exists = Event && Event.some((item) => item[0] === 'GotFocus');

    if (!exists || previousFocusedId == data?.ID) return;
    console.log(gotFocusEvent);
    socket.send(gotFocusEvent);
  };

  if (isCheckBox) {
    let checkBoxPosition = null;
    if (Align && Align == 'Left') {
      checkBoxPosition = { position: 'absolute', right: 0, top: 3 };
    } else if (!Align || Align == 'Right') {
      checkBoxPosition = { position: 'absolute', left: 0, top: 3 };
    }

    if (location == 'inGrid') {
      checkBoxPosition = { ...checkBoxPosition, marginLeft: '5px' };
    }

    return (
      <div
        onKeyDown={(e) => handleKeyPress(e)}
        style={{
          ...styles,
          zIndex: 1,
          display: Visible == 0 ? 'none' : 'block',
        }}
      >
        {Align && Align == 'Left' ? (
          <div style={{ fontSize: '12px', position: 'absolute', top: 0, left: 0 }}>{Caption}</div>
        ) : null}

        <input
          onFocus={handleGotFocus}
          ref={inputRef}
          onKeyDown={(e) => handleKeyPress(e)}
          id={data?.ID}
          type='checkbox'
          style={checkBoxPosition}
          checked={checkInput}
          onChange={(e) => {
            setCheckInput(e.target.checked);
            handleCheckBoxEvent(e.target.checked);
          }}
        />
        {!Align || Align == 'Right' ? (
          <div style={{ fontSize: '12px', position: 'absolute', top: 0, left: 16 }}>{Caption}</div>
        ) : null}
      </div>
    );
  }

  if (isRadio) {
    let radioPosition = null;
    if (Align && Align == 'Left') {
      radioPosition = { position: 'absolute', right: 0, top: 3 };
    } else if (!Align || Align == 'Right') {
      radioPosition = { position: 'absolute', left: 0, top: 3 };
    }

    const handleRadioSelectEvent = (value) => {
      const emitEvent = JSON.stringify({
        Event: {
          EventName: 'Select',
          ID: data?.ID,
          Value: value,
        },
      });
      const exists = Event && Event.some((item) => item[0] === 'Select');
      if (!exists) return;
      console.log(emitEvent);
      socket.send(emitEvent);
    };

    const handleRadioButton = (id, value) => {
      const parentElement = document.getElementById(extractStringUntilSecondPeriod(data?.ID));
      var radioInputs = parentElement.getElementsByTagName('input');
      for (var i = 0; i < radioInputs.length; i++) {
        var radioId = radioInputs[i].id;
        const button = JSON.parse(getObjectById(dataRef.current, radioId));
        handleData(
          {
            ID: button.ID,
            Properties: {
              ...button?.Properties,
              State: data?.ID == button?.ID ? 1 : 0,
            },
          },
          'WS'
        );
      }

      handleRadioSelectEvent(value);
    };

    useEffect(() => {
      setRadioValue(State);
    }, [data]);

    return (
      <div
        style={{
          ...styles,
          zIndex: 1,
          display: Visible == 0 ? 'none' : 'block',
        }}
      >
        {Align && Align == 'Left' ? (
          <div style={{ fontSize: '12px', position: 'absolute', top: 2, left: 0 }}>{Caption}</div>
        ) : null}
        <input
          onFocus={handleGotFocus}
          name={extractStringUntilSecondPeriod(data?.ID)}
          id={data?.ID}
          checked={radioValue}
          type='radio'
          value={Caption}
          onChange={(e) => {
            handleRadioButton(data?.ID, e.target.checked);
          }}
        />
        {!Align || Align == 'Right' ? (
          <div style={{ fontSize: '12px', position: 'absolute', top: 2, left: 16 }}>{Caption}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      id={data?.ID}
      onClick={() => {
        console.log(
          JSON.stringify({
            Event: {
              EventName: buttonEvent[0],
              ID: data?.ID,
            },
          })
        );
        if (localStorage.getItem("current-focus") && localStorage.getItem("shouldChangeEvent")=== "true") {
        console.log(
          JSON.stringify({
            Event: {
              EventName: "Change",
              ID: localStorage.getItem("current-focus"),
              Info: [data?.ID]
            },
          })
        );

          socket.send(
            JSON.stringify({
              Event: {
                EventName: "Change",
                ID: localStorage.getItem("current-focus"),
                Info: [data?.ID],
              },
            })
          );
        }

      

        socket.send(
          JSON.stringify({
            Event: {
              EventName: buttonEvent[0],
              ID: data?.ID,
            },
          })
        );

        handleGotFocus();
      }}
      style={{
        ...styles,
        border: '1px solid black',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        borderRadius: '4px',
        borderColor: '#ccc',
        fontSize: '12px',
        // fontSize: '11px',
        cursor: 'pointer',
        zIndex: 1,
        display: Visible == 0 ? 'none' : 'flex',
        ...(data?.Properties?.hasOwnProperty('Posn') ? { top: position?.top } : {}),
        ...(data?.Properties?.hasOwnProperty('Posn') ? { left: position?.left } : {}),
        // left: position?.left,
      }}
    >
      {ImageData ? <div style={{ ...imageStyles, width: '100%', height: '100%' }}></div> : null}

      {hasCaption
        ? data?.Properties?.Caption?.includes('&')
          ? data?.Properties?.Caption?.substring(1)
          : data?.Properties?.Caption
        : null}
    </div>
  );
};

export default Button;
