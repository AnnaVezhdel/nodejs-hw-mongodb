import { typeList } from '../constants/contacts.js';

const parseBoolean = (value) => {
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else return undefined;
};
const parseContactType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;
  const isValidType = typeList.includes(type) ? type : {};
  return isValidType;
};
export const parseFilterParams = ({ contactType, isFavourite }) => {
  const parsedIsFavourite = parseBoolean(isFavourite);
  const parsedContactType = parseContactType(contactType);

  return {
    contactType: parsedContactType,
    isFavourite: parsedIsFavourite,
  };
};
