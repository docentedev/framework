export const getTextFromHtml = (str: string) => {
  let strippedString = str.replace(/(<([^>]+)>)/gi, "");
  strippedString = strippedString.replace(/&nbsp;/gi, " ");
  return strippedString;
};

export const getFirstNChar = (str: string, len: number, elipsis = "") => {
  return str.substring(0, len) + elipsis;
};
export const seoUrl = (str: string) => {
  // remove all tilde
  const value = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return value == undefined
    ? ""
    : value
        .replace(/[^a-z0-9_]+/gi, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
};
