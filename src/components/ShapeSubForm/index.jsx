import { excludeKeys, setStyle } from '../../utils';
import Rectangle from '../Rectangle';
import Button from '../Button';
import Treeview from '../Treeview';
import Edit from '../Edit';
import TextArea from '../TextArea';
import Text from '../Text';
import Label from '../Label';
import { useEffect } from 'react';
import ListView from '../ListView';
import Group from '../Group';
import Grid from '../Grid';
import SelectComponent from '../SelectComponent';
import ScrollBar from '../ScrollBar';

const ShapeSubForm = ({ data, inSplitter }) => {
  const { Posn, Size, Visible } = data?.Properties;
  let styles = setStyle(data?.Properties);
  const updatedData = excludeKeys(data);

  const parentSize = JSON.parse(localStorage.getItem('formDimension'));

  if (!Size) {
    styles = {
      width: parentSize[1],
      height: parentSize[0],
    };
  }

  if (!Posn) {
    styles = {
      top: 0,
      left: 0,
    };
  }

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
    <div
      style={{
        display: Visible == 0 ? 'none' : 'block',
        ...styles,
        background: inSplitter ? null : '#F0F0F0',
      }}
    >
      {Object.keys(updatedData).map((key) => {
        if (updatedData[key].Properties.Type == 'Rect') {
          return <Rectangle parentSize={Size} posn={Posn} data={updatedData[key]} />;
        } else if (updatedData[key].Properties.Type == 'Button') {
          return <Button data={updatedData[key]} />;
        } else if (updatedData[key].Properties.Type == 'TreeView') {
          return <Treeview data={updatedData[key]} />;
        } else if (updatedData[key].Properties.Type == 'Edit') {
          return <Edit data={updatedData[key]} />;
        } else if (
          updatedData[key].Properties.Type == 'Edit' &&
          updatedData[key].Properties.Style == 'Multi'
        ) {
          return <TextArea data={updatedData[key]} />;
        } else if (updatedData[key].Properties.Type == 'Text') {
          return <Text data={updatedData[key]} />;
        } else if (updatedData[key].Properties.Type == 'Label') {
          return <Label data={updatedData[key]} />;
        } else if (updatedData[key].Properties.Type == 'ListView') {
          return <ListView data={updatedData[key]} />;
        } else if (updatedData[key].Properties.Type == 'Group') {
          if (!inSplitter) return <Group data={updatedData[key]} />;
        } else if (updatedData[key].Properties.Type == 'SubForm') {
          return <SelectComponent data={updatedData[key]} />;
        } else if (updatedData[key].Properties.Type == 'Scroll') {
          return <ScrollBar data={updatedData[key]} />;
        }
      })}
    </div>
  );
};

export default ShapeSubForm;
