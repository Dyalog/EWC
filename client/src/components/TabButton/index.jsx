import { useAppData } from '../../hooks';
import { rgbColor } from '../../utils';

const TabButton = ({ data, handleTabClick, activeTab, bgColor, fontColor, activebgColor }) => {
  const { socket } = useAppData();
  const { Caption, Event } = data?.Properties;

  const emitEvent = Event && Event[0];
  
  return (
    <div
      id={data.ID}
      style={{
        border: '1px solid #DFDFDF',
        fontSize: '12px',
        // fontSize: '11px',
        paddingTop: '2px',
        paddingBottom: '2px',
        paddingLeft: '4px',
        paddingRight: '4px',
        cursor: 'pointer',
        borderRadius: '2px',
        background:
          activeTab == data?.ID
            ? rgbColor(!activebgColor ? [255, 255, 255] : activebgColor)
            : rgbColor(bgColor),
        height: '20px',
        borderBottom: activeTab == data?.ID ? '0px' : '1px solid  #DFDFDF',
        color: !fontColor ? 'black' : rgbColor(fontColor),
        fontWeight: 600,
      }}
      onClick={() => {
        console.log(
          JSON.stringify({
            Event: {
              EventName: emitEvent && emitEvent[0],
              ID: data?.ID,
              Info: [data?.ID],
            },
          })
        );

        localStorage.setItem(
          'lastEvent',
          JSON.stringify({
            Event: {
              EventName: emitEvent && emitEvent[0],
              ID: data?.ID,
              Info: [data?.ID],
            },
          })
        );

        socket.send(
          JSON.stringify({
            Event: {
              EventName: emitEvent && emitEvent[0],
              ID: data?.ID,
              Info: [data?.ID],
            },
          })
        );

        handleTabClick(data.ID);
      }}
    >
      {Caption}
      {/* <button
      
      >
        {Caption}
      </button> */}
    </div>
  );
};
export default TabButton;
