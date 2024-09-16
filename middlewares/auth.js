//const story = require('../models/story');
const Story = require('../models/bookmodel');

exports.isGuest = (req, res, next)=>{
    if(!req.session.user){
        return next();
    } else {
        req.flash('error','You are logged in already');
        return res.redirect('/users/profile');
    }
};
exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user){
        return next();
    } else {
        req.flash('error','You need to log in first');
        return res.redirect('/users/login');
    }
};
exports.isAuthor = (req, res, next)=>{
    let id = req.params.id;
    Story.findById(id)
    .then(story => {
        if(story){
            if(story.author == req.session.user){
                return next();
            } else {
                req.flash('error','Unauthorized access for this resource');
                return res.redirect('/');
                //let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                //return next(err);
            }
        }
    })
    .catch(err=>next(err));
};


/////

exports.isNotAuthor = (req, res, next) => {
    let id = req.params.id;
    Story.findById(id)
      .then((story) => {
        if (story) {
          if (story.author == req.session.user) {
            let err = new Error("Invalid request you cannot trade your own item");
            err.status = 401;
            req.flash("error", err.message);
            return res.redirect("/users/profile");
          } else {
            return next();
          }
        }
      })
      .catch((err) => next(err));
  };

  exports.canCancel=(req,res,next)=>{
    let tradeItemId=req.params.tradeItemId;
    let itemId=req.params.itemId;
    Promise.all([
        Story.findById(tradeItemId),
        Story.findById(itemId)
      ]).then((results) => {
        const [tradeItem, item] = results;
        if(tradeItem.author==req.session.user || item.author==req.session.user){
           return next();
        }else{
            let err = new Error("Invalid request you cannot trade your own item");
            err.status = 401;
            req.flash("error", err.message);
            return res.redirect("/users/profile");
        }
      })
      .catch(err=>next(err));
  }

  exports.canAccept=(req,res,next)=>{
    let itemId=req.params.itemId;
    Story.findById(itemId)
      .then((story) => {
        if(story.author==req.session.user){
           return next();
        }else{
            let err = new Error("Invalid request you cannot accept others item");
            err.status = 401;
            req.flash("error", err.message);
            return res.redirect("/users/profile");
        }
      })
      .catch(err=>next(err));
  }