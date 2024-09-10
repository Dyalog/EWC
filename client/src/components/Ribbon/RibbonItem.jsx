import { RibbonGroupItem } from 'react-bootstrap-ribbon';
import { excludeKeys } from '../../utils';
import SelectComponent from '../SelectComponent';

const CustomRibbonItem = ({ data }) => {
  const updatedData = excludeKeys(data);

  const { Size } = data?.Properties;
  const size = Size || 12;

  return (
    <div
      id={data?.ID}
      style={{ display: 'flex', justifyContent: 'center' }}
      className={`col-${size}`}
    >
      {Object.keys(updatedData).map((key) => {
        return <SelectComponent data={updatedData[key]} />;
      })}
    </div>
  );
};

export default CustomRibbonItem;
