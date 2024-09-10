import { excludeKeys } from '../utils';
import SelectComponent from './SelectComponent';
import TextArea from './TextArea';
import { useEffect } from 'react';


const SubForm = ({ data }) => {
  const updatedData = excludeKeys(data);
  const parentSize = JSON.parse(localStorage.getItem('formDimension'));

  const { Size, Posn, Visible } = data?.Properties;

  useEffect(() => {
    localStorage.setItem(
      data.ID,
      JSON.stringify({
        Size: !Size ? [parentSize[0], parentSize[1]] : Size,
        Posn: !Posn ? [0, 0] : Posn,
      })
    );
  }, []);

  return (
    <div style={{ position: 'relative', border: '1px solid #FAFAFA' }}>
      {Object.keys(updatedData).map((key) => {
        return <TextArea data={updatedData[key]} />;
      })}
    </div>
  );
};

export default SubForm;
