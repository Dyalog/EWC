// export const deleteFormAndSiblings = (data) => {
//   function deleteFormRecursively(obj, targetId) {
//     if (obj && typeof obj === 'object') {
//       if (obj.ID === targetId) {
//         const parentId = obj.Properties.Type;
//         delete data[parentId][targetId];

//         if (Object.keys(data[parentId]).length === 0) {
//           delete data[parentId];
//         }

//         console.log(`Form with ID '${targetId}' and its siblings deleted successfully.`);
//       } else {
//         for (const key in obj) {
//           if (obj.hasOwnProperty(key)) {
//             deleteFormRecursively(obj[key], targetId);
//           }
//         }
//       }
//     }
//   }

//   for (const key in data) {
//     if (data.hasOwnProperty(key)) {
//       const formIdToDelete = key;
//       deleteFormRecursively(data[key], formIdToDelete);
//     }
//   }

//   return data;
// };

export const deleteFormAndSiblings = (data) => {
  let updatedData = {};
  const keys = Object.keys(data);

  keys?.forEach((key) => {
    if (data[key]?.Properties?.Type !== 'Form' || !data[key]?.Properties?.Type) {
      updatedData[data[key].ID] = data[key];
    }
  });
  return updatedData;
};
