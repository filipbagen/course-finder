export const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  1;
  result.splice(endIndex, 0, removed);

  return result;
};

export const remove = (list: any[], index: number) => {
  const result = [...list];
  result.splice(index, 1);
  return result;
};

export const appendAt = (list: any[], index: number, course: any) => {
  const result = [...list];
  result.splice(index, 0, course);
  return result;
};
