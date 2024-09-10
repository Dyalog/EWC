export const parseFlexStyles = (inputString, type) => {
  let newInputString;
  if (type === "Form" && Array.isArray(inputString)) {
    newInputString = inputString && inputString[1];
  } else {
    newInputString = inputString;
  }
  const stylesArray =newInputString && newInputString?.split(",").map((style) => style.trim());
  const stylesObject = {};

  stylesArray?.forEach((style) => {
    const [property, value] = style?.split(":").map((item) => item.trim());
    const camelCaseProperty = property?.replace(/-([a-z])/g, (match, letter) =>
      letter?.toUpperCase()
    );
    stylesObject[camelCaseProperty] = isNaN(value) ? value : parseFloat(value);
  });

  return stylesObject;
};
