# build-rest

Build restful faster

## Install

```
npm install --save build-rest
```

or

```
yarn add build-rest
```

## Build getList

```js
const mongoose = require("mongoose");
const express = require("express");
const { buildGetListHandler } = require("build-rest");
const Post = mongoose.model("Post");

const getPostList = buildGetListHandler({
  model: Post,
  search: "name",
  filter: { deleted: false },
  sort: [["createdAt", -1]],
  pagination: true,
  populate: "categories",
});

const router = express.Router();

router.get("/posts", getPostList);
```

Result

```
GET /posts?offset=0&limit=10&name=any
```
