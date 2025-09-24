export type View = 'canvas' | 'templates';

export type Item = {
  id: string;
  widgetId: string;
  name?: string;
  width: number;
  height: number;
  color?: string;
  font?: string;
  theme?: 'light' | 'dark' | 'custom';
  customBackgroundColor?: string;
  customTextColor?: string;
  [key: string]: any;
};

export type Page = {
  id: string;
  name: string;
  icon: string;
  items: Item[];
};

