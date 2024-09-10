import { useEffect, useState } from 'react';
import { useAppData, useResizeObserver } from '../../hooks';
import { extractStringUntilSecondPeriod } from '../../utils';

const VerticalSplitter = ({ data }) => {
  const { Size: SubformSize } = JSON.parse(
    localStorage.getItem(extractStringUntilSecondPeriod(data?.ID))
  );

  const { Posn, SplitObj1, SplitObj2, Event } = data?.Properties;
  const [position, setPosition] = useState({ left: Posn && Posn[1] });
  const [isResizing, setResizing] = useState(false);
  const { handleData, reRender, socket } = useAppData();
  const dimensions = useResizeObserver(
    document.getElementById(extractStringUntilSecondPeriod(data?.ID))
  );
  const [oldFormValues, setoldFormValues] = useState(SubformSize && SubformSize);

  useEffect(() => {
    if (!position) return;
    if (!oldFormValues) return;

    let calculateLeft =
      position && position.left && oldFormValues && oldFormValues[1]
        ? (position.left / oldFormValues[1]) * dimensions.width
        : 0;
    calculateLeft = Math.max(0, Math.min(calculateLeft, dimensions.width - 3));

    // console.log({ calculateLeft });

    setPosition({ left: calculateLeft });
    const rightWidth = dimensions.width - (calculateLeft + 3);
    handleData(
      {
        ID: SplitObj1,
        Properties: {
          Posn: [0, 0],
          Size: [dimensions.height, Math.round(calculateLeft)],
          BCol: [255, 255, 255],
        },
      },
      'WS'
    );

    handleData(
      {
        ID: SplitObj2,
        Properties: {
          Posn: [0, Math.round(calculateLeft + 3)],
          Size: [dimensions?.height, Math.round(rightWidth)],
          BCol: [255, 255, 255],
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
          Info: [0, Math.round(calculateLeft)],
          Size: [formHeight, 3],
        },
      })
    );

    setoldFormValues([dimensions?.height, dimensions?.width]);
    reRender();
  }, [dimensions]);

  let formWidth = dimensions.width;
  let formHeight = dimensions.height;
  const emitEvent = Event && Event[0];
  let verticalStyles = {
    width: '3px',
    height: '100%',
    backgroundColor: '#F0F0F0',
    cursor: 'col-resize',
    position: 'absolute',
    top: Posn && Posn[0],
    left: position?.left,
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const formPositions = JSON.parse(localStorage.getItem('formPositions'));

        let newLeft = e.clientX - formPositions[1];
        newLeft = Math.max(0, Math.min(newLeft, formWidth - 3));
        const rightWidth = formWidth - (newLeft + 3);

        localStorage.setItem(
          SplitObj1,
          JSON.stringify({ Posn: [0, 0], Size: [formHeight, newLeft] })
        );

        localStorage.setItem(
          SplitObj2,
          JSON.stringify({ Posn: [0, newLeft + 3], Size: [formHeight, rightWidth] })
        );

        handleData(
          {
            ID: SplitObj1,
            Properties: {
              Posn: [0, 0],
              Size: [formHeight, newLeft],
              BCol: [255, 255, 255],
            },
          },
          'WS'
        );

        handleData(
          {
            ID: SplitObj2,
            Properties: {
              Posn: [0, newLeft + 3],
              Size: [formHeight, rightWidth],
              BCol: [255, 255, 255],
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
              Info: [0, newLeft],
              Size: [formHeight, 3],
            },
          })
        );
        setPosition({ left: newLeft });
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

  return (
    <div
      id={data?.ID}
      onClick={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      style={verticalStyles}
    ></div>
  );
};

export default VerticalSplitter;
