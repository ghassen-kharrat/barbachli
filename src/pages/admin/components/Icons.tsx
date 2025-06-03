import React from 'react';
import * as ReactIcons from 'react-icons/fa';
import * as FiIcons from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';

// Use a simpler approach to avoid type issues
export const FaIcons = {
  // Instead of wrapping each icon in a component, use the React components directly
  ...ReactIcons,
  
  // Only add special handling for FaSpinner which needs a wrapper
  FaSpinner: (props: IconBaseProps = {}) => (
    <span className="icon-spinner">
      <ReactIcons.FaSpinner {...props} />
    </span>
  )
};

// Export FiIcons for use in the app
export const FileIcons = {
  ...FiIcons
}; 