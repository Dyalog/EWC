import { useState, useEffect } from 'react';
import {
  setStyle,
  excludeKeys,
  getImageStyles,
  extractStringUntilSecondPeriod,
  parseFlexStyles,
} from '../utils';
import SelectComponent from './SelectComponent';
import { useAppData, useResizeObserver } from '../hooks';

const Group = ({ data }) => {
  const PORT = localStorage.getItem('PORT');
  const { Visible, Picture, Border = 1, Size, Flex = 0, CSS } = data?.Properties;
  const { findDesiredData } = useAppData();
  const dimensions = useResizeObserver(
    document.getElementById(extractStringUntilSecondPeriod(data?.ID))
  );

  const [width, setWidth] = useState(Size[1]);
  const [height, setHeight] = useState(Size[0]);

  useEffect(() => {
    setWidth(dimensions?.width - 47);
    setHeight(dimensions?.height - 47);
  }, [dimensions]);

  const ImageData = findDesiredData(Picture && Picture[0]);

  const imageStyles = getImageStyles(Picture && Picture[1], PORT, ImageData);

  const flexStyles = parseFlexStyles(CSS);

  const updatedData = excludeKeys(data);

  const styles = setStyle(data?.Properties, 'absolute', Flex);

  return (
    <div
      style={{
        ...styles,
        width,
        height,
        border: Border == 0 ? 'none' : '1px solid #E9E9E9',
        display: Visible == 0 ? 'none' : 'block',
        ...imageStyles,
        ...flexStyles,
      }}
      id={data?.ID}
    >
      {data?.Properties?.Caption != '' && (
        <span
          style={{
            fontSize: '12px',
            // fontSize: '10px',
            position: 'relative',
            bottom: 14,
            left: 10,
            background: '#F1F1F1 ',
          }}
        >
          {data?.Properties?.Caption}
        </span>
      )}
      {Object.keys(updatedData).map((key) => (
        <SelectComponent data={updatedData[key]} />
      ))}
    </div>
  );
};

export default Group;
