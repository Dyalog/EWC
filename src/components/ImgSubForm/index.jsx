import { setStyle, getImageStyles } from '../../utils';
import { useAppData } from '../../hooks';
import { useEffect } from 'react';

const ImageSubForm = ({ data }) => {
  const PORT = localStorage.getItem('PORT');

  const { findDesiredData } = useAppData();

  const styles = setStyle(data?.Properties);
  const { Size, Picture, Posn } = data?.Properties;

  const ImageData = findDesiredData(Picture && Picture[0]);

  const imageStyles = getImageStyles(Picture && Picture[1], PORT, ImageData);

  const parentSize = JSON.parse(localStorage.getItem('formDimension'));

  useEffect(() => {
    localStorage.setItem(
      data.ID,
      JSON.stringify({
        Size: !Size ? [parentSize[0], parentSize[1]] : Size,
        Posn: !Posn ? [0, 0] : Posn,
      })
    );
  }, []);

  let updatedStyles = { ...styles, ...imageStyles };

  return <div style={updatedStyles}></div>;
};

export default ImageSubForm;
