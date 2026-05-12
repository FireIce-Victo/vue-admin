export const isExternalLink = path => {
  return /^(https?:|mailto:|tel:)/.test(path);
};