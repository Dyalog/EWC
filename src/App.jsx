import { useCallback, useEffect, useRef, useState } from 'react';
import { AppDataContext } from './context';
import { SelectComponent } from './components';
import {
  getObjectById,
  checkSupportedProperties,
  findFormParentID,
  deleteFormAndSiblings,
  rgbColor,
} from './utils';
import './App.css';
import * as _ from 'lodash';
import MsgBox from './components/MessageBox';
import version from "../version.json"

function useForceRerender() {
  const [_state, setState] = useState(true);
  const reRender = () => {
    setState((prev) => !prev);
  };
  return { reRender };
}

const App = () => {
  const [socketData, setSocketData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [proceed, setProceed] = useState(false);
  const [proceedEventArray, setProceedEventArray] = useState([]);
  const [layout, setLayout] = useState('Initialise');
  const webSocketRef = useRef(null);
  const [focusedElement, setFocusedElement] = useState(null);
  const { reRender } = useForceRerender();
  const [messageBoxData, setMessageBoxData] = useState(null);
  const [options, setOptions] = useState(null)
  const [fontScale, setFontScale] = useState(null);
  let colors = {}

  const dataRef = useRef({});
  const appRef = useRef(null);

  useEffect(() => {
    dataRef.current = {};
    setSocketData([]);
    localStorage.clear();
    const currentPort = window.location.port;
    fetchData(currentPort);

    const handleBeforeUnload = () => {
      // Attempt to send a closing message before the tab is closed
      if (webSocketRef.current) {
        webSocketRef.current.send(JSON.stringify({ Signal: { Name: 'Close' } }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Remove the event listener when the component is unmounted
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Close the WebSocket if it's still open
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        webSocketRef.current.close();
      }
    };
  }, [layout]);


  useEffect(() => {
    const container = appRef.current;

    if (container) {
      // container.addEventListener('focusin', handleFocus);
      container.addEventListener('click', handleFocus);
    }
    return () => {
      if (container) {
        // container.removeEventListener('focusin', handleFocus);
        container.removeEventListener('click', handleFocus);
      }
    };
  }, []);

  if (fontScale) {
    localStorage.setItem("fontscale", fontScale);
  }

  // Helper function to get color from the index
  function getColor(index, defaultColor) {
    // console.log("property getcolor",colors, index, colors?.[index])
    return colors?.[index] || defaultColor; // Fallback to default if not found
  }

  function getRequiredRGBChannel(val) {
    // console.log("compare initial value", val);
    if (typeof val === 'number'){
      val = [val]
    }

    const newValue = val?.map((value) => {
      // console.log("property_map1", value);
  
      // Check if the value is an array of arrays or an array of numbers
      if (Array.isArray(value) && value?.every((item) => typeof item === 'number' && item >= 0)) {
        // console.log("property condition 2")
        // Case 3: Array of numbers (e.g., [-1, 0])
        return value;
      }

      if(typeof value === "number" && value < 0){
        return getColor(value)
      }

      if(typeof value === "number" && value >= 0){
        return value;
      }
      
      // console.log("compare property here", value)
      const modifiedValue = value?.map((nestVal) => {
        // console.log("property here")
        if (Array.isArray(nestVal)) {
          // Nested array (e.g., [-5, [255, 0, 0]])
          return nestVal.map((item) => (typeof item === 'number' && item < 0 ? getColor(item) : item));
        } else if (typeof nestVal === 'number' && nestVal < 0) {
          // Single negative number (e.g., -6)
          return getColor(nestVal);
        } else {
          // Otherwise, return the value as is
          // console.log("property else")
          return nestVal;
        }
      });
  
      // console.log("property_modified", modifiedValue);
      return modifiedValue;
    });
    // console.log('compare final', newValue)
    return newValue
  }

  const handleData = (data, mode) => {

    console.log("handleData", data, mode)
    const splitID = data.ID.split('.');

    let currentLevel = dataRef.current;

    for (let i = 0; i < splitID.length - 1; i++) {
      const key = splitID[i];

      if (!currentLevel[key]) {
        currentLevel[key] = {};
      }

      currentLevel = currentLevel[key];
    }

    // Check if the key already exists at the final level
    const finalKey = splitID[splitID.length - 1];
    if (currentLevel.hasOwnProperty(finalKey)) 
      {
      if (mode === 'WC') {
        if (data.Properties && data.Properties.Type === 'Form') {
          localStorage.clear();
        }
        // Overwrite the existing object with new properties
        
        currentLevel[finalKey] = {
          ID: data.ID,
          ...data,
        };
      } else if (mode === 'WS') {
        // Merge the existing object with new properties

        currentLevel[finalKey] = {
          ID: data.ID,
          ...currentLevel[finalKey],
          Properties: {
            ...(currentLevel[finalKey].Properties || {}),
            ...(data.Properties || {}),
          },
        };
      }
    } else {
      let newData = JSON.parse(JSON.stringify(data))
      // Create a new object at the final level
      try{
        if(data.Properties.hasOwnProperty('FillCol') || data.Properties.hasOwnProperty('FCol') || data.Properties.hasOwnProperty('BCol') ) {
          // console.log('compare', {_property_before: data?.Properties, colors})
          newData = {
            ...data,
            Properties:{
              ...data?.Properties,
              ...data?.Properties?.FillCol && ({FillCol: getRequiredRGBChannel(data.Properties.FillCol)}),
              ...data?.Properties?.FCol && ({FCol: getRequiredRGBChannel(data.Properties.FCol)}),
              ...data?.Properties?.BCol && ({BCol: getRequiredRGBChannel(data.Properties.BCol)})
            }
          }
          // console.log('compare', {_property_after: newData?.Properties})
        }
      }catch(error){
        console.log({error})
      }
      
      currentLevel[finalKey] = {
        ID: data.ID,
        ...newData,
      };
      // console.log('compare', {data, newData})
    }

    reRender();
  };

  // const deleteObjectsById = (data, idsToDelete) => {
  //   //  reRender();
  //   function deleteById(obj, id) {
  //     for (const key in obj) {
  //       if (obj[key].ID === id) {
  //         delete obj[key];
  //         return true;
  //       }
  //       if (typeof obj[key] === 'object') {
  //         if (deleteById(obj[key], id)) {
  //           return true;
  //         }
  //       }
  //     }
  //     return false;
  //   }
  //   idsToDelete?.forEach((id) => {
  //     deleteById(data, id);
  //   });

  //   dataRef.current = data;
  //   // socketData.filter((item) => idsToDelete.some((id) => item.ID.startsWith(id)));
  // };

  function deleteObjectsById(obj, ids) {
    ids.forEach((id) => {
      const deleteKey = (data, key) => {
        if (data.hasOwnProperty(key)) {
          delete data[key];
        } else {
          const nestedKeys = key.split('.');
          let nestedObj = data;
          for (let i = 0; i < nestedKeys.length; i++) {
            const nestedKey = nestedKeys[i];
            if (nestedObj.hasOwnProperty(nestedKey)) {
              if (i === nestedKeys.length - 1) {
                delete nestedObj[nestedKey];
              } else {
                nestedObj = nestedObj[nestedKey];
              }
            } else {
              break;
            }
          }
        }
      };

      deleteKey(obj, id);
    });

    console.log({ obj });
    dataRef.current = obj;

    reRender();
  }

  const fetchData = (port) => {
    const runningPort = port == '5173' ? '22322' : port;
    let zoom = Math.round(window.devicePixelRatio * 100);
    console.log("Socket",{socket: window.location})
    webSocketRef.current = new WebSocket(`ws://${window.location.hostname}:${runningPort}/`);




    const webSocket = webSocketRef.current;
    setSocket(webSocket);
    webSocket.onopen = () => {
      let event = JSON.stringify({
        DeviceCapabilities: {
          ViewPort: [window.innerHeight, window.innerWidth],
          ScreenSize: [window.screen.height, window.screen.width],
          DPR: zoom / 100,
          PPI: 200,
        },
      });
      webSocket.send(event);
      // webSocket.send(layout);
      
      const eventInit = JSON.stringify({
        [layout]:{
          Version: version.version,
          Name: version.name,
          URL: window.location.href,
        }
      });
      
      webSocket.send(eventInit);
      // webSocket.send('Initialise')
    };
    webSocket.onmessage = (event) => {
      localStorage.setItem('PORT', runningPort);
      // Window Creation WC
      const keys = Object.keys(JSON.parse(event.data));
      if (keys[0] == 'WC') {
        let windowCreationEvent = JSON.parse(event.data).WC;
        // console.log({windowCreationEvent})
        if (windowCreationEvent?.Properties?.Type == 'Form') {
          localStorage.clear();
          const updatedData = deleteFormAndSiblings(dataRef.current);
          dataRef.current = {};
          dataRef.current = updatedData;
          handleData(JSON.parse(event.data).WC, 'WC');
          return;
        }

        // Handle Message Box separately
      if (windowCreationEvent?.Properties?.Type == 'MsgBox') {
        setMessageBoxData(windowCreationEvent);
        // handleData(JSON.parse(event.data).WC, 'WC');
        return;
      }

        // console.log('event from server WC', JSON.parse(event.data).WC);
        setSocketData((prevData) => [...prevData, JSON.parse(event.data).WC]);
        handleData(JSON.parse(event.data).WC, 'WC');

      } else if (keys[0] == 'WS') {
        const serverEvent = JSON.parse(event.data).WS;

        let value = null;
        // @Todo Check that the Edit is Already Present or not if it is Present just change the value we are getting from the server
        const data = JSON.parse(getObjectById(dataRef.current, serverEvent.ID));

        if (data?.Properties?.Type == 'Edit') {
          if (serverEvent?.Properties.hasOwnProperty('Text')) {
            value = serverEvent?.Properties.Text;
          } else if (serverEvent?.Properties.hasOwnProperty('Value')) {
            value = serverEvent?.Properties.Value;
          }else if (serverEvent?.Properties.hasOwnProperty('SelText')) {
            value = serverEvent?.Properties.SelText;
          }
          // Check that the Already Present Data have Text Key or Value Key
          if (data?.Properties.hasOwnProperty('Text')) {
            setSocketData((prevData) => [...prevData, JSON.parse(event.data).WS]);
            return handleData(
              {
                ID: serverEvent.ID,
                Properties: {
                  Text: serverEvent?.Properties.Text,
                },
              },
              'WS'
            );
          } else if (data?.Properties.hasOwnProperty('Value')) {
            setSocketData((prevData) => [...prevData, JSON.parse(event.data).WS]);
            return handleData(
              {
                ID: serverEvent.ID,
                Properties: {
                  Value: serverEvent?.Properties.Value,
                },
              },
              'WS'
            );
          }
           else if (data?.Properties.hasOwnProperty('SelText')) {
            setSocketData((prevData) => [...prevData, JSON.parse(event.data).WS]);
            return handleData(
              {
                ID: serverEvent.ID,
                Properties: {
                  SelText: serverEvent?.Properties.SelText,
                },
              },
              'WS'
            );
          }
        }

        if (data?.Properties?.Type == 'Combo') {
          if (serverEvent?.Properties.hasOwnProperty('SelItems')) {
            setSocketData((prevData) => [...prevData, JSON.parse(event.data).WS]);
            value = serverEvent?.Properties.SelItems;
            const indextoFind = value.indexOf(1);
            let Text = data?.Properties?.Items[indextoFind];
            return handleData(
              {
                ID: serverEvent.ID,
                Properties: {
                  ...data?.Properties,
                  SelItems: value,
                  Text,
                },
              },
              'WS'
            );
          }
        }

        setSocketData((prevData) => [...prevData, JSON.parse(event.data).WS]);
        // serverEvent.ID == "F1.LEFTRIGHT" && console.log("horizontal ws ", {WSThumbValue: JSON.parse(event.data).WS.Properties.Thumb})
        handleData(JSON.parse(event.data).WS, 'WS');
      } else if (keys[0] == 'WG') {
        const serverEvent = JSON.parse(event.data).WG;
        // console.log({serverEvent})

        const refData = JSON.parse(getObjectById(dataRef.current, serverEvent?.ID));
        // serverEvent.ID == "F1.LEFTRIGHT" &&  console.log("horizontal wg", serverEvent.ID, getObjectById(dataRef.current, serverEvent?.ID))
        const Type = refData?.Properties?.Type;
        // console.log("issue refData", {refData, Type})

        // If didn't have any type on WG then return an ErrorMessage

        const errorEvent = JSON.stringify({
          WG: {
            ID: serverEvent?.ID,
            Error: { Code: 1, Message: 'ID Not found', WGID: serverEvent?.WGID },
          },
        });

        if (!Type) return webSocket.send(errorEvent);
        // Get Data from the Ref

        const { Properties } = refData;

        if (Type == 'Grid') {
          const { Values } = Properties;
          console.log("values", { Values})

          const supportedProperties = ['Values', 'CurCell'];

          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);

          if (!localStorage.getItem(serverEvent.ID)) {
            const serverPropertiesObj = {};
            serverEvent.Properties.map((key) => {
              return (serverPropertiesObj[key] = Properties[key]);
            });

            const event = JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            });
            
            // serverEvent.ID == "F1.LEFTRIGHT" && console.log("horizontal event", event);
            return webSocket.send(event);
          }

          const { Event } = JSON.parse(localStorage.getItem(serverEvent.ID));
          const serverPropertiesObj = {};
          serverEvent.Properties.map((key) => {
            return (serverPropertiesObj[key] = Event[key] || refData?.Properties?.[key]);
          });
          // console.log("issue check properties", {local: serverPropertiesObj, app: Properties})

          // Values[Row - 1][Col - 1] = Value;
          console.log(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );

          // Modify the data store in the ref to get the updated value

          setSocketData((prevData) => [
            ...prevData,
            {
              ID: serverEvent.ID,
              Properties: {
                ...Properties,
                Values,
              },
            },
          ]);

          handleData({
            ID: serverEvent.ID,
            Properties: {
              ...Properties,
              Values,
            },
          });

          webSocket.send(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
        }
        if (Type == 'Form') {
          const supportedProperties = ['Posn', 'Size'];
          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);
          const serverPropertiesObj = {};
          const Form = JSON.parse(localStorage.getItem(serverEvent.ID));

          if (!localStorage.getItem(serverEvent.ID)) {
            const serverPropertiesObj = {};

            serverEvent.Properties.map((key) => {
              return (serverPropertiesObj[key] = Properties[key]);
            });

            const event = JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            });

            console.log(event);
            webSocket.send(event);
            return;
          }

          serverEvent.Properties.map((key) => {
            return (serverPropertiesObj[key] = Form[key]);
          });

          const event = JSON.stringify({
            WG: {
              ID: serverEvent.ID,
              Properties: serverPropertiesObj,
              WGID: serverEvent.WGID,
              ...(result && result.NotSupported && result.NotSupported.length > 0
                ? { NotSupported: result.NotSupported }
                : null),
            },
          });

          console.log(event);
          webSocket.send(event);
          return;
        }

        if (Type == 'Edit') {
          const { Text, Value } = Properties;
          const supportedProperties = ['Text', 'Value', 'SelText'];

          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);

          if (!localStorage.getItem(serverEvent.ID)) {
            const editValue = Text ? Text : Value;

            const isNumber = refData?.Properties?.hasOwnProperty('FieldType');

            const serverPropertiesObj = {};
            serverEvent.Properties.forEach((key) => {
              if (key === "Text") {
                serverPropertiesObj[key] = editValue ? editValue.toString() : "";
              } else if (key === "Value") {
                serverPropertiesObj[key] = isNumber ? parseInt(editValue) : editValue;
              } else if (key === "SelText") {
                serverPropertiesObj[key] = Properties[key] ? Properties[key] : [1, 1];
              } else {
                serverPropertiesObj[key] = editValue;
              }
            });

            console.log(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: serverPropertiesObj,
                  WGID: serverEvent.WGID,
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),
                },
              })
            );
            return webSocket.send(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: serverPropertiesObj,
                  WGID: serverEvent.WGID,
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),
                },
              })
            );
          }

          const { Event } = JSON.parse(localStorage.getItem(serverEvent?.ID));
          const { Info } = Event;
          const serverPropertiesObj = {};
          serverEvent.Properties.map((key) => {
            serverPropertiesObj[key] =
              key === "Value" || key === "SelText"
                ? Info
                : key === "Text"
                ? Array.isArray(Info)
                  ? ""
                  : Info
                : Info.toString();
          });
          
          console.log(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
          webSocket.send(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
        }

        if (Type == 'Combo') {
          const { SelItems, Items } = Properties;
          const supportedProperties = ['Text', 'SelItems', 'Posn', 'Size'];

          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);

          if (!localStorage.getItem(serverEvent.ID)) {
            const serverPropertiesObj = {};
            serverEvent.Properties.map((key) => {
              return (serverPropertiesObj[key] = Properties[key]);
            });
            console.log(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: serverPropertiesObj,
                  WGID: serverEvent.WGID,
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),
                },
              })
            );
            return webSocket.send(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: serverPropertiesObj,
                  WGID: serverEvent.WGID,
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),
                },
              })
            );
          }
          const { Event } = JSON.parse(localStorage.getItem(serverEvent?.ID));
          const { Info, Size, Posn } = Event;

          if (SelItems) {
            SelItems?.fill(0);
            let indexToChange = Info - 1;
            SelItems[indexToChange] = 1;
          }

          const serverPropertiesObj = {};

          serverEvent.Properties.map((key) => {
            return (serverPropertiesObj[key] =
              key == 'SelItems' ? SelItems : key == 'Items' ? Items[indexToChange] : Event[key]);
          });

          console.log(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
          return webSocket.send(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
        }

        if (Type == 'List') {
          const { SelItems } = Properties;

          const supportedProperties = ['SelItems'];

          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);

          if (!localStorage.getItem(serverEvent.ID)) {
            console.log(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: {
                    SelItems,
                  },
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),

                  WGID: serverEvent.WGID,
                },
              })
            );
            return webSocket.send(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: {
                    SelItems,
                  },
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),

                  WGID: serverEvent.WGID,
                },
              })
            );
          }

          const { Event } = JSON.parse(localStorage.getItem(serverEvent?.ID));
          console.log(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: {
                  SelItems: Event['SelItems'],
                },
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),

                WGID: serverEvent.WGID,
              },
            })
          );
          return webSocket.send(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: {
                  SelItems: Event['SelItems'],
                },
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),

                WGID: serverEvent.WGID,
              },
            })
          );
        }

        if (Type == 'Scroll') {
          const { Thumb } = Properties;
          const supportedProperties = ['Thumb'];

          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);

          if (!localStorage.getItem(serverEvent.ID)) {
            console.log(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: {
                    Thumb,
                  },
                  WGID: serverEvent.WGID,
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),
                },
              })
            );
            return webSocket.send(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: {
                    Thumb,
                  },
                  WGID: serverEvent.WGID,
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),
                },
              })
            );
          }

          const { Event } = JSON.parse(localStorage.getItem(serverEvent?.ID));
          const { Info } = Event;

          console.log(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: {
                  Thumb: Info[1],
                },
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
          return webSocket.send(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: {
                  Thumb: Thumb,
                },
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
        }

        if (Type == 'Splitter') {
          const { Posn } = Properties;
          const supportedProperties = ['Posn', 'Size'];

          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);

          if (!localStorage.getItem(serverEvent.ID)) {
            const serverPropertiesObj = {};
            serverEvent.Properties.map((key) => {
              return (serverPropertiesObj[key] = Properties[key]);
            });

            console.log(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: serverPropertiesObj,
                  WGID: serverEvent.WGID,
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),
                },
              })
            );
            return webSocket.send(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: serverPropertiesObj,
                  WGID: serverEvent.WGID,
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),
                },
              })
            );
          }

          const { Event } = JSON.parse(localStorage.getItem(serverEvent.ID));
          const { Info, Size } = Event;

          const serverPropertiesObj = {};
          serverEvent.Properties.map((key) => {
            return (serverPropertiesObj[key] = key == 'Posn' ? Info : Size);
          });

          console.log(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
          return webSocket.send(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
        }

        if (Type == 'SubForm') {
          const supportedProperties = ['Posn', 'Size'];

          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);


          if (!localStorage.getItem(serverEvent.ID)) {
            const serverPropertiesObj = {};

            serverEvent.Properties.map((key) => {
              return (serverPropertiesObj[key] = Properties[key]);
            });

            console.log(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: serverPropertiesObj,
                  WGID: serverEvent.WGID,
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),
                },
              })
            );
            return webSocket.send(
              JSON.stringify({
                WG: {
                  ID: serverEvent.ID,
                  Properties: serverPropertiesObj,
                  WGID: serverEvent.WGID,
                  ...(result && result.NotSupported && result.NotSupported.length > 0
                    ? { NotSupported: result.NotSupported }
                    : null),
                },
              })
            );
          }
          const serverPropertiesObj = {};
          const SubForm = JSON.parse(localStorage.getItem(serverEvent.ID));
          serverEvent.Properties.map((key) => {
            return (serverPropertiesObj[key] = SubForm[key]);
          });

          console.log(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
          return webSocket.send(
            JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            })
          );
        }

        if (Type == 'Button') {
          const { State } = Properties;
          const supportedProperties = ['State', 'Posn', 'Size'];

          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);

          if (!localStorage.getItem(serverEvent.ID)) {
            const serverPropertiesObj = {};
            serverEvent.Properties.map((key) => {
              return (serverPropertiesObj[key] =
                key == 'State' ? (State ? State : 0) : Properties[key]);
            });

            const event = JSON.stringify({
              WG: {
                ID: serverEvent.ID,
                Properties: serverPropertiesObj,
                WGID: serverEvent.WGID,
                ...(result && result.NotSupported && result.NotSupported.length > 0
                  ? { NotSupported: result.NotSupported }
                  : null),
              },
            });

            console.log(event);
            return webSocket.send(event);
          }

          const { Event } = JSON.parse(localStorage.getItem(serverEvent.ID));
          const { Value } = Event;

          const serverPropertiesObj = {};

          serverEvent.Properties.map((key) => {
            return (serverPropertiesObj[key] = key == 'State' ? Value : Event[key]);
          });

          const event = JSON.stringify({
            WG: {
              ID: serverEvent.ID,
              Properties: serverPropertiesObj,
              WGID: serverEvent.WGID,
              ...(result && result.NotSupported && result.NotSupported.length > 0
                ? { NotSupported: result.NotSupported }
                : null),
            },
          });

          console.log(event);

          return webSocket.send(event);
        }

        if (Type == 'TreeView') {
          const supportedProperties = ['SelItems'];
          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);
          const { Event } = JSON.parse(localStorage.getItem(serverEvent.ID));
          const { SelItems } = Event;

          const event = JSON.stringify({
            WG: {
              ID: serverEvent.ID,
              Properties: {
                SelItems,
              },
              WGID: serverEvent.WGID,
              ...(result && result.NotSupported && result.NotSupported.length > 0
                ? { NotSupported: result.NotSupported }
                : null),
            },
          });

          console.log(event);
          return webSocket.send(event);
        }

        if (Type == 'Timer') {
          const supportedProperties = ['FireOnce'];
          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);
          const { Event } = JSON.parse(localStorage.getItem(serverEvent.ID));
          const { FireOnce } = Event;

          const event = JSON.stringify({
            WG: {
              ID: serverEvent.ID,
              Properties: {
                FireOnce,
              },
              WGID: serverEvent.WGID,
              ...(result && result.NotSupported && result.NotSupported.length > 0
                ? { NotSupported: result.NotSupported }
                : null),
            },
          });
          console.log(event);
          return webSocket.send(event);
        }

        if (Type == 'ListView') {
          const supportedProperties = ['SelItems'];
          const result = checkSupportedProperties(supportedProperties, serverEvent?.Properties);
          const { Event } = JSON.parse(localStorage.getItem(serverEvent.ID));

          const { SelItems } = Event;
          const event = JSON.stringify({
            WG: {
              ID: serverEvent.ID,
              Properties: {
                SelItems,
              },
              WGID: serverEvent.WGID,
              ...(result && result.NotSupported && result.NotSupported.length > 0
                ? { NotSupported: result.NotSupported }
                : null),
            },
          });

          console.log(event);
          return webSocket.send(event);
        }
        if (Type === "ApexChart") {
          const supportedProperties = ["SVG"];
          const { SVG } = Properties;
          const data = JSON.parse(
            getObjectById(dataRef.current, serverEvent.ID)
          );

          const event = JSON.stringify({
            WG: {
              ID: serverEvent.ID,
              WGID: serverEvent.WGID,
              Properties: {
                SVG: SVG,
              },
            },
          });

          // console.log(event);
          webSocket.send(event);
          return;
        }
      } else if (keys[0] == 'NQ') {
        const nqEvent = JSON.parse(event.data).NQ;
        const { Event, ID, Info, NoCallback = 0 } = nqEvent;

        const appElement = getObjectById(dataRef.current, ID);

        if (Event && Event == 'Configure') {
          handleData(
            {
              ID: ID,
              Properties: {
                ...appElement?.Properties,
                Posn: [Info[0], Info[1]],
                Size: [Info[2], Info[3]],
              },
            },  
            'WS'
          );

          return;
        } else if ((Event && Event == 'ItemDown') || (Event && Event == 'GotFocus')) {
          if (Event && Event == 'GotFocus') localStorage.setItem('current-focus', ID);

          const existingData = JSON.parse(getObjectById(dataRef.current, ID));

          const exists =
            existingData?.Properties?.Event &&
            existingData?.Properties?.Event.some((item) => item[0] === Event);

          if (!exists) return;

          const event = JSON.stringify({
            Event: {
              EventName: Event,
              ID,
              Info,
            },
          });

          console.log(event);
          if (NoCallback == 0) webSocket.send(event);
          return;
        } else if (Event == 'CellMove') {
          handleData(
            {
              ID: ID,
              Properties: {
                CurCell: [Info[0], Info[1]],
              },
            },
            'WS'
          );
          localStorage.setItem(
            ID,
            JSON.stringify({
              Event: {
                CurCell: [Info[0], Info[1]],
              },
            })
          );
          // reRender();
          return;
        } else if (Event == 'Select'){
          const element = document.getElementById(nqEvent.ID)
          if(element) element.click()
        } else if (Event == 'Scroll'){
          webSocket.send(
            JSON.stringify({
              Event: {
                EventName: 'Scroll',
                ID: ID,
                Info: [Info[0], Info[1]],
              },
            })
          );
        }
        const thumbValue = Info[1]
        handleData({ID: ID, Properties: {Thumb: thumbValue  }}, 'WS')
        const element = document.getElementById(nqEvent.ID);
        element && element.focus();
      } 
      else if (keys[0] == "EC"){
        const serverEvent = JSON.parse(event.data).EC;
        const { EventID, Proceed } = serverEvent
        setProceedEventArray((prev) => ({...prev, [EventID]: Proceed}));
        setProceed(Proceed)
        localStorage.setItem(EventID, Proceed);
      }
      else if (keys[0] == 'EX') {
        const serverEvent = JSON.parse(event.data).EX;

        deleteObjectsById(dataRef.current, serverEvent?.ID);
      } else if (keys[0] == 'WX') {
        const serverEvent = JSON.parse(event.data).WX;
        const { Method, Info, WGID, ID } = serverEvent;
        // const calculateTextDimensions = (wordsArray, fontSize = 11) => {
        const calculateTextDimensions = (wordsArray, fontSize = 12) => {
          // Create a hidden div element to calculate text dimensions
          const scale =localStorage.getItem("fontscale")
          console.log("fontScale dimension: " ,scale)
          const container = document.createElement('div');
          container.style.visibility = 'hidden';
          container.style.position = 'fixed';
          container.style.top = '0';
          container.style.left = '0';
          container.style.fontSize = (fontSize * scale) + 'px'; 

          // Iterate through the array of words
          wordsArray.forEach((word) => {
            // Create a span element for each word
            const span = document.createElement('div');
            span.textContent = word;
            span.style.display = 'block'; // Start each word on a new line
            container.appendChild(span);
          });

          // Append the container to the body
          document.body.appendChild(container);

          // Retrieve dimensions
          const width = container.offsetWidth;
          const height = container.offsetHeight - 11;

          // Remove the container from the body
          document.body.removeChild(container);

          return [height, width];
        };

        if (Method == 'GetTextSize') {
          const joinedString = Info && Info[0];
          const font = JSON.parse(getObjectById(dataRef.current, Info && Info[1]));
          const fontProperties = font && font?.Properties;
          const textDimensions = calculateTextDimensions(joinedString, fontProperties?.Size);
          // console.log({textDimensions: textDimensions})
          const event = JSON.stringify({ WX: { Info: textDimensions, WGID } });
          console.log(event);
          return webSocket.send(event);
        } else if (Method == 'OnlyDQ'){
          let event
          if( !!Info?.[0] ){
            event = JSON.stringify( { WX:{Info: [[ID, 150, 300]] , WGID: WGID}} );
          }
          else{
            event = JSON.stringify( { WX:{Info: [] ,"WGID": WGID}} );
          }
          webSocket.send(event);
        } else if (Method == 'GetFocus') {
          const focusedID = localStorage.getItem('current-focus');
          const event = JSON.stringify({ WX: { Info: !focusedID ? [] : [focusedID], WGID } });
          console.log(event);
          webSocket.send(event);
        }
      } else if (keys[0] == 'Options') {
        handleData(JSON.parse(event.data).Options, 'WC');
        console.log("label", JSON.parse(event.data).Options)

        
        JSON.parse(event.data).Options.ID == 'Fonts' && setFontScale(JSON.parse(event.data).Options.Properties.Scale)
        JSON.parse(event.data).Options.ID == 'Fonts' &&   console.log("label", JSON.parse(event.data).Options.Properties.Scale)
        JSON.parse(event.data).Options.ID == 'Mode' && setOptions(JSON.parse(event.data).Options.Properties)
        if(JSON.parse(event.data).Options.ID == 'Colors') setColorFunc(JSON.parse(event.data).Options.Properties.Standard)
      } else if (keys[0] == 'FormatCell') {
        const formatCellEvent = JSON.parse(event.data);
        const { FormatCell } = formatCellEvent;
        const refData = JSON.parse(getObjectById(dataRef.current, FormatCell?.ID));
        const { Properties } = refData;
        const updatedFormattedValues = Properties?.FormattedValues;
        updatedFormattedValues[FormatCell.Cell[0] - 1][FormatCell.Cell[1] - 1] =
          FormatCell?.FormattedValue;
        handleData(
          {
            ID: FormatCell?.ID,
            Properties: {
              ...refData?.Properties,
              FormattedValues: updatedFormattedValues,
            },
          },
          'WS'
        );
      }
    };
  };

  const handleFocus = (element) => {
    const formParentID = findFormParentID(dataRef.current);
    if (localStorage.getItem('change-event')) {
      const { Event } = JSON.parse(localStorage.getItem('change-event'));
      const updatedEvent = {
        ...Event,
        Info: [!element.target.id ? formParentID : element.target.id],
      };

      let webSocket = webSocketRef.current;

      webSocket.send(JSON.stringify({ Event: { ...updatedEvent } }));
      localStorage.removeItem('change-event');
    }
  };

  // const updatedData = _.cloneDeep(dataRef.current);
  console.log('App', dataRef.current);

  const setColorFunc = (colorStandardArray)=>{
    const reqColors = colorStandardArray?.reduce((prev, current)=>{
      return {...prev, [current?.[0]]: current[2] }
    },{})
    colors = {...reqColors}
  }

  const formParentID = findFormParentID(dataRef.current);
  
  const handleMsgBoxClose = (button, ID) => {
    // console.log(`Button pressed: ${button}`);
    setMessageBoxData(null);
    // Send event back to server via WebSocket
    socket.send(JSON.stringify({Event: { EventName: button, ID: ID }}));
  };


  return (
    <div>
      <AppDataContext.Provider
        value={{
          socketData,
          dataRef,
          socket,
          handleData,
          focusedElement,
          reRender,
          proceed,
          setProceed,
          proceedEventArray,
          setProceedEventArray,
          colors,
          fontScale
        }}
      >
        {dataRef && formParentID && <SelectComponent data={dataRef.current[formParentID]} />}
      </AppDataContext.Provider>
      {messageBoxData && (
        <MsgBox data = { messageBoxData } options = {options} onClose = { handleMsgBoxClose } isDesktop = { dataRef?.current?.Mode?.Properties?.Desktop} />
      )}
    </div>

  );
};

export default App;

// {
//   JSON.stringify(updatedData[formParentID]?.['LEFT']?.Properties);
