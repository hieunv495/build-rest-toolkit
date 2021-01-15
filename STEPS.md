# How to make this project

## Step 1. Init project

```
mkdir buildres
cd buildres
yarn init
```

## Step 2. Typescript

Add tsconfig.json

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist",
    "module": "es6",
    "noImplicitAny": true,
    "outDir": "./dist",
    "target": "es5"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Step 3. Add rollup

### References

- https://hackernoon.com/building-and-publishing-a-module-with-typescript-and-rollup-js-faa778c85396

### Content

Install Rollup typescript

```
yarn --dev add typescript rollup rollup-plugin-typescript2
```

Add to package.json

```json
{
  "main": "dist/index.js",
  "module": "dist/index.es.js",
  "files": ["dist"],
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -cw"
  }
}
```

Add rollup.config.js

```js
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";
export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "es",
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: require("typescript"),
    }),
  ],
};
```

## Step 4. Add test config

### References

- https://viblo.asia/p/unit-test-cho-nodejs-restful-api-voi-mocha-va-chai-bWrZnLAv5xw
- https://dev.to/matteobruni/mocha-chai-with-typescript-37f

### Content

Install packages

```
yarn add -D chai chai-http mocha @types/chai @types/mocha ts-node
```

Add to package.json

```json
{
  "scripts": {
    "test": "env TS_NODE_COMPILER_OPTIONS='{\"module\": \"commonjs\" }' mocha --timeout 10000 -r ts-node/register 'test/**/*.test.ts'"
  }
}
```

## Step 5. Build test server

### References

- https://viblo.asia/p/unit-test-cho-nodejs-restful-api-voi-mocha-va-chai-bWrZnLAv5xw
