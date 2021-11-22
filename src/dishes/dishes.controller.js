const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));

const nextId = require("../utils/nextId");

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (!foundDish) {
    return next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  }
  res.locals.dish = foundDish
  return next();
}

function nameCheck(req, res, next) {
  const { data: {name} } = req.body;
  if (!name) {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }
  next();
}

function descriptionCheck(req, res, next) {
    const { data: {description} } = req.body;
  if (!description) {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }
  next();
}

function priceCheck(req, res, next) {
  const { data: {price} } = req.body;
  if (!price) {
    return next({
      status: 400,
      message: "Dish must include a price",
    });
  } else if (price <= 0 || typeof price != "number") {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  next();
}

function imageCheck(req, res, next) {
  const { data: {image_url} } = req.body;
  if (!image_url) {
    return next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }
  next();
}

function dishIdCheck(req, res, next) {
    const { data: { id } } = req.body;
   if (id !== res.locals.dish.id && id) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${res.locals.dish.id}`,
    });
  }
  next();
}

function create(req, res) {
  const { data: { name, description, price, image_url } } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.status(200).json({ data: res.locals.dish });
}

function update(req, res) {
  const { data: { id, name, description, price, image_url } } = req.body;
  if (!id) {
    res.locals.dish.id = res.locals.dish.id;
  } else {
    res.locals.dish.id = id;
  }
  res.locals.dish.name = name;
  res.locals.dish.description = description;
  res.locals.dish.price = price;
  res.locals.dish.image_url = image_url;
  res.status(200).json({ data: res.locals.dish });
}

function list(req, res) {
  res.status(200).json({ data: dishes });
}

module.exports = {
  create: [nameCheck, descriptionCheck, priceCheck, imageCheck, create],
  read: [dishExists, read],
  update: [dishExists, nameCheck, descriptionCheck, priceCheck, imageCheck, dishIdCheck, update],
  list,
};
