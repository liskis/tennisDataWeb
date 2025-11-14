// public/ui/utils.js

export function getCssVariable(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}