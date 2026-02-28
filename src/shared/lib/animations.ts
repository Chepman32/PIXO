import { Easing } from 'react-native';

export const easing = {
  standard: Easing.bezier(0.2, 0.0, 0.0, 1.0),
  decelerate: Easing.bezier(0.0, 0.0, 0.0, 1.0),
  accelerate: Easing.bezier(0.3, 0.0, 1.0, 1.0),
};

export const spring = {
  gentle: {
    damping: 20,
    mass: 1,
    stiffness: 100,
  },
  bouncy: {
    damping: 10,
    mass: 0.8,
    stiffness: 180,
  },
  stiff: {
    damping: 15,
    mass: 0.5,
    stiffness: 250,
  },
};
