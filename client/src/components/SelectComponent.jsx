import { getObjectById } from '../utils';

import Form from './Form';
import MenuBar from './MenuBar';
import Menu from './Menu';
import Grid from './Grid';
import Edit from './Edit';
import Button from './Button';
import Combo from './Combo';
import Label from './Label';
import Treeview from './Treeview';
import List from './List';
import Splitter from './Splitter';
import Group from './Group';
import ScrollBar from './ScrollBar';
import TabControl from './TabControl';
import TabButton from './TabButton';

import TextArea from './TextArea';
import CustomRibbon from './Ribbon';
import CustomRibbonGroup from './Ribbon/RibbonGroup';
import CustomRibbonItem from './Ribbon/RibbonItem';
import CustomRibbonButton from './Ribbon/RibbonButton';
import CustomRibbonButtonGroup from './Ribbon/RibbonButtonGroup';
import Poly from './Polygon';
import Rectangle from './Rectangle';
import Ecllipse from './Ecllipse';
import Circle from './Circle';
import Text from './Text';
import Timer from './Timer';
import ListView from './ListView';
import SubForm from './DynamicSubForm';
import Image from './Image';
import { useAppData } from '../hooks';
import Chart from './Chart';
import MessageBox from './MessageBox';

// Kendo UI
import KendoChart from './KendoChart';
import KendoGrid from './KendoGrid';

const SelectComponent = ({
  data,
  inputValue = '',
  event = '',
  row = '',
  column = '',
  location,
  inSplitter = null,
  values = [],
  formatString = '',
  activeTab = null,
  bgColor = null,
  fontColor = null,
  activebgColor = null,
  handleTabClick = () => {},
}) => {
  const { dataRef } = useAppData();

  if (data?.Properties?.Type == 'Form') return <Form data={data} />;
  if (data?.Properties?.Type == 'MenuBar')
    return (
      <div
        style={{
          translate: '0% -100%',
          position: 'relative',
          zIndex: '2',
          width: '100%',
        }}
      >
        <MenuBar data={data} />
      </div>
    );
  if (data?.Properties?.Type == 'Menu') return <Menu data={data} />;
  if (data?.Properties?.Type == 'Grid') return <Grid data={data} />;
  if (data?.Properties?.Type == 'Edit' && data?.Properties?.Style !== 'Multi')
    return (
      <div
        style={
          location == 'inGrid'
            ? {
                display: 'flex',
                justifyContent:
                  data?.Properties?.FieldType == 'Numeric' ||
                  data?.Properties?.FieldType == 'LongNumeric'
                    ? 'end'
                    : 'start',
              }
            : null
        }
      >
        <Edit
          values={values}
          location={location}
          data={data}
          value={inputValue}
          event={event}
          row={row}
          column={column}
          formatString={formatString}
        />
      </div>
    );
  if (data?.Properties?.Type == 'Button')
    return (
      <Button
        data={data}
        location={location}
        inputValue={inputValue}
        event={event}
        row={row}
        column={column}
        values={values}
      />
    );
  if (data?.Properties?.Type == 'Combo')
    return (
      <Combo
        data={data}
        location={location}
        value={inputValue}
        event={event}
        row={row}
        column={column}
        values={values}
      />
    );
  if (data?.Properties?.Type == 'Label')
    return <Label location={location} gridValue={inputValue} data={data} />;
  if (data?.Properties?.Type == 'TreeView') return <Treeview data={data} />;
  if (data?.Properties?.Type == 'List') return <List data={data} />;
  if (data?.Properties?.Type == 'Splitter') return <Splitter data={data} />;
  if (data?.Properties?.Type == 'Group') return <Group data={data} />;
  if (data?.Properties?.Type == 'Scroll') return <ScrollBar data={data} />;
  if (data?.Properties?.Type == 'TabControl') return <TabControl data={data} />;
  if (data?.Properties?.Type == 'TabButton')
    return (
      <TabButton
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        data={data}
        bgColor={bgColor}
        fontColor={fontColor}
        activebgColor={activebgColor}
      />
    );
  if (data?.Properties?.Type == 'Edit' && data?.Properties?.Style == 'Multi') {
    return <TextArea data={data} />;
  }
  if (data?.Properties?.Type == 'Ribbon') return <CustomRibbon data={data} />;
  if (data?.Properties?.Type == 'RibbonGroup') return <CustomRibbonGroup data={data} />;
  if (data?.Properties?.Type == 'RibbonGroupItem') return <CustomRibbonItem data={data} />;
  if (data?.Properties?.Type == 'RibbonButton') return <CustomRibbonButton data={data} />;
  if (data?.Properties?.Type == 'RibbonButtonGroup') return <CustomRibbonButtonGroup data={data} />;

  if (data?.Properties?.Type == 'Poly') return <Poly data={data} />;
  if (data?.Properties?.Type == 'Rect') return <Rectangle data={data} />;
  if (data?.Properties?.Type == 'SubForm') {
    return <SubForm data={data} />;
  }

  if (data?.Properties?.Type == 'Text') {
    const font = JSON.parse(getObjectById(dataRef?.current, data?.Properties?.FontObj));

    return <Text data={data} fontProperties={font?.Properties} />;
  }

  if (data?.Properties?.Type == 'Timer') return <Timer data={data} />;
  if (data?.Properties?.Type == 'ListView') return <ListView data={data} />;
  if (data?.Properties?.Type == 'Image') return <Image data={data} />;
  if (data?.Properties?.Type == 'Ellipse') return <Ecllipse data={data} />;
  if (data?.Properties?.Type == 'Circle') return <Circle data={data} />;
  if (data?.Properties?.Type == 'ApexChart') return <Chart data={data} />;
  if (data?.Properties?.Type == 'MsgBox') return <MessageBox data= {data} />;

  if (data?.Properties?.Type == 'KendoChart') return <KendoChart data={data} />;
  if (data?.Properties?.Type == 'KendoGrid') return <KendoGrid data={data} />;

  console.log("UNKNOWN: " + data?.Properties?.Type);
};

export default SelectComponent;
