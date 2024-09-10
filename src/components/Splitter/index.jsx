import { useEffect, useState } from 'react';

import VerticalSplitter from './VerticalSplitter';
import HorizontalSplitter from './HorizontalSplitter';
import { useAppData } from '../../hooks';

const Splitter = ({ data }) => {
  const { Style, Posn, SplitObj1, SplitObj2, Event } = data?.Properties;

  const { handleData } = useAppData();
  let formWidth = 800;
  let formHeight = 800;
  const emitEvent = Event && Event[0];

  const initializeSplitterDimensions = () => {
    if (Style && Style == 'Horz') {
      const localStorageKeys = Object.keys(localStorage);

      localStorageKeys.forEach((key) => {
        const IDs = key.split('.');

        if (IDs.length == 2 && IDs.includes('RIGHT')) {
          const rightPaneDimensions = JSON.parse(localStorage.getItem(key));

          const { Size } = rightPaneDimensions;

          localStorage.setItem(
            data?.ID,
            JSON.stringify({
              Event: {
                EventName: emitEvent && emitEvent[0],
                ID: data.ID,
                Info: Posn,
                Size: [3, Size[1]],
              },
            })
          );
          localStorage.setItem(
            SplitObj1,
            JSON.stringify({ Size: [Posn[0], Size[1]], Posn: [0, 0] })
          );

          handleData(
            {
              ID: SplitObj1,
              Properties: {
                Posn: [0, 0],
                Size: [Posn[0], Size[1]],
                BCol: [255, 255, 255],
              },
            },
            'WS'
          );
          localStorage.setItem(
            SplitObj2,
            JSON.stringify({
              Size: [formHeight - (Posn[0] + 3), Size[1]],
              Posn: [Posn[0] + 3, 0],
            })
          );
          handleData(
            {
              ID: SplitObj2,
              Properties: {
                Posn: [Posn[0] + 3, 0],
                Size: [formHeight - (Posn[0] + 3), Size[1]],
                BCol: [255, 255, 255],
              },
            },
            'WS'
          );
        }
      });
    } else {
      localStorage.setItem(
        data?.ID,
        JSON.stringify({
          Event: {
            EventName: emitEvent && emitEvent[0],
            ID: data.ID,
            Info: Posn,
            Size: [formHeight, 3],
          },
        })
      );

      localStorage.setItem(
        SplitObj1,
        JSON.stringify({ Size: [formHeight, Posn[1]], Posn: [0, Posn[1]] })
      );
      localStorage.setItem(
        SplitObj2,
        JSON.stringify({
          Size: [formHeight, formWidth - (Posn[1] + 3)],
          Posn: [0, Posn[1] + 3],
        })
      );

      handleData(
        {
          ID: SplitObj1,
          Properties: {
            BCol: [255, 255, 255],
          },
        },
        'WS'
      );

      handleData(
        {
          ID: SplitObj2,
          Properties: {
            BCol: [255, 255, 255],
          },
        },
        'WS'
      );
    }
  };

  useEffect(() => {
    initializeSplitterDimensions();
  }, []);

  if (Style && Style == 'Horz') {
    return <HorizontalSplitter data={data} />;
  }

  return <VerticalSplitter data={data} />;
};

export default Splitter;
