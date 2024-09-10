export * from "./imageStyles";
export * from "./deleteForm";
export * from "./flexStyles";
export * from "./getType";
export * from "./getLastTabButton";

export const setStyle = (Properties, position = "absolute", Flex = 0) => {
  if (Flex == 2) {
    return {
      display: "flex",
      flex: 1,
      height: "100vh",
    };
  }
  if (Flex == 1) {
    return {
      display: "flex",
    };
  }

  if (Flex == "fill") {
    return {
      display: "flex",
      height: "100vh",
      flexDirection: "column",
      flex: 1,
    };
  }

  if (Flex === "column") {
    return {
      display: "flex",
      flexDirection: "column",
      margin: "5px",
    };
  }
  if (Flex === "row") {
    return {
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "5px",
      alignItems: "end",
    };
  }

  return {
    ...(Properties?.hasOwnProperty("Posn")
      ? { position: "absolute" }
      : { position: "relative" }),
    // position: Properties?.Posn ? 'absolute' : 'relative',
    height: Properties?.Size && Properties?.Size[0],
    width: Properties?.Size && Properties?.Size[1],
    top: Properties?.Posn && Properties?.Posn[0],
    left: Properties?.Posn && Properties?.Posn[1],
  };
};

export const excludeKeys = (obj) => {
  const keysToExclude = ["ID", "Properties"];
  const result = {};
  for (const key in obj) {
    if (!keysToExclude.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
};

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export const checkPeriod = (ID) => {
  let count = 0;
  for (let i = 0; i < ID.length; i++) {
    if (ID[i] == ".") {
      count++;
    }
  }

  return count;
};

export const extractStringUntilSecondPeriod = (inputString) => {
  const lastPeriodIndex = inputString.lastIndexOf(".");

  if (lastPeriodIndex !== -1) {
    const result = inputString.slice(0, lastPeriodIndex);
    return result;
  }

  return inputString;
};

export const generateHeader = (length) => {
  const result = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let current = "";

  while (length > 0) {
    result.push(current);

    // Increment the current string
    let carry = 1;
    for (let i = current.length - 1; i >= 0 && carry; i--) {
      const char = current[i];
      const index = alphabet.indexOf(char);
      if (index === alphabet.length - 1) {
        current =
          current.substring(0, i) + alphabet[0] + current.substring(i + 1);
      } else {
        current =
          current.substring(0, i) +
          alphabet[index + 1] +
          current.substring(i + 1);
        carry = 0;
      }
    }

    if (carry) {
      current = "A" + current;
    }

    length--;
  }

  return result;
};

export const getObjectById = (jsonData, targetId) => {
  const data = jsonData;

  function searchObject(node, idToFind) {
    if (typeof node === "object") {
      if (node.ID === idToFind) {
        return node;
      }
      for (const key in node) {
        const result = searchObject(node[key], idToFind);
        if (result) {
          return result;
        }
      }
    } else if (Array.isArray(node)) {
      for (const item of node) {
        const result = searchObject(item, idToFind);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  const result = searchObject(data, targetId);
  return result ? JSON.stringify(result, null, 2) : null;
};

export const generateAsteriskString = (length) => {
  if (length <= 0) {
    return "*"; // Return an empty string if length is zero or negative.
  }

  let asteriskString = "";
  for (let i = 0; i < length; i++) {
    asteriskString += "*";
  }

  return asteriskString;
};

export const getStringafterPeriod = (ID) => {
  const parts = ID?.split(".");
  if (parts?.length > 1) {
    return parts[1];
  } else {
    return ID;
  }
};

//  Find Parent Index from the tree View

export const calculateSumFromString = (inputString) => {
  const numbers = inputString[0].split("-").map(Number);
  if (numbers.length === 2) {
    const sum = numbers[0] + numbers[1];
    return sum;
  } else {
    return null; // Invalid input
  }
};

export const findParentIndex = (depthArray, parentNumber) => {
  let parentCount = 0;
  let parentIndex = -1;

  for (let i = 0; i < depthArray.length; i++) {
    if (depthArray[i] === 0) {
      parentCount++;
      if (parentCount === parentNumber) {
        parentIndex = i;
        break;
      }
    }
  }

  return parentIndex;
};

export const rgbColor = (rgbArray) => {
  try {
    // Check if the input is a valid RGB array
    if (
      !Array.isArray(rgbArray) ||
      (rgbArray.length !== 3 &&
        !(Array.isArray(rgbArray[0]) && rgbArray[0].length === 3))
    ) {
      // console.log("Invalid RGB array");
      return null;
    }

    // Handle nested RGB array case
    if (Array.isArray(rgbArray[0]) && rgbArray[0].length === 3) {
      rgbArray = rgbArray[0];
    }

    // console.log("Processed RGB array", { rgbArray });
    const [r, g, b] = rgbArray;

    // Ensure all values are within the valid RGB range (0-255)
    if ([r, g, b].some((color) => color < 0 || color > 255)) {
      // console.log("RGB values out of range");
      return null;
    }

    return `rgb(${r}, ${g}, ${b})`;
  } catch (error) {
    console.log("rgb error", error);
    return null;
  }
};

export const calculateDateAfterDays = (days) => {
  // Start date: 1900-1-1
  var startDate = new Date(1900, 0, 1);

  // Calculate the target date
  var targetDate = new Date(startDate?.getTime() + days * 24 * 60 * 60 * 1000);

  // Format the date as YYYY-MM-DD
  var formattedDate = targetDate?.toISOString().split("T")[0];

  return formattedDate;
};

export const calculateDaysFromDate = (inputDate) => {
  // Parse the input date string in the "YYYY-MM-DD" format
  const [year, month, day] = inputDate.split("-");
  const inputDateObj = new Date(year, month - 1, day); // month is 0-based in JavaScript Dates

  // Start date: 1900-1-1 at midnight
  const startDate = new Date(1900, 0, 1, 0, 0, 0, 0);

  // Calculate the difference in milliseconds
  const timeDifference = inputDateObj.getTime() - startDate.getTime();

  // Calculate the number of days
  const daysDifference = timeDifference / (24 * 60 * 60 * 1000);

  return Math.round(daysDifference);
};

export const replaceDanishToNumber = (number) => {
  const cleanedNumberString = number.replace(/\./g, "").replace(",", ".");
  const originalNumber = parseFloat(cleanedNumberString);
  return originalNumber;
};

// Check for the supported Properties of WG or not

export const checkSupportedProperties = (supportedProperties, array) => {
  const notSupportedProperties = array.filter(
    (item) => !supportedProperties.includes(item)
  );
  if (notSupportedProperties.length > 0) {
    const result = {
      NotSupported: notSupportedProperties,
    };
    return result;
  } else {
    return null; // No unsupported properties found
  }
};

export const deleteObjectsById = (data, idsToDelete) => {
  // Recursive function to delete objects by ID
  function deleteById(obj, id) {
    for (const key in obj) {
      if (obj[key].ID === id) {
        delete obj[key];
        return true;
      }
      if (typeof obj[key] === "object") {
        if (deleteById(obj[key], id)) {
          return true;
        }
      }
    }
    return false;
  }

  // Loop through the array of IDs to delete
  idsToDelete.forEach((id) => {
    deleteById(data, id);
  });

  return data;
};

export const getElementPosition = (
  Properties,
  position = "absolute",
  background
) => {
  return {
    position: Properties?.Posn ? "absolute" : "relative",
    top: Properties?.Posn && Properties?.Posn[0],
    left: Properties?.Posn && Properties?.Posn[1],
  };
};

export const findFormParentID = (data) => {
  // Replace the condition inside the find function with your specific criteria⌈
  const formParentID = Object.keys(data).find((key) => {
    const item = data[key];
    return item && item.Properties && item.Properties.Type === "Form";
  });

  return formParentID;
};

export const createListViewObjects = (
  images,
  codes,
  descriptions,
  imagesIndexes
) => {
  const result = codes.map((code, index) => ({
    index: index + 1,
    title: code,
    description: descriptions && descriptions[index][0],
    image: (images && images[imagesIndexes[index] - 1]) || "", // Set image to an empty string if it's undefined
  }));

  return result;
};
