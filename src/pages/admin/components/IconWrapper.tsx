import React from 'react';
import * as ReactIcons from 'react-icons/fa';
import * as FiIcons from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';

// Create a global helper function to render icons safely
export const renderIcon = (iconName: string, props: IconBaseProps = {}) => {
  try {
    // Check if icon exists in ReactIcons
    const IconComponent = 
      ReactIcons[iconName as keyof typeof ReactIcons] || 
      FiIcons[iconName as keyof typeof FiIcons];
    
    if (!IconComponent) {
      console.warn(`Icon ${iconName} not found`);
      return <span>Icon</span>;
    }
    
    // Use JSX syntax instead of createElement to avoid TypeScript errors
    return <span>{React.createElement(IconComponent as any, props)}</span>;
  } catch (error) {
    console.error(`Error rendering icon ${iconName}:`, error);
    return <span>Icon</span>;
  }
};

// Create a wrapper component to safely render any icon from react-icons
export const IconWrapper: React.FC<{
  icon: string;
  props?: IconBaseProps;
}> = ({ icon, props = {} }) => {
  return (
    <span className="icon-wrapper">
      {renderIcon(icon, props)}
    </span>
  );
};

// Create a patch for the FaIcons object
export const createIconComponent = (iconName: string) => {
  return (props: IconBaseProps = {}) => renderIcon(iconName, props);
};

// Create a patched version of FaIcons that returns React components
export const patchIcons = () => {
  const iconNames = Object.keys(ReactIcons);
  const patchedIcons: Record<string, React.FC<IconBaseProps>> = {};
  
  // Create patched versions of all FA icons
  iconNames.forEach(iconName => {
    patchedIcons[iconName] = createIconComponent(iconName);
  });
  
  return patchedIcons;
};

export const PatchedIcons = patchIcons();

export default IconWrapper; 