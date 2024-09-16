const { check } = require("express-validator");
const { validationResult } = require("express-validator");



exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    }
};




////


exports.validateLogIn = [
    check("email", "Email must be a valid email")
      .isEmail()
      .trim()
      .escape()
      .normalizeEmail(),
    check(
      "password",
      "Password must be atleast 8 characters and atmost 64 characters"
    ).isLength({ min: 8, max: 64 }),
  ];

  exports.validateTrade = [
    check("name", "Name cannot be empty").notEmpty().trim().escape(),
    check("category")
      .notEmpty()
      .withMessage("Car Category cannot be empty ")
      .trim()
      .escape(),
    check("detail")
      .isLength({ min: 10, max: 200 })
      .withMessage(
        "Car Details must be atleast 10 characters and atmost 200 characters"
      )
      .trim()
      .escape(),
    check("location","String cannot be empty").isString().trim().escape(),
    check("phone","Mobile Number should be 10 digits").isLength({min:10,max:10}).isNumeric(),
  ];
  
  
exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => {
        req.flash("error", error.msg);
      });
      return res.redirect("back");
    } else {
      return next();
    }
  };