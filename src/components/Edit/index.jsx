import {
  setStyle,
  extractStringUntilSecondPeriod,
  generateAsteriskString,
  calculateDateAfterDays,
  calculateDaysFromDate,
  rgbColor,
  getObjectById,
  getObjectTypeById,
} from '../../utils';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppData } from '../../hooks';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';


const Edit = ({
  data,
  value,
  event = '',
  row = '',
  column = '',
  location = '',
  values = [],
  T = '',
}) => {
  const { socket, dataRef, findDesiredData, handleData, addChangeEvent , fontScale} = useAppData();

  const dateFormat = JSON.parse(getObjectById(dataRef.current, 'Locale'));

  const { ShortDate, Thousand, Decimal: decimalSeparator } = dateFormat?.Properties;

  let styles = { ...setStyle(data?.Properties) };
  const [inputType, setInputType] = useState('text');
  const [inputValue, setInputValue] = useState('');
  const [emitValue, setEmitValue] = useState('');
  const [initialValue, setInitialValue] = useState('');
  const [prevFocused, setprevFocused] = useState("⌈");
  const dateInputRef = useRef();

  const {
    FieldType,
    MaxLength,
    FCol,
    Decimal,
    Visible,
    Event,
    FontObj,
    Size,
    EdgeStyle,
    Border = 0,
  } = data?.Properties;

  const hasTextProperty = data?.Properties.hasOwnProperty('Text');
  const hasValueProperty = data?.Properties.hasOwnProperty('Value');
  const isPassword = data?.Properties.hasOwnProperty('Password');
  const inputRef = useRef(null);
  const font = findDesiredData(FontObj && FontObj);
  const fontProperties = font && font?.Properties;

  const decideInputValue = useCallback(() => {
    if (location === 'inGrid') {
      if (FieldType === 'Date') {
        setEmitValue(value);
        setInitialValue(value);
        const date = calculateDateAfterDays(value); // Custom function to calculate date
        return setInputValue(dayjs(date).format(ShortDate));
      }

      if (FieldType === 'LongNumeric') {
        setEmitValue(value);
        setInitialValue(value);
        return setInputValue(value);
      }

      setEmitValue(value);
      setInitialValue(value);
      return setInputValue(value);
    }

    if (hasTextProperty) {
      if (isPassword) {
        setInitialValue(generateAsteriskString(data?.Properties?.Text?.length)); // Custom function to generate asterisks
        setEmitValue(data?.Properties?.Text);
        return setInputValue(generateAsteriskString(data?.Properties?.Text?.length));
      } else {
        setEmitValue(data?.Properties?.Text);
        setInitialValue(data?.Properties?.Text);
        return setInputValue(data?.Properties?.Text);
      }
    }

    if (hasValueProperty) {
      if (isPassword) {
        setInitialValue(generateAsteriskString(data?.Properties?.Value?.length)); // Custom function to generate asterisks
        setEmitValue(data?.Properties?.Value);
        return setInputValue(generateAsteriskString(data?.Properties?.Value?.length));
      } else {
        setInitialValue(data?.Properties?.Value);
        setEmitValue(data?.Properties?.Value);
        return setInputValue(data?.Properties?.Value);
      }
    }
  }, [location, FieldType, value, ShortDate, hasTextProperty, isPassword, data, hasValueProperty]);

  // check that the Edit is in the Grid or not

  const handleInputClick = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const decideInputType = useCallback(() => {
    if (FieldType === 'Numeric') {
      setInputType('number');
    } else if (FieldType === 'Date') {
      setInputType('date');
    } else if (isPassword) {
      setInputType('password');
    }
  }, [FieldType, isPassword]);

  useEffect(() => {
    decideInputType();
  }, [decideInputType]);

  useEffect(() => {
    decideInputValue();
  }, [decideInputValue]);

  // Checks for the Styling of the Edit Field

  if (location == 'inGrid') {
    styles = { ...styles, border: 'none', color: FCol ? rgbColor(FCol) : 'black' };
  } else {
    styles = {
      ...styles,
      borderTop: 0,
      borderLeft: 0,
      borderRight: 0,
      borderBottom: '1px solid black',
      color: FCol ? rgbColor(FCol) : 'black',
    };
  }

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

  const handleCellMove = () => {
    if (location !== 'inGrid') return;
    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const superParent = grandParent.parentElement;
    const nextSibling = superParent.nextSibling;
    triggerCellMoveEvent(parseInt(row) + 1, parseInt(column), emitValue);

    const element = nextSibling?.querySelectorAll('input');
    if (!element) return;
    element &&
      element.forEach((inputElement) => {
        if (inputElement.id === data?.ID) {
          inputElement.select();
        }
      });
  };

  const handleRightArrow = () => {
    if (location !== 'inGrid') return;

    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const nextSibling = grandParent.nextSibling;
    const querySelector = getObjectTypeById(dataRef.current, nextSibling?.id);

    let element = nextSibling?.querySelectorAll(querySelector);

    if (element?.length == 0) element = nextSibling?.querySelectorAll('span');

    triggerCellMoveEvent(parseInt(row), parseInt(column) + 1, emitValue);
    element && element[0]?.focus();

    element && element[0]?.select();
  };
  const handleLeftArrow = () => {
    if (location !== 'inGrid') return;

    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const nextSibling = grandParent.previousSibling;

    const querySelector = getObjectTypeById(dataRef.current, nextSibling?.id);
    const element = nextSibling?.querySelectorAll(querySelector);

    triggerCellMoveEvent(parseInt(row), parseInt(column) + 1, emitValue);

    // for (let i = 0; i < children.length; i++) {
    //   children[i].focus();
    // }

    if (!element) return;
    if (querySelector == 'select') return element && element[0].focus();

    return element && element[0]?.select();
  };
  const handleUpArrow = () => {
    if (location !== 'inGrid') return;
    const parent = inputRef.current.parentElement;
    const grandParent = parent.parentElement;
    const superParent = grandParent.parentElement;
    const nextSibling = superParent.previousSibling;

    triggerCellMoveEvent(parseInt(row) - 1, parseInt(column), emitValue);
    const element = nextSibling?.querySelectorAll('input');
    if (!element) return;
    element &&
      element.forEach((inputElement) => {
        if (inputElement.id === data?.ID) {
          inputElement.select();
        }
      });
  };

  const handleKeyPress = (e) => {
    if (e.key == 'ArrowRight') handleRightArrow();
    else if (e.key == 'ArrowLeft') handleLeftArrow();
    else if (e.key == 'ArrowDown') handleCellMove();
    else if (e.key == 'Enter') handleCellMove();
    else if (e.key == 'ArrowUp') handleUpArrow();
    const exists = Event && Event.some((item) => item[0] === 'KeyPress');
    if (!exists) return;

    const isAltPressed = e.altKey ? 4 : 0;
    const isCtrlPressed = e.ctrlKey ? 2 : 0;
    const isShiftPressed = e.shiftKey ? 1 : 0;
    const charCode = e.key.charCodeAt(0);
    let shiftState = isAltPressed + isCtrlPressed + isShiftPressed;

    console.log(
      JSON.stringify({
        Event: {
          EventName: 'KeyPress',
          ID: data?.ID,
          Info: [e.key, charCode, e.keyCode, shiftState],
        },
      })
    );

    socket.send(
      JSON.stringify({
        Event: {
          EventName: 'KeyPress',
          ID: data?.ID,
          Info: [e.key, charCode, e.keyCode, shiftState],
        },
      })
    );
  };

  const triggerChangeEvent = () => {
    const focusedId = localStorage.getItem('current-focus');

    const event2 = JSON.stringify({
      Event: {
        EventName: 'Change',
        ID: data?.ID,
        Info:
          (FieldType && FieldType == 'LongNumeric') || FieldType == 'Numeric'
            ? parseInt(emitValue)
            : emitValue,
      },
    });
    // console.log({event2})
    handleData(
      {
        ID: data?.ID,
        Properties: {
          Text:(FieldType && FieldType == 'LongNumeric') || FieldType == 'Numeric'
          ? parseInt(emitValue)
          : emitValue,
        },
      },
      'WS'
    );
    localStorage.setItem(data?.ID, event2);
    localStorage.setItem("shouldChangeEvent", data.Properties.hasOwnProperty("Event"))

    const prevFocusedID = JSON.parse(localStorage.getItem(prevFocused));
  
  if (!!data.Properties.hasOwnProperty("Event")) {
    const event1 = JSON.stringify({
      Event: {
        EventName: "Change",
        ID: prevFocused,
        Info: [data?.ID],
      },
    });
    const originalValue =
      data?.Properties?.Text || data?.Properties?.Value || "";

    console.log("value focused", { value, emitValue, originalValue },  prevFocusedID,
      prevFocusedID.Event.EventName !== "Select",
      originalValue !== emitValue);

    if (
      prevFocused &&
      prevFocusedID.Event.EventName !== "Select" &&
      originalValue !== emitValue &&
      prevFocused !== data.ID
    ) {
      console.log(
        "focused",
        prevFocusedID,
        prevFocusedID.Event.EventName !== "Select",
        originalValue !== emitValue
      );
      socket.send(event1);
    }
  }
    const exists = Event && Event.some((item) => item[0] === 'Change');
    if (!exists) return;

    const event = JSON.stringify({
      Event: {
        EventName: 'Change',
        ID: data?.ID,
        Info: [],
      },
    });

    localStorage.setItem('change-event', event);
  };

  const triggerCellChangedEvent = () => {
    const gridEvent = findDesiredData(extractStringUntilSecondPeriod(data?.ID));
    values[parseInt(row) - 1][parseInt(column) - 1] = emitValue;
    handleData(
      {
        ID: extractStringUntilSecondPeriod(data?.ID),
        Properties: {
          ...gridEvent.Properties,
          Values: values,
          CurCell: [parseInt(row), parseInt(column)],
        },
      },
      'WS'
    );

    const cellChangedEvent = JSON.stringify({
      Event: {
        EventName: 'CellChanged',
        ID: extractStringUntilSecondPeriod(data?.ID),
        Row: parseInt(row),
        Col: parseInt(column),
        Value: emitValue,
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
        Value: emitValue,
      },
    });

    localStorage.setItem(extractStringUntilSecondPeriod(data?.ID), updatedGridValues);

    // localStorage.setItem(extractStringUntilSecondPeriod(data?.ID), cellChangedEvent);
    const exists = event && event.some((item) => item[0] === 'CellChanged');
    if (!exists) return;
    console.log(cellChangedEvent);
    socket.send(cellChangedEvent);

    if (!formatString) return;

    console.log(formatCellEvent);
    socket.send(formatCellEvent);
  };

  const handleEditEvents = () => {
    // check that the Edit is inside the Grid
    if (location == 'inGrid') {
      if (value != emitValue) {
        triggerChangeEvent();
        triggerCellChangedEvent();
      }
    } else {
      triggerChangeEvent();
    }
  };

  const handleGotFocus = () => {
    const previousFocusedId = localStorage.getItem('current-focus');
    setprevFocused(previousFocusedId);
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

  // updating the styles depending upon the FontObj
  styles = {
    ...styles,
    fontFamily: fontProperties?.PName,
    fontSize: fontProperties?.Size ? `${fontProperties.Size * fontScale}px` : `${12 * fontScale}px`,
    // fontSize: fontProperties?.Size ? `${fontProperties.Size * fontScale}px` : `${11 * fontScale}px`,
    textDecoration: !fontProperties?.Underline
      ? 'none'
      : fontProperties?.Underline == 1
      ? 'underline'
      : 'none',
    fontStyle: !fontProperties?.Italic ? 'none' : fontProperties?.Italic == 1 ? 'italic' : 'none',
    fontWeight: !fontProperties?.Weight ? 0 : fontProperties?.Weight,
  };

  // Date Picker component

  if (inputType == 'date') {
    const handleTextClick = () => {
      inputRef.current.select();
      inputRef.current.showPicker();
    };

    const handleDateChange = (event) => {
      const selectedDate = dayjs(event.target.value).format(ShortDate);
      let value = calculateDaysFromDate(event.target.value) + 1;
      setInputValue(selectedDate);
      setEmitValue(value);
    };

    return (
      <>
        <input
          id={data?.ID}
          style={{
            ...styles,
            borderRadius: '2px',
            fontSize: '12px',
            zIndex: 1,
            display: Visible == 0 ? 'none' : 'block',
            paddingLeft: '5px',
          }}
          value={inputValue}
          type='text'
          readOnly
          onClick={handleTextClick}
          onBlur={() => {
            handleEditEvents();
          }}
          onKeyDown={(e) => handleKeyPress(e)}
        />
        <input
          id={data?.ID}
          type='date'
          ref={inputRef}
          onChange={handleDateChange}
          style={{
            ...styles,
            position: 'absolute',
            zIndex: 1,
            display: 'none',
          }}
        />
      </>
    );
  }

  if (FieldType == 'LongNumeric' || FieldType == 'Numeric') {
    return (
      <NumericFormat
        className='currency'
        allowLeadingZeros={true}
        // ref={inputRef}
        getInputRef={inputRef}
        onClick={handleInputClick}
        id={data?.ID}
        style={{
          ...styles,
          width: !Size ? '100%' : Size[1],
          zIndex: 1,
          display: Visible == 0 ? 'none' : 'block',

          border:
            (Border && Border == '1') || (EdgeStyle && EdgeStyle == 'Ridge')
              ? '1px solid #6A6A6A'
              : 'none',
          textAlign: 'right',
          verticalAlign: 'text-top',
          paddingBottom: '6px',
          paddingRight: '2px',
        }}
        onValueChange={(value) => {
          const { formattedValue } = value;
          setInputValue(value.value);
          setEmitValue(value.value);
        }}
        decimalScale={Decimal}
        value={inputValue}
        decimalSeparator={decimalSeparator}
        thousandSeparator={Thousand}
        onBlur={() => handleEditEvents()}
        onKeyDown={(e) => handleKeyPress(e)}
        onFocus={handleGotFocus}
      />
    );
  }

  return (
    <input
      id={data.ID}
      ref={inputRef}
      value={inputValue}
      onClick={handleInputClick}
      type={inputType}
      onChange={(e) => {
        if (FieldType == 'Char') {
          setEmitValue(e.target.value);
          setInputValue(e.target.value);
        }
        if (!FieldType) {
          setEmitValue(e.target.value);
          setInputValue(e.target.value);
        }
      }}
      onBlur={() => {
        handleEditEvents();
      }}
      onKeyDown={(e) => handleKeyPress(e)}
      style={{
        ...styles,
        width: !Size ? '100%' : Size[1],
        borderRadius: '2px',
        zIndex: 1,
        display: Visible == 0 ? 'none' : 'block',
        paddingLeft: '5px',
        border:
          (Border && Border == '1') || (EdgeStyle && EdgeStyle == 'Ridge')
            ? '1px solid #6A6A6A'
            : 'none',
      }}
      maxLength={MaxLength}
      onFocus={handleGotFocus}
    />
  );
};

export default Edit;
