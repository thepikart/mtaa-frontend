import { getFormFactor, FormFactor } from '@/utils/device';

/**
 * SearchScreen
 *
 * Entry point for the search UI. Selects between
 * the phone or tablet implementation based on device form factor.
 *
 * @module SearchScreen
 * @type {React.ComponentType<any>}
 */
const SearchScreen: React.ComponentType<any> =
  getFormFactor() === FormFactor.TABLET
    ? require('./searchtablet').default
    : require('./searchphone').default;

export default SearchScreen;