// utilities/index.js
const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += `<li>
      <a href="/inv/type/${row.classification_id}" 
         title="See our inventory of ${row.classification_name} vehicles">
        ${row.classification_name}
      </a>
    </li>`;
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = "";

  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += `<li>
        <a href="/inv/detail/${vehicle.inventory_id}" 
           title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" 
               alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="/inv/detail/${vehicle.inventory_id}" 
               title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>`;
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  return grid;
};

/* **************************************
 * Build the single vehicle detail HTML
 * ************************************ */
Util.buildVehicleDetail = function (vehicle) {
  if (!vehicle) {
    return "<p class='notice'>Vehicle data not available.</p>";
  }

  const dollarUS = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price);

  const miles = new Intl.NumberFormat("en-US").format(vehicle.inv_miles);

  return `
    <section class="vehicle-detail">
      <img src="${vehicle.inv_image}" 
           alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" 
           class="vehicle-img" />
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${dollarUS}</p>
        <p><strong>Mileage:</strong> ${miles} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      </div>
    </section>
  `;
};


/* ************************
 * Error Handler Wrapper for Async Functions
 ************************** */
Util.handleErrors = function (fn) {
  return function (req, res, next) {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};



async function buildClassificationList(classification_id = null) {
  const data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`;
    if (
      classification_id !== null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected";
    }
    classificationList += `>${row.classification_name}</option>`;
  });

  classificationList += "</select>";
  return classificationList;
}


// Catch validation errors and pass them to the view
function handleErrors(controllerFunction) {
  return async function(req, res, next) {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const nav = await module.exports.getNav();
      return res.render(res.locals.view, {
        title: res.locals.title,
        nav,
        errors: errors.array(),
        ...req.body
      });
    }
    controllerFunction(req, res, next);
  };
}



module.exports = {
  getNav: Util.getNav,
  buildClassificationGrid: Util.buildClassificationGrid,
  buildVehicleDetail: Util.buildVehicleDetail,
  buildClassificationList,
  handleErrors
};
