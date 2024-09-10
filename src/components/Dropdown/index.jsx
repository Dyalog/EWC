import { useState } from 'react';
import './Dropdown.css';
import { useAppData } from '../../hooks';

const Dropdown = ({ title, data }) => {
  const { socket } = useAppData();

  const handleSelectEvent = (id, Properties) => {
    const { Event } = Properties;
    const selectEvent = JSON.stringify({
      Event: {
        EventName: 'Select',
        ID: id,
      },
    });
    const exists = Event && Event.some((item) => item[0] === 'Select');
    if (!exists) return;
    console.log(selectEvent);
    socket.send(selectEvent);
  };

  return (
    <div style={{ fontSize: '12px', marginLeft: '7px', cursor: 'pointer' }} className='menu-item'>
      {title}

      <div className='dropdown'>
        {Object.keys(data).map((key) => {
          return (
            <div
              id={data[key]?.ID}
              className='dropdown-item'
              onClick={() => handleSelectEvent(data[key]?.ID, data[key]?.Properties)}
            >
              {/* {data[key]?.Properties?.Caption?.includes('&')
                ? data[key]?.Properties?.Caption?.substring(1)
                : data[key]?.Properties?.Caption} */}
              {data[key]?.Properties?.Caption?.replace('&', '')}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dropdown;
