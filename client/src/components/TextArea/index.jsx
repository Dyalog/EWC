import { setStyle } from '../../utils';
import './textArea.css';
import '../../styles/font.css';

const TextArea = ({ data }) => {
  let styles = setStyle(data?.Properties);

  const { Text, Font } = data?.Properties;

  let updatesStyles = {
    ...styles,
    scrollbarWidth: 'thin',
    scrollbarColor: 'transparent transparent',
    fontFamily: Font && Font[0],
    fontSize: Font && `${Font[1]}`,
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      <textarea className='textArea' style={updatesStyles} defaultValue={Text} />
    </div>
  );
};

export default TextArea;
