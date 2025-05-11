import { Dimensions, Platform } from 'react-native';

export enum FormFactor {
  PHONE   = 'phone',
  TABLET  = 'tablet',
}

const TABLET_BREAKPOINT = 600;

export function getFormFactor(): FormFactor {
  const { width } = Dimensions.get('window');

  return width >= TABLET_BREAKPOINT ? FormFactor.TABLET : FormFactor.PHONE;
}
