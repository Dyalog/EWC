import { useEffect, useRef, useCallback, useState } from "react";

import {
  excludeKeys,
  setStyle,
  getImageStyles,
  rgbColor,
  parseFlexStyles,
} from "../../utils";
import SelectComponent from "../SelectComponent";
import { useAppData } from "../../hooks";

const SubForm = ({ data }) => {
  const PORT = localStorage.getItem("PORT");
  const { findDesiredData } = useAppData();
  const {
    Size,
    Posn,
    Picture,
    Visible,
    BCol,
    FlexDirection,
    JustifyContent,
    Display,
    Flex = 0,
    CSS,
  } = data?.Properties;

  const observedDiv = useRef(null);
  const styles = setStyle(data?.Properties, "absolute", Flex);


  
  const flexStyles = parseFlexStyles(CSS);
  
  const updatedData = excludeKeys(data);
  
  const ImageData = findDesiredData(Picture && Picture[0]);
  
  const imageStyles = getImageStyles(Picture && Picture[1], PORT, ImageData, data?.Properties);
  
  let updatedStyles = { ...styles, ...imageStyles, ...flexStyles };
  
  console.log("App Subform",{ styles, data, updatedStyles, flexStyles,Size, Posn} )
  useEffect(() => {
    let existingData;
    if (data.ID === "F1.SCALE") {
      setTimeout(() => {
        existingData = JSON.parse(localStorage.getItem(data.ID));
        if (existingData && existingData.Event?.ID === data.ID) {
          existingData.Event = {
            ...existingData.Event,
            Size: data.Properties?.Size || existingData.Event?.Size,
            Posn: data.Properties?.Posn || existingData.Event?.Posn,
          };
        }
      }, 500);
    } else if (data.ID === "F1.BX") {
      localStorage.setItem(
        data.ID,
        JSON.stringify({
          Size: Size || [600, 400], // Default size if none provided
          Posn: Posn || [50, 50], // Default position if none provided
        })
      );
    } else {
      localStorage.setItem(
        data.ID,
        JSON.stringify({
          Size: Size && Size,
          Posn: Posn && Posn,
        })
      );
    }
  }, [data]);
  
return (
    <div
      id={data.ID}
      style={{
        display:
        Visible == 0
        ? "none"
        : data?.Properties.hasOwnProperty("Flex")
        ? "flex"
        : "block",
        background: BCol && rgbColor(BCol),
        ...updatedStyles,
        // height: Size && Size[0],
        // width: Size && Size[1],
        // top: Posn && Posn[0],
        // left: Posn && Posn[1],
        // position: 'absolute',
      }}
      ref={observedDiv}
    >
      {Object.keys(updatedData).map((key) => {
        return <SelectComponent data={updatedData[key]} />;
      })}
    </div>
  );
};

export default SubForm;
