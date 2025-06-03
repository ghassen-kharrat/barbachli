import React from 'react';
import * as ReactIcons from 'react-icons/fa';
import * as FiIcons from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';

// Create a wrapper component to safely render any icon from react-icons
// This solves the TypeScript issues with the icons
export const IconWrapper: React.FC<{
  icon: keyof typeof ReactIcons | keyof typeof FiIcons;
  iconSet?: 'fa' | 'fi';
  props?: IconBaseProps;
}> = ({ icon, iconSet = 'fa', props = {} }) => {
  const IconComponent = iconSet === 'fa' 
    ? ReactIcons[icon as keyof typeof ReactIcons] 
    : FiIcons[icon as keyof typeof FiIcons];
  
  return (
    <span className="icon-wrapper">
      {React.createElement(IconComponent, props)}
    </span>
  );
};

export default IconWrapper; 