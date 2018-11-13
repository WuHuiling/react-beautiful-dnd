// @flow
// whether two arrays contains the same elements, despite of orders
export default (arr1: mixed, arr2: mixed) => {
  const toMap = arr =>
    arr.reduce((acc, item) => {
      acc[item] = acc[item] ? acc[item] + 1 : 1;
      return acc;
    }, {});

  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false;
  }

  if (arr1.length !== arr2.length) {
    return false;
  }

  const arrMap1 = toMap(arr1);
  const arrMap2 = toMap(arr2);
  return Object.keys(arrMap1).every(key => {
    return arrMap2[key] && arrMap2[key] === arrMap1[key];
  });
};
