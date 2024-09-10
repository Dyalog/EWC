import { extractStringUntilSecondPeriod, setStyle } from '../utils';
import { useEffect, useRef, useState } from 'react';
import { useResizeObserver } from '../hooks';

const List = ({ data }) => {
  const styles = setStyle(data?.Properties);
  const { Items, SelItems, Visible, Size } = data?.Properties;
  const ref = useRef();
  const [selectedItem, _] = useState(1);
  const [items, setItems] = useState(SelItems);
  const dimensions = useResizeObserver(
    document.getElementById(extractStringUntilSecondPeriod(data?.ID))
  );
  const [width, setWidth] = useState(Size[1]);
  useEffect(() => {
    setWidth(dimensions?.width - 50);
  }, [dimensions]);

  const selectedStyles = {
    background: '#1264FF',
    color: 'white',
    cursor: 'pointer',
  };

  const handleClick = (index) => {
    const length = SelItems.length;
    let updatedArray = Array(length).fill(0);

    updatedArray[index] = 1;

    localStorage.setItem(
      data?.ID,
      JSON.stringify({
        Event: {
          ID: data?.ID,
          SelItems: updatedArray,
        },
      })
    );

    setItems(updatedArray);
  };

  return (
    <div
      ref={ref}
      style={{
        ...styles,
        width,
        border: '1px solid black',
        display: Visible == 0 ? 'none' : 'block',
      }}
    >
      {Items &&
        Items.map((item, index) =>
          selectedItem == items[index] ? (
            <div
              style={{
                ...selectedStyles,
                fontSize: '12px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                padding: '1px',
              }}
            >
              {item}
            </div>
          ) : (
            <div
              onClick={() => handleClick(index)}
              style={{
                cursor: 'pointer',
                fontSize: '12px',
                height: '14px',
                padding: '1px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {item}
            </div>
          )
        )}
    </div>
  );
};

export default List;
