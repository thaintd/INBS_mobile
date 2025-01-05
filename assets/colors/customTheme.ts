import { DefaultTheme } from "@react-navigation/native"; // Nếu bạn sử dụng React Navigation
import colors from "./colors"; // Import các màu từ file colors.ts

// Định nghĩa kiểu theme
type CustomTheme = {
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    buttonText: string;
  };
};

const customTheme: CustomTheme = {
  ...DefaultTheme, // Kế thừa theme mặc định từ React Navigation
  colors: {
    ...DefaultTheme.colors, // Kế thừa các màu mặc định từ DefaultTheme
    background: colors.third, // Sử dụng màu nền tùy chỉnh
    text: colors.fifth, // Màu chữ tùy chỉnh
    primary: colors.fifth, // Màu chính cho các button và thành phần quan trọng
    secondary: colors.second, // Màu phụ cho các thành phần khác
    buttonText: colors.first // Màu chữ trong các button
  }
};

export default customTheme;
