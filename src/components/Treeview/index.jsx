import {
  setStyle,
  getStringafterPeriod,
  getObjectById,
  calculateSumFromString,
  findParentIndex,
  extractStringUntilSecondPeriod,
} from '../../utils';
import { useAppData } from '../../hooks';
import { useEffect, useState, useRef } from 'react';

import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import './TreeView.css';

const Treeview = ({ data }) => {
  const PORT = localStorage.getItem('PORT');
  const { Depth, Items, ImageListObj, ImageIndex, Visible, Event } = data?.Properties;

  const [nodeData, setNodeData] = useState([]);

  const { dataRef, socket, findDesiredData } = useAppData();

  const styles = setStyle(data?.Properties);
  const treeData = [];
  let parentIndex = -1;

  let childIndex = 0;

  const ID = getStringafterPeriod(ImageListObj);

  const ImageList = JSON.parse(getObjectById(dataRef.current, ID));

  const eventEmit = (treeState, info) => {
    const { node } = info;

    if (treeState.length > nodeData.length) {
      const missingPart = treeState.filter((item) => !nodeData.includes(item));

      // Only Emit the Event when the event is Present

      const expandEvent = JSON.stringify({
        Event: {
          EventName: 'Expanding',
          ID: data?.ID,
          Info: node?.id,
        },
      });

      const exists =
        Event && Event.some((item) => item[0] === 'Expanding' && node?.children?.length > 0);
      if (!exists) return;

      console.log(expandEvent);
      socket.send(expandEvent);
    } else if (treeState.length < nodeData.length) {
      const missingPart = nodeData.filter((item) => !treeState.includes(item));

      const Info = findParentIndex(Depth, 1 + calculateSumFromString(missingPart));

      // Check that if it has Event or not

      const retractEvent = JSON.stringify({
        Event: {
          EventName: 'Retracting',
          ID: data?.ID,
          Info: node?.id,
        },
      });

      const exists = Event && Event.some((item) => item[0] === 'Retracting');
      if (!exists) return;

      console.log(retractEvent);
      socket.send(retractEvent);
    } else {
      console.log('Equal');
    }
    setNodeData(treeState);
  };

  const createNode = (title, index) => {
    if (!index) return <span onKeyDown={(e) => console.log({ e })}>{title}</span>;

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={`http://localhost:${PORT}/${ImageList?.Properties?.Files[index - 1]}`} />
        <div>{title}</div>
      </div>
    );
  };

  for (let i = 0; i < Depth.length; i++) {
    const depthValue = Depth[i];
    const title = createNode(Items[i], ImageIndex && ImageIndex[i]);
    if (depthValue === 0) {
      parentIndex++;
      childIndex++;
      treeData.push({
        id: childIndex,
        title: title,
        children: [],
      });
    } else if (depthValue >= 1) {
      childIndex++;

      const newNode = {
        id: childIndex,
        title: title,
      };
      let parent = treeData[treeData.length - 1];
      for (let j = 1; j < depthValue; j++) {
        parent = parent.children[parent.children.length - 1];
      }
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(newNode);
    }
  }

  const handleItemDownEvent = (index, shiftState) => {
    // Info
    //[0] index of the node
    //[1] Mouse Buttons left 1 right 2 center 4
    //[2] shift state
    //[3] Position: 2 over icon, 4 over label, 8 over line, 16 over symbol, 32 to right of label

    const event = JSON.stringify({
      Event: {
        EventName: 'ItemDown',
        ID: data?.ID,
        Info: [index, 1, shiftState, 4],
      },
    });

    // Stored in local storage to handle the WG of TreeView
    const SelItems = new Array(childIndex).fill(0);

    SelItems[index - 1] = 1;

    //WG SelItems
    const storedFocusedIndex = JSON.stringify({
      Event: {
        SelItems: SelItems,
      },
    });
    localStorage.setItem(data?.ID, storedFocusedIndex);
    const exists = Event && Event.some((item) => item[0] === 'ItemDown');
    if (!exists) return;
    console.log(event);
    socket.send(event);
  };

  const handleSelect = (_, info) => {
    const { selectedNodes, nativeEvent } = info;

    const isAltPressed = nativeEvent.altKey ? 4 : 0;
    const isCtrlPressed = nativeEvent.ctrlKey ? 2 : 0;
    const isShiftPressed = nativeEvent.shiftKey ? 1 : 0;
    const mouseButton = nativeEvent.button;
    let shiftState = isAltPressed + isCtrlPressed + isShiftPressed;
    if (selectedNodes.length == 0) return;
    handleItemDownEvent(selectedNodes[0]?.id, shiftState);
  };

  const handleDoubleClickEvent = (index, shiftState) => {
    const event = JSON.stringify({
      Event: {
        EventName: 'ItemDblClick',
        ID: data?.ID,
        Info: [index, 1, shiftState, 4],
      },
    });

    // Stored in local storage to handle the WG of TreeView
    const SelItems = new Array(childIndex).fill(0);

    SelItems[index - 1] = 1;

    //WG SelItems
    const storedFocusedIndex = JSON.stringify({
      Event: {
        SelItems: SelItems,
      },
    });
    localStorage.setItem(data?.ID, storedFocusedIndex);
    const exists = Event && Event.some((item) => item[0] === 'ItemDblClick');
    if (!exists) return;
    console.log(event);
    socket.send(event);
  };

  const handleDoubleClick = (_, info) => {
    const { nativeEvent } = info;

    const isAltPressed = nativeEvent?.altKey ? 4 : 0;
    const isCtrlPressed = nativeEvent?.ctrlKey ? 2 : 0;
    const isShiftPressed = nativeEvent?.shiftKey ? 1 : 0;
    const mouseButton = nativeEvent?.button;
    let shiftState = isAltPressed + isCtrlPressed + isShiftPressed;
    handleDoubleClickEvent(info.id, shiftState);
  };

  // Set the initial localstorage if no item is selected

  useEffect(() => {
    localStorage.setItem(
      data.ID,
      JSON.stringify({
        Event: {
          SelItems: new Array(Items.length).fill(0),
        },
      })
    );
  }, []);

  return (
    <div
      id={data?.ID}
      style={{
        ...styles,
        border: '1px solid black',
        background: 'white',
        paddingLeft: '2px',
        paddingTop: '3px',
        display: Visible == 0 ? 'none' : 'block',
        overflowY: 'scroll',
      }}
    >
      <Tree
        onDoubleClick={handleDoubleClick}
        onSelect={handleSelect}
        onKeyDown={(e) => console.log('keydown', { e })}
        onExpand={eventEmit}
        expandAction='click'
        treeData={treeData}
        showIcon={false}
        showLine={true}
        style={{ fontSize: '12px', lineHeight: '15px', margin: 0, padding: 0 }}
      />
    </div>
  );
};

export default Treeview;
