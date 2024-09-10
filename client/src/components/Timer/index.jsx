import { useEffect, useState } from 'react';
import { useAppData } from '../../hooks';

const Timer = ({ data }) => {
  const { socket } = useAppData();

  const { Interval, FireOnce, Active, Event } = data?.Properties;

  let eventFire = !FireOnce ? 0 : FireOnce;

  const hasActive = data?.Properties.hasOwnProperty('Active');
  let activeTimer = hasActive ? Active : 1;

  useEffect(() => {
    let intervalId;
    let timeoutId;
    const timerEvent = JSON.stringify({
      Event: { EventName: 'Timer', ID: data?.ID, Info: [] },
    });
    // check Active is 1
    if (activeTimer == 1) {
      if (eventFire == 1) {
        if (intervalId) clearInterval(intervalId);
        timeoutId = setTimeout(() => {
          socket.send(timerEvent);
        }, Interval && Interval);
        localStorage.setItem(
          data.ID,
          JSON.stringify({ Event: { EventName: 'Timer', ID: data?.ID, FireOnce: 2 } })
        );
      } else if (eventFire == 2) {
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      } else if (eventFire == 0) {
        localStorage.setItem(
          data.ID,
          JSON.stringify({ Event: { EventName: 'Timer', ID: data?.ID, FireOnce: 0 } })
        );
        intervalId = setInterval(() => {
          socket.send(timerEvent);
        }, Interval && Interval);
      }
      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [data]);

  return <></>;
};

export default Timer;
