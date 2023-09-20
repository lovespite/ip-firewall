This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## IP Fire-wall Log Parser

This is a app that can parse your server's log file and show you the ip address that failed to login your server.

## Getting Started

First, set environment variables in `.env.local`:


your mongodb uri


```MONGODB_URI=```

where log file is stored


```LOG_PATH=/var/log/secure```


geo ip data file, you can download from https://cz88.net/help?id=free


```QQWRY_DATA_PATH=.../qqwry.dat```


```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

