import { createContext, useContext } from 'react';

export const defaultDisplaySettings = {
  dateFormat: 'raw',
  showDatesOnNode: true,
  showBirthLocationOnNode: false,
  showDeathLocationOnNode: false,
  panelMode: 'docked',
  fixedCardSize: false,
};

export const DisplaySettingsContext = createContext(defaultDisplaySettings);
export const useDisplaySettings = () => useContext(DisplaySettingsContext);
