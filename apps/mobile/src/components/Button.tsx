import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return disabled
          ? 'bg-gray-400'
          : 'bg-primary-500 active:bg-primary-600';
      case 'secondary':
        return disabled
          ? 'bg-gray-300 border-gray-300'
          : 'bg-white border-gray-300 border active:bg-gray-50';
      case 'danger':
        return disabled ? 'bg-gray-400' : 'bg-danger-500 active:bg-danger-600';
      default:
        return 'bg-primary-500 active:bg-primary-600';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'text-gray-700';
      default:
        return 'text-white';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={`p-4 rounded-lg justify-center items-center ${getVariantStyles()} ${className}`}
    >
      <Text style={`font-semibold ${getTextStyles()}`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
