export const getObjectTypeById = (jsonData, targetId) => {
  const data = jsonData;

  function searchObject(node, idToFind) {
    if (typeof node === 'object') {
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

  let result = searchObject(data, targetId);

  if (!result) return null;

  result = JSON.stringify(result, null, 2);

  result = JSON.parse(result);

  if (result?.Properties?.Type == 'Combo') return 'select';

  if (result?.Properties?.Type == 'Edit' || result?.Properties?.Type == 'Button') return 'input';
  return 'span';
};
