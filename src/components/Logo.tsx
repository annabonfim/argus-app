import { Image, type ImageStyle, type StyleProp } from 'react-native';

// require precisa de caminho estático literal — por isso o mapa fixo aqui.
const SOURCES = {
  vertical: require('../../assets/images/logo-vertical.png'),
  symbol: require('../../assets/images/logo-symbol.png'),
  horizontal: require('../../assets/images/logo-horizontal.png'),
};

// Altura / largura nativa de cada arte, pra derivar a altura a partir da
// largura pedida sem distorcer (e sem depender de aspectRatio, que nem todo
// ambiente respeita).
const HEIGHT_OVER_WIDTH = {
  vertical: 2600 / 2142,
  symbol: 2400 / 2239,
  horizontal: 1558 / 3000,
};

interface LogoProps {
  variant?: 'vertical' | 'symbol' | 'horizontal';
  width: number;
  style?: StyleProp<ImageStyle>;
}

export function Logo({ variant = 'vertical', width, style }: LogoProps) {
  const height = Math.round(width * HEIGHT_OVER_WIDTH[variant]);
  return (
    <Image
      source={SOURCES[variant]}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
}
