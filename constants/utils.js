import axios from 'axios';
import { Platform, StatusBar } from 'react-native';
import { theme } from 'galio-framework';
import 'intl';
import 'intl/locale-data/jsonp/en'; // or any other locale you need

import {BACKEND_PATH} from "@env"

export const numberFormat = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
}).format(value);
export const apiClient = axios.create({
    baseURL: BACKEND_PATH ,
    withCredentials: true,
  });
export const StatusHeight = StatusBar.currentHeight;
export const HeaderHeight = (theme.SIZES.BASE * 3.5 + (StatusHeight || 0));
export const iPhoneX = () => Platform.OS === 'ios' && (height === 812 || width === 812);