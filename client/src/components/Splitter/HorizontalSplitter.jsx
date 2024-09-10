import { useState, useEffect, useRef } from 'react';
import { useAppData, useResizeObserver } from '../../hooks';
import { extractStringUntilSecondPeriod } from '../../utils';

const HorizontalSplitter = ({ data }) => {
  const { Size: SubformSize, Posn: SubFormPosn } = JSON.parse(
    localStorage.getItem(extractStringUntilSecondPeriod(data?.ID))
  );

  const { Posn, SplitObj1, SplitObj2, Event, Size } = data?.Properties;
  const [position, setPosition] = useState({ top: Posn && Posn[0] });
  const [isResizing, setResizing] = useState(false);
  const { handleData, reRender, socket } = useAppData();
  const dimensions = useResizeObserver(
    document.getElementById(extractStringUntilSecondPeriod(data?.ID))
  );

  const [oldFormValues, setoldFormValues] = useState(SubformSize && SubformSize);
  const [oldHeight, setOldHeight] = useState(Size && Size[0]);

  useEffect(() => {
    if (!position) return;
    if (!oldFormValues) return;

    if (oldHeight == dimensions.height) {
      const obj1 = JSON.parse(localStorage.getItem(SplitObj1));
      const obj2 = JSON.parse(localStorage.getItem(SplitObj2));
      if (!obj1 && !obj2) return;
      const { Size: Size1, Posn: Posn1 } = obj1;
      const { Size: Size2, Posn: Posn2 } = obj2;
      localStorage.setItem(
        SplitObj1,
        JSON.stringify({
          Size: [Math.round(Size1 && Size1[0]), dimensions.width],
          Posn: Posn1,
        })
      );
      localStorage.setItem(
        SplitObj2,
        JSON.stringify({
          Size: [Math.round(Size2 && Size2[0]), dimensions.width],
          Posn: Posn2,
        })
      );
      handleData(
        {
          ID: SplitObj1,
          Properties: {
            Posn: Posn1,
            Size: [Math.round(Size1 && Size1[0]), dimensions.width],
          },
        },
        'WS'
      );
      handleData(
        {
          ID: SplitObj2,
          Properties: {
            Posn: Posn2,
            Size: [Math.round(Size2 && Size2[0]), dimensions.width],
          },
        },
        'WS'
      );
    } else {
      let calculateTop =
        position && position.top && oldFormValues && oldFormValues[0]
          ? (position.top / oldFormValues[0]) * dimensions.height
          : 0;
      calculateTop = Math.max(0, Math.min(calculateTop, dimensions.height - 3));

      setPosition({ top: Math.round(calculateTop) });

      handleData(
        {
          ID: SplitObj1,
          Properties: {
            Posn: [0, 0],
            Size: [Math.round(calculateTop), dimensions.width],
          },
        },
        'WS'
      );

      handleData(
        {
          ID: SplitObj2,
          Properties: {
            Posn: [Math.round(calculateTop + 3), 0],
            Size: [Math.round(dimensions?.height - (calculateTop + 3)), dimensions.width],
          },
        },
        'WS'
      );
    }

    setOldHeight(dimensions.height);
    setoldFormValues([dimensions?.height, dimensions?.width]);

    reRender();
  }, [dimensions]);

  let formHeight = dimensions.height;
  const emitEvent = Event && Event[0];

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const formPositions = JSON.parse(localStorage.getItem('formPositions'));
        let newTop = e.clientY - formPositions[1];

        const parentSize = JSON.parse(
          localStorage.getItem(extractStringUntilSecondPeriod(data?.ID))
        );
        const { Size } = parentSize;

        newTop = Math.max(0, Math.min(newTop, formHeight));
        handleData(
          {
            ID: SplitObj1,
            Properties: {
              Posn: [0, 0],
              Size: [newTop, Size[1]],
            },
          },
          'WS'
        );

        handleData(
          {
            ID: SplitObj2,
            Properties: {
              Posn: [newTop + 3, 0],
              Size: [formHeight - (newTop + 3), Size[1]],
            },
          },
          'WS'
        );

        localStorage.setItem(
          data?.ID,
          JSON.stringify({
            Event: {
              EventName: emitEvent && emitEvent[0],
              ID: data.ID,
              Info: [newTop, 0],
              Size: [3, formHeight],
            },
          })
        );
        setPosition({ top: newTop });
        reRender();
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setResizing(false);
        const { Event: customEvent } = JSON.parse(localStorage.getItem(data?.ID));
        const { Size, ...event } = customEvent;
        const exists = Event && Event?.some((item) => item[0] === 'EndSplit');
        if (!exists) return;
        console.log(JSON.stringify({ Event: { ...event } }));
        socket.send(JSON.stringify({ Event: { ...event } }));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setResizing(true);
  };

  let horizontalStyles = {
    width: '100%',
    height: '3px',
    backgroundColor: '#F0F0F0',
    cursor: 'row-resize',
    position: 'absolute',
    top: position?.top,
    left: 0,
  };

  return <div id={data?.ID} style={horizontalStyles} onMouseDown={(e) => handleMouseDown(e)}></div>;
};

export default HorizontalSplitter;
