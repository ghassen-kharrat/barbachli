import React from 'react';
import * as ReactIcons from 'react-icons/fa';
import * as FiIcons from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';
import { PatchedIcons } from './IconWrapper';

// Use the patched icons instead of the direct imports
export const FaIcons = {
  ...PatchedIcons
};

// Export FiIcons for use in the app
export const FileIcons = {
  ...FiIcons
}; 