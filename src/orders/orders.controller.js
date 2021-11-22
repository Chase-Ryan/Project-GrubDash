const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));

const nextId = require("../utils/nextId");

function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (!foundOrder) {
      return next({
        status: 404,
        message: `Order does not exist: ${orderId}`,
      });
    }
    res.locals.order = foundOrder
    return next();
  }

function deliverToCheck(req, res, next) {
    const { data: {deliverTo} } = req.body;
    if (!deliverTo) {
        return next({
            status: 400,
            message: "Order must include a deliverTo",
        })
    }
    next();
}

function mobileNumberCheck(req, res, next) {
    const { data: {mobileNumber} } = req.body;
    if (!mobileNumber) {
        return next({
            status: 400,
            message: "Order must include a mobileNumber",
        })
    }
    next();
}

function dishesCheck(req, res, next) {
    const { data: {dishes} } = req.body;
    if (!dishes) {
        return next({
            status: 400,
            message: "Order must include a dish",
        })
    } else if (dishes.length === 0 || !Array.isArray(dishes)) {
        return next({
            status: 400,
            message: "Order must include at least one dish",
        })
    }
    next();
}

function dishesQuantityCheck(req, res, next) {
    const { data: {dishes} } = req.body;
    let message = "";
    dishes.forEach((dish, index) => {
        if (dish.quantity <= 0 || typeof dish.quantity !== "number") {
            message = `Dish ${index} must have a quantity that is an integer greater than 0`
        }
    })
    if (message) {
        return next({
            status: 400,
            message: `${message}`,
        })
    }
    next();
}

function orderIdCheck(req, res, next) {
    const {
      data: { id },
    } = req.body;
  
    if (id && id !== res.locals.order.id) {
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${res.locals.order.id}`,
      });
    }
    next();
  }

function statusCheck(req, res, next) {
    const { data: { status} } = req.body;
    if (!status || (status !== "pending" && status !== "preparing" && status !== "out-for-delivery" && status !== "delivered")) {
        return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        })
    }
    if (status === "delivered") {
        return next({
            status: 400,
            message: "A delivered order cannot be changed"
        })
    }
    next();
}

function pendingStatusCheck(req, res, next) {
    if (res.locals.order.status !== "pending") {
        return next({
            status:400,
            message: "An order cannot be deleted unless it is pending"
        })
    }
    next();
}


function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } } = req.body; 
    const newOrder = {
    id: nextId(),
    deliverTo, 
    mobileNumber, 
    status, 
    dishes,
};
orders.push(newOrder);
res.status(201).json({ data: newOrder });
}

function read(req, res) {
res.status(200).json({ data: res.locals.order })
}

function update(req, res) {
    const { data: { id, deliverTo, mobileNumber, status, dishes } } = req.body; 
    if (!id) {
        res.locals.order.id = res.locals.order.id;
    } else {
        res.locals.order.id = id;
    }
    res.locals.order.deliverTo = deliverTo;
    res.locals.order.mobileNumber = mobileNumber;
    res.locals.order.status = status;
    res.locals.order.dishes = dishes;
    res.status(200).json({ data: res.locals.order });
}

function destroy(req, res) {
const index = orders.findIndex((order) => order.id === res.locals.order.id);
if (index > -1 ){
    orders.splice(index, 1);
}
res.sendStatus(204);
}

function list(req, res) {
res.status(200).json({ data: orders })
}

module.exports = {
    create: [deliverToCheck, mobileNumberCheck, dishesCheck, dishesQuantityCheck, create],
    read: [orderExists, read],
    update: [orderExists, deliverToCheck, mobileNumberCheck, dishesCheck, dishesQuantityCheck, orderIdCheck, statusCheck, update],
    delete: [orderExists, pendingStatusCheck, destroy],
    list,
}