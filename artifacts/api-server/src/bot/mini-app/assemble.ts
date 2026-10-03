const STYLE_PLACEHOLDER = "__Z28_STYLE__";
const APP_PLACEHOLDER = "__Z28_APP__";

const requirePlaceholder = (html: string, placeholder: string) => {
  if (!html.includes(placeholder)) {
    throw new Error(`Mini App template is missing required placeholder: ${placeholder}`);
  }
};

export const assembleMiniApp = (
  indexHtml: string,
  styleCss: string,
  appJs: string,
): string => {
  requirePlaceholder(indexHtml, STYLE_PLACEHOLDER);
  requirePlaceholder(indexHtml, APP_PLACEHOLDER);

  return indexHtml
    .replace(STYLE_PLACEHOLDER, () => styleCss)
    .replace(APP_PLACEHOLDER, () => appJs);
};
