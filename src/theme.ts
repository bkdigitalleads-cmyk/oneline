import { useColorScheme } from 'react-native';

export interface Theme {
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  textSecondary: string;
  textFaint: string;
  accent: string;
  accentSoft: string;
  danger: string;
  border: string;
  success: string;
  isDark: boolean;
}

export const lightTheme: Theme = {
  bg: '#FAF7F2',
  card: '#FFFFFF',
  cardAlt: '#F2EDE4',
  text: '#1F1B16',
  textSecondary: '#6B635A',
  textFaint: '#A39B90',
  accent: '#C05621',
  accentSoft: '#F6E3D7',
  danger: '#C53030',
  border: '#E8E1D6',
  success: '#2F7D4F',
  isDark: false,
};

export const darkTheme: Theme = {
  bg: '#171412',
  card: '#211D1A',
  cardAlt: '#2A2521',
  text: '#F3EEE8',
  textSecondary: '#B5ACA1',
  textFaint: '#7A7168',
  accent: '#E07B39',
  accentSoft: '#3A2C22',
  danger: '#F56565',
  border: '#332E29',
  success: '#68B587',
  isDark: true,
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}

export const fonts = {
  serif: 'Georgia',
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
