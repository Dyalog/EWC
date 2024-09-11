export const getImageStyles = (decideImageStyle, PORT, ImageData, ImageSize) => {
  let imageStyles = null;


  if (decideImageStyle == 0) {
    imageStyles = {
      backgroundImage: `url(${window.location.protocol}//${window.location.hostname}:${PORT}${ImageData?.Properties?.File})`,
      position: 'absolute',
      top: ImageSize && ImageSize.Posn && ImageSize.Posn.length ? ImageSize.Posn[0]: 0,
      left: ImageSize && ImageSize.Posn && ImageSize.Posn.length ? ImageSize.Posn[1]: 0,
      backgroundRepeat: 'no-repeat',
      height:ImageSize && ImageSize.Size && ImageSize.Size.length ? ImageSize.Size[0]: '100%',
      width:ImageSize && ImageSize.Size && ImageSize.Size.length ? ImageSize.Size[1]: '100%',
    };
  }

  if (decideImageStyle == 1) {
    imageStyles = {
      backgroundImage: `url(${window.location.protocol}//${window.location.hostname}:${PORT}${ImageData?.Properties?.File})`,
      backgroundRepeat: 'repeat',
    };
  }

  if (decideImageStyle == 2) {
    imageStyles = {
      backgroundImage: `url(${window.location.protocol}//${window.location.hostname}:${PORT}${ImageData?.Properties?.File})`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };
  }

  if (decideImageStyle == 3) {
    imageStyles = {
      backgroundImage: `url(${window.location.protocol}//${window.location.hostname}:${PORT}${ImageData?.Properties?.File})`,
      backgroundPosition:
        'center center' /* Center the background image horizontally and vertically */,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }

  if (ImageData?.Properties?.Type == 'Icon') {
    imageStyles = {
      ...imageStyles,
      height: '32px',
      width: '32px',
      backgroundSize: 'cover',
    };
  }

  return imageStyles;
};

// Image is Tile
// if (Picture && Picture[1] == 1) {
//   updatedStyles = {
//     ...styles,
//     backgroundImage: `url(${window.location.protocol}//${window.location.hostname}:${PORT}${ImageData?.Properties?.File})`,
//     backgroundRepeat: 'repeat',
//   };
// }

// // Align the Image in the top left Corner

// if (Picture && Picture[1] == 0) {
//   updatedStyles = {
//     ...styles,
//     backgroundImage: `url(${window.location.protocol}//${window.location.hostname}:${PORT}${ImageData?.Properties?.File})`,
//     position: 'absolute',
//     top: 0,
//     left: 0,
//   };
// }

// // Make the image center in the subform

// if (Picture && Picture[1] == 3) {
//   updatedStyles = {
//     ...styles,
//     backgroundImage: `url(${window.location.protocol}//${window.location.hostname}:${PORT}${ImageData?.Properties?.File})`,
//     backgroundPosition:
//       'center center' /* Center the background image horizontally and vertically */,
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundRepeat: 'no-repeat',
//   };
// }

// // Image is Scalar means Image fit exactly horizontally and vertically

// if (Picture && Picture[1] == 2) {
//   updatedStyles = {
//     ...styles,
//     backgroundImage: `url(${window.location.protocol}//${window.location.hostname}:${PORT}${ImageData?.Properties?.File})`,
//     backgroundSize: '100% 100%',
//     backgroundRepeat: 'no-repeat',
//     backgroundPosition: 'center center',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//   };
// }

export const renderImage = (PORT, ImageData) => {
  return `${window.location.protocol}//${window.location.hostname}:${PORT}${ImageData?.Properties?.File}`;
};
