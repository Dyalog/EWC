import { getObjectById, rgbColor } from "../../utils";
import { useAppData } from "../../hooks";
import { useEffect, useState } from "react";

function useForceRerender() {
  const [_state, setState] = useState(true);
  const reRender = () => {
    setState((prev) => !prev);
  };
  return { reRender };
}

const getNestingLevel = (array) => {
  if (!Array.isArray(array)) {
    return 0; // Not an array, so no nesting
  }
  return 1 + Math.max(0, ...array.map(getNestingLevel));
};

// Function to flatten an array by one level
const flattenArrayOneLevel = (array) => {
  return array.reduce((acc, val) => acc.concat(val), []);
};


// Function to flatten the array only if it's three levels deep
const flattenIfThreeLevels = (arr) => {
  if (getNestingLevel(arr) === 3) {
    return flattenArrayOneLevel(arr);
  } else {
    return arr; // Return the original array if it's not three levels deep
  }
};

const Text = ({ data, fontProperties }) => {
  const { Visible, Points, Text, FCol, BCol } = data?.Properties;
  const {  fontScale} = useAppData();

  const { reRender } = useForceRerender();

  const parentSize = JSON.parse(localStorage.getItem("formDimension"));

  const newPoints = flattenIfThreeLevels(Points);

  const pointsArray =
    newPoints && newPoints[0].map((y, i) => [newPoints[1][i], y]);


  // const calculateTextDimensions = (wordsArray, fontSize = 11) => {
  const calculateTextDimensions = (wordsArray, fontSize = 12) => {
    // Create a hidden div element to calculate text dimensions
    const container = document.createElement("div");
    container.style.visibility = "hidden";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.fontSize = fontSize + "px"; // Set font size

    // Iterate through the array of words
    wordsArray.forEach((word) => {
      // Create a span element for each word
      const span = document.createElement("div");
      span.textContent = word;
      span.style.display = "block"; // Start each word on a new line
      container.appendChild(span);
    });

    // Append the container to the body
    document.body.appendChild(container);

    // Retrieve dimensions
    const width = container.offsetWidth;
    const height = container.offsetHeight - 11;

    // Remove the container from the body
    document.body.removeChild(container);

    return { height, width };
  };

  // Text can be the array []  so Map the Text not the Points

  return (
    <>
      <div
        style={{
          position: "absolute",
          display: Visible == 0 ? "none" : "block",
          top: 0,
          left: 0,
        }}
      >
        <svg
          height={parentSize && parentSize[0]}
          width={parentSize && parentSize[1]}
        >
          {Text?.map((text, index) => {
            const dimensions = calculateTextDimensions(
              Text,
              fontProperties?.Size ? `${fontProperties.Size * fontScale}px` : `${12 * fontScale}px`
            );
            const textWidth = dimensions?.width + 30; // replace with actual calculation
            const textHeight = dimensions?.height + 30; // replace with actual calculation

            const points = pointsArray[index] || [
              pointsArray?.[index - 1]?.[0],
              pointsArray?.[index - 1]?.[1] + 10,
            ];

            return (
              <g key={index}>
                <rect
                  x={points && points[0]}
                  y={points && points[1]}
                  width={textWidth}
                  height={textHeight}
                  transform={`translate(${points && points[0]}, ${
                    points && points[1]
                  }) rotate(${
                    fontProperties?.Rotate * (180 / Math.PI)
                  }) translate(${points && -points[0]}, ${
                    points && -points[1]
                  })`}
                  fill={BCol ? rgbColor(BCol) : "transparent"} // Set your desired background color here
                />
                <text
                  id={`${data?.ID}-t${index + 1}`}
                  // fill='red'
                  alignment-baseline="middle"
                  dy="0.6em"
                  x={points && points[0]}
                  y={points && points[1]}
                  font-family={fontProperties?.PName}
                  font-size={
                    fontProperties?.Size ? `${fontProperties.Size * fontScale}px` : `${12 * fontScale}px`
                  }
                  fill={FCol ? rgbColor(FCol[index]) : "black"}
                  font-style={
                    !fontProperties?.Italic
                      ? "none"
                      : fontProperties?.Italic == 1
                      ? "italic"
                      : "none"
                  }
                  font-weight={
                    !fontProperties?.Weight ? 0 : fontProperties?.Weight
                  }
                  text-decoration={
                    !fontProperties?.Underline
                      ? "none"
                      : fontProperties?.Underline == 1
                      ? "underline"
                      : "none"
                  }
                  transform={`translate(${points && points[0]}, ${
                    points && points[1]
                  }) rotate(${
                    fontProperties?.Rotate * (180 / Math.PI)
                  }) translate(${points && -points[0]}, ${
                    points && -points[1]
                  })`}
                >
                  {text.replace(/ /g, "\u00A0")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
};
export default Text;
