import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style = {},
}) => {
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    let variantStyles: StyleProp<ViewStyle>;
    let textStyles: StyleProp<TextStyle>;

    switch (variant) {
      case 'primary':
        variantStyles = disabled ? styles.bgGray400 : styles.bgPrimary500;
        textStyles = styles.textWhite;
        break;
      case 'secondary':
        variantStyles = disabled
          ? [styles.bgGray300, styles.borderGray300]
          : [styles.bgWhite, styles.borderGray300, styles.border];
        textStyles = styles.textGray700;
        break;
      case 'danger':
        variantStyles = disabled ? styles.bgGray400 : styles.bgDanger500;
        textStyles = styles.textWhite;
        break;
      default:
        variantStyles = styles.bgPrimary500;
        textStyles = styles.textWhite;
        break;
    }
    return [styles.baseButton, variantStyles, style];
  };

  const getTextStyles = (): StyleProp<TextStyle> => {
    switch (variant) {
      case 'secondary':
        return [styles.baseText, styles.textGray700];
      default:
        return [styles.baseText, styles.textWhite];
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={getButtonStyles()}
    >
      <Text style={getTextStyles()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseText: {
    fontWeight: '600',
  },
  // Background Colors
  bgPrimary500: { backgroundColor: '#3b82f6' },
  bgDanger500: { backgroundColor: '#ef4444' },
  bgGray400: { backgroundColor: '#9ca3af' },
  bgGray300: { backgroundColor: '#d1d5db' },
  bgWhite: { backgroundColor: '#ffffff' },
  // Borders
  border: { borderWidth: 1 },
  borderGray300: { borderColor: '#d1d5db' },
  // Text Colors
  textWhite: { color: '#ffffff' },
  textGray700: { color: '#374151' },
});

export default Button;
