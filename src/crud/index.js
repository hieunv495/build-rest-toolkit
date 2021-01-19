const Schema = require("validate");
const completeSlug = require("../../utils/completeSlug");
const PaginationParser = require("./parsers/QueryPaginationParser");
const SearchParser = require("./SearchParser");

const slugSchema = new Schema({
  modelField: {
    type: String,
    required: true,
  },
  queryField: {
    type: String,
    required: true,
  },
});

const trashSchema = new Schema({
  deletedField: {
    type: String,
    required: true,
  },
});

const completeSlugConfig = (slug) => {
  if (slug === true) {
    return {
      modelField: "slug",
      queryField: "slug",
    };
  } else if (typeof slug === "string") {
    return {
      modelField: slug,
      queryField: slug,
    };
  } else if (typeof slug === "object") {
    validateSchema(slugSchema, slug);
    return slug;
  } else {
    return null;
  }
};

const completeTrashConfig = (trash) => {
  if (trash === true) {
    return {
      deletedField: "deleted",
    };
  } else if (typeof trash === "object") {
    validateSchema(trashSchema, trash);
    return trash;
  } else {
    return null;
  }
};

class CrudController {
  constructor({ model, getListConfig, slug, trash }) {
    this.model = model;

    this.getListConfig = getListConfig;
    this.trash = completeTrashConfig(trash);
    this.slug = completeSlugConfig(slug);

    this.getListHandler = buildGetListHandler({
      model,
      ...getListConfig,
      filter: (req) => {
        if (typeof getListConfig.filter === "function") {
          return {
            ...getListConfig.filter(req),
            [this.trash.deletedField]: false,
          };
        } else {
          return {
            ...getListConfig.filter,
          };
        }
      },
    });
  }

  _checkSlug = async (req, res) => {
    try {
      const item = await this.model.findOne({
        [this.slug.modelField]: req.query[this.slug.queryField],
      });
      if (item) {
        return res.json({ ok: false });
      }
      return res.json({ ok: true });
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };

  _makeGetList = ({ requiredFilter }) => async (req, res) => {
    try {
      const filter = {};
      const offset = getOffset(req);
      const limit = getLimit(req);

      if (this.pagination) {
        filter.limit = getLimit(req);
        filter.offset = getOffset(req);
      }

      if (this.search) {
      }

      const searchValue = filter[searchField];
      if (searchValue && searchValue.length > 0) {
        filter = {
          ...filter,
          [searchField]: { $regex: searchValue, $options: "i" },
        };
      }

      const getItems = model
        .find({ ...filter, ...requiredFilter })
        .skip(offset)
        .limit(limit)
        .sort([["createdAt", -1]]);

      const getTotal = model.count({ ...filter, ...requiredFilter });

      const [items, total] = await Promise.all([getItems, getTotal]);

      return res.json({ items, total });
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };

  getList = async (req, res) => {
    try {
      let { offset = 0, limit = 10, ...filter } = req.query;
      offset = parseInt(offset);
      limit = parseInt(limit);

      const searchValue = filter[searchField];
      if (searchValue && searchValue.length > 0) {
        filter = {
          ...filter,
          [searchField]: { $regex: searchValue, $options: "i" },
        };
      }

      const getItems = model
        .find({ ...filter, [deleteField]: false })
        .skip(offset)
        .limit(limit)
        .sort([["createdAt", -1]]);

      const getTotal = model.count({ ...filter, [deleteField]: false });

      const [items, total] = await Promise.all([getItems, getTotal]);

      return res.json({ items, total });
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };

  count = async (req, res) => {
    try {
      let filter = req.query;
      const searchValue = filter[searchField];
      if (searchValue && searchValue.length > 0) {
        filter = {
          ...filter,
          [searchField]: { $regex: searchValue, $options: "i" },
        };
      }

      const count = await model.count({ ...filter, [deleteField]: false });
      return res.json(count);
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };

  getById = async (req, res) => {
    let item = await model.findOne({
      _id: req.params.id,
      [deleteField]: false,
    });
    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.json(item);
  };

  getBySlug = async (req, res) => {
    let item = await model.findOne({
      [slugField]: req.params.slug,
      [deleteField]: false,
    });
    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.json(item);
  };

  viewBySlug = async (req, res) => {
    let item = await model.findOneAndUpdate(
      { [slugField]: req.params.slug, [deleteField]: false },
      { $inc: { views: 1 } }
    );
    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.json(item);
  };

  create = async (req, res) => {
    let data = req.body;
    try {
      data[slugField] = await completeSlug(model, data[slugField]);
      let item = await model.create(data);
      res.json(item);
    } catch (e) {
      console.log(e);
      res.status(512).json({ message: e.message });
    }
  };

  update = async (req, res) => {
    const data = req.body;
    try {
      data[slugField] = await completeSlug(
        model,
        data[slugField],
        req.params.id
      );
      const result = await model.findOneAndUpdate({ _id: req.params.id }, data);
      res.json(result);
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };

  remove = async (req, res) => {
    try {
      const result = await model.findOneAndUpdate(
        { _id: req.params.id },
        { [deleteField]: true }
      );
      res.json(result);
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };

  removeAll = async (req, res) => {
    try {
      const result = await model.updateMany({}, { [deleteField]: true });
      return res.json(result);
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };

  getTrashList = async (req, res) => {
    try {
      let { offset = 0, limit = 10, ...filter } = req.query;
      offset = parseInt(offset);
      limit = parseInt(limit);

      const searchValue = filter[searchField];
      if (searchValue && searchValue.length > 0) {
        filter = {
          ...filter,
          [searchField]: { $regex: searchValue, $options: "i" },
        };
      }

      const getItems = model
        .find({ ...filter, [deleteField]: false })
        .skip(offset)
        .limit(limit)
        .sort([["createdAt", -1]]);

      const getTotal = model.count({ ...filter, [deleteField]: true });

      const [items, total] = await Promise.all([getItems, getTotal]);

      return res.json({ items, total });
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };
  trashCount = async (req, res) => {
    try {
      let { q, ...filter } = req.query;

      if (q && q.length > 0) {
        filter = { ...filter, name: { $regex: q, $options: "i" } };
      }

      const count = await Category.count({ ...filter, deleted: true });
      return res.json(count);
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };

  trashEmpty = async (req, res) => {
    try {
      const result = await Category.deleteMany({ deleted: true });
      return res.json(result);
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };

  trashPurge = async (req, res) => {
    try {
      const result = await Category.findOneAndDelete({ _id: req.params.id });
      return res.json(result);
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };

  trashRestore = async (req, res) => {
    try {
      const result = await Category.findOneAndUpdate(
        { _id: req.params.id },
        { deleted: false }
      );
      return res.json(result);
    } catch (e) {
      res.status(512).json({ message: e.message });
    }
  };
}
