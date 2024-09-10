export const getLastTabButton = (data) => {
  let array = Object.keys(data)
    .map((key) => {
      if (data[key]?.Properties.Type == 'TabButton') {
        return data[key].ID;
      } else {
        return undefined;
      }
    })
    .filter((id) => id !== undefined);

  return array.pop();
};
