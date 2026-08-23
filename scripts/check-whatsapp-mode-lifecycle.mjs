import fs from "node:fs/promises";

const source = await fs.readFile(
  "src/lib/product/ProductContext.jsx",
  "utf8"
);

const modeWriteMatches = [
  ...source.matchAll(/ridePickerService\.setMode\s*\(/g),
];

if (modeWriteMatches.length !== 1) {
  throw new Error(
    `Expected exactly one RidePicker mode write in ProductContext, found ${modeWriteMatches.length}. Transport/session effects must not persist mode changes.`
  );
}

const setModeController = source.indexOf("const setMode = useCallback");
const modeWrite = modeWriteMatches[0].index;

if (setModeController < 0 || modeWrite < setModeController) {
  throw new Error(
    "RidePicker mode persistence must stay inside the explicit setMode controller."
  );
}

const autoOffPattern =
  /waStatus\s*===\s*["']disconnected["'][\s\S]{0,800}ridePickerService\.setMode\s*\([^)]*["']off["']/;

if (autoOffPattern.test(source)) {
  throw new Error(
    "WhatsApp transport state must never automatically persist RidePicker mode=off."
  );
}

console.log("WhatsApp/RidePicker mode lifecycle guard passed");
