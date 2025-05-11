import { getFormFactor, FormFactor } from '@/utils/device';


const SearchScreen =
  getFormFactor() === FormFactor.TABLET
    ? require('./searchtablet').default
    : require('./searchphone').default;

export default SearchScreen;
