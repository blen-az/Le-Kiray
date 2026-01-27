import { VehicleCategory } from '../../types';

export const isEarthMoving = (category: VehicleCategory): boolean => {
  return category === VehicleCategory.EARTH_MOVING;
};

export const isInstantBookable = (category: VehicleCategory): boolean => {
  return !isEarthMoving(category);
};
