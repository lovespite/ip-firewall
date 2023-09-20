import React from 'react';
import { App as AntdApp } from 'antd';
import type { AppProps } from 'next/app';

const App = ({ Component, pageProps }: AppProps) => (
    <AntdApp>
      <Component {...pageProps} />
    </AntdApp>
);

export default App;