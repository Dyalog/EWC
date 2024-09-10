import React, { useRef, useEffect, useState } from 'react';
import { useAppData } from '../../hooks';

const GridSelect = ({ data }) => {
  const selectRef = useRef(null);

  const { Items } = data?.typeObj?.Properties;
  const [comboInput, setComboInput] = useState(data?.value);
  const { findDesiredData, socket, handleData } = useAppData();

  useEffect(() => {
    if (data.focused) {
      selectRef.current.focus();
    }
  }, [data.focused]);

  const handleCellChangeEvent = (value) => {
    const gridEvent = findDesiredData(data?.gridId);
    const values = data?.gridValues;
    values[data?.row - 1][data?.column] = value;
    handleData(
      {
        ID: data?.gridId,
        Properties: {
          ...gridEvent.Properties,
          Values: values,
          CurCell: [data?.row, data?.column + 1],
        },
      },
      'WS'
    );

    const triggerEvent = JSON.stringify({
      Event: {
        EventName: 'CellChanged',
        ID: data?.gridId,
        Row: data?.row,
        Col: data?.column + 1,
        Value: value,
      },
    });

    const updatedGridValues = JSON.stringify({
      Event: {
        EventName: 'CellChanged',
        Values: values,
        CurCell: [data?.row, data?.column + 1],
      },
    });

    localStorage.setItem(data?.gridId, updatedGridValues);

    const exists = data?.gridEvent?.some((item) => item[0] === 'CellChanged');
    if (!exists) return;

    console.log(triggerEvent);
    socket.send(triggerEvent);
    localStorage.setItem(
      'isChanged',
      JSON.stringify({
        isChange: true,
        value: value,
      })
    );
  };

  const handleSelItemsEvent = (value) => {
    const index = Items.indexOf(value);

    // handleSelectEvent(index);
    handleCellChangeEvent(value);
  };

  return (
    <select
      onKeyDown={(e) => e.preventDefault()}
      onClick={(e) =>
        console.log("click")
       
        }
      ref={selectRef}
      value={comboInput}
      style={{ border: 0, outline: 0, width: '100%', height: '100%' }}
      id={`${data?.typeObj?.ID}.r${data?.row + 1}.c${data?.column + 1}`}
      onChange={(e) => {
        setComboInput(e.target.value);
        handleSelItemsEvent(e.target.value);
      }}
    >
      {Items && Items.map((item, i) => <option value={item}>{item}</option>)}
    </select>
  );
};

export default GridSelect;
