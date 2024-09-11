export const pairsToObject = (pairs) => {
    const obj = {};
    pairs.forEach((p) => {obj[p[0]] = p[1]});
    return obj;
};
