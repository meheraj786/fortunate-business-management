import { Scrollbars } from 'react-custom-scrollbars-2';

const CustomScrollbar = ({ children, ...props }) => {
  return (
    <Scrollbars
      autoHide
      autoHideTimeout={1000}
      autoHideDuration={200}
      renderThumbVertical={({ style, ...props }) => (
        <div
          {...props}
          style={{ ...style, backgroundColor: '#A0AEC0', borderRadius: '4px' }}
        />
      )}
      {...props}
    >
      {children}
    </Scrollbars>
  );
};

export default CustomScrollbar;