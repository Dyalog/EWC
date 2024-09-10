import * as AppIcons from "./RibbonIcons";
import { Row, Col } from "reactstrap";
import { useAppData } from "../../hooks";
import { getObjectById } from "../../utils";
import { MdOutlineQuestionMark } from "react-icons/md";

const CustomRibbonButtonGroup = ({ data }) => {
  const { socket, dataRef } = useAppData();
  const PORT = localStorage.getItem("PORT");
  let ImageList = JSON.parse(localStorage.getItem("ImageList"));

  const { Captions, Icons, Event, ImageIndex, ImageListObj } = data?.Properties;

  const colSize = Captions?.length == 4 ? 6 : 12;

  const handleSelectEvent = (info) => {
    const selectEvent = JSON.stringify({
      Event: {
        EventName: "Select",
        ID: data?.ID,
        Info: [info],
      },
    });
    const exists = Event && Event.some((item) => item[0] === "Select");
    if (!exists) return;
    console.log(selectEvent);
    socket.send(selectEvent);
  };

  const handleButtonEvent = (info) => {
    handleSelectEvent(info);
  };

  let ImagesData;

  if (ImageListObj) {
    if (Array.isArray(ImageListObj)) {
      ImagesData = ImageListObj?.map((id) => {
        return id && JSON.parse(getObjectById(dataRef.current, id));
      });

      // console.log({ ImagesData });
    } else {
      const ID = ImageListObj.split(".")[1];
      ImageList = ID && JSON.parse(getObjectById(dataRef.current, ID));
    }
    if (ImagesData) {
      localStorage.setItem("ImagesData", JSON.stringify(ImagesData));
    }
    // const ID = getStringafterPeriod(ImageListObj);
    // ImageList = ID && JSON.parse(getObjectById(dataRef.current, ID));
  }

  // console.log({ Icons });

  // console.log({ AppIcons });

  console.log({ Captions, ImagesData });

  console.log({ ImagesData });

  function getImageDataByCaption(caption) {
    if (!ImagesData || !ImagesData.length) return;

    // Find the index of the caption in the Captions array
    const captionIndex = data?.Properties?.Captions?.indexOf(caption);

    if (captionIndex === -1) {
      return null; // Caption not found
    }

    // Get the corresponding ImageListObj and ImageIndex
    const imageListId = data?.Properties?.ImageListObj[captionIndex];
    const imageIndex = data?.Properties?.ImageIndex[captionIndex];

    // Find the corresponding ImageList in ImagesData
    const imageList = ImagesData?.find((image) => image?.ID === imageListId);

    if (!imageList) {
      return null; // ImageListObj not found
    }

    // Get the image URL and size
    const img = imageList?.Properties?.Files[imageIndex - 1]; // ImageIndex is 1-based, array is 0-based
    const imgSize = imageList?.Properties?.Size;

    return {
      caption,
      imgIndex: imageIndex,
      imgUrl: img,
      imgSize,
    };
  }

  return (
    <div className="" style={{width:"fit-content"}}>
      {Captions.map((title, i) => {
        // i = 0
        console.log("imgData", title);
        // if(ImagesData)
        // {

        const result = getImageDataByCaption(title);
        console.log("imgData", { result });
        // }
        const imageIndex = i;
        const image =
          result && result.imgUrl
            ? result.imgUrl
            : ImagesData?.[imageIndex] || ImageList;
        const iconKey = Icons?.[i] || "MdOutlineQuestionMark";
        const IconComponent = AppIcons?.[iconKey] || MdOutlineQuestionMark;

        return (
          <Col
            key={`col-${i}`}
            id={`${data?.ID}-${i}`}
            md={colSize}
            className="d-flex align-items-center justify-content-left gap-1"
            style={{ cursor: "pointer" }}
            onClick={() => handleButtonEvent(i + 1)}
          >
            {result && result?.imgUrl ? (
              <img
                style={{
                  width: result.imgSize[0],
                  height: result.imgSize[1],
                }}
                src={`http://localhost:${PORT}/${result.imgUrl}`}
                alt={title}
                />
              ) : image ? (
                <img
                style={{
                  width: ImageList?.Properties?.Size?.[1],
                  height: ImageList?.Properties?.Size?.[0],
                }}
                src={`http://localhost:${PORT}/${image?.Properties?.Files?.[imageIndex]}`}
                alt={title}
              />
            ) : (
              <IconComponent size={35} />
            )}
            <div
              style={{
                fontSize: "12px",
                textAlign: "center",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>
          </Col>
        );
      })}
    </div>
  );
};

export default CustomRibbonButtonGroup;
