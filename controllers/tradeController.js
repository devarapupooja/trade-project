const BookSchema=require('../models/bookmodel');
const ObjectId = require('mongoose').Types.ObjectId;

exports.index=(req,res)=>{
    res.render('./story/index');
}

exports.books=(req,res)=>{
    BookSchema.distinct("category", function(error, results){
        categories = results;
    });
    BookSchema.find().sort({"title":1})
    .then(books => {
        BookSchema.distinct("category").then(bookcategories=>{
            res.render('./story/Books', {books, bookcategories})
        })
     
    })
    .catch(err=>next(err));

}

exports.newbook=(req,res)=>{ 
    res.render('./story/newbook');
}

exports.create=(req,res)=>{
    let books = new BookSchema(req.body);//create a new connection document
    console.log("books",books)
    books.author = req.session.user;
    books.status = "Available";
    books.save()//insert the document to the database
    .then(res.redirect('/books'))
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            err.status = 400;
        }
        next(err);
    });

}

exports.display=(req,res,next)=>{
    let id = req.params.id;
        BookSchema.findById(id)
        .then(book=>{
            if(book){
                let canWatch = true;
                if (book.watchList.includes(req.session.user)) {
                  canWatch = false;
                }
                res.render('./story/Book', { book,canWatch });
            }else{
                let err = new Error('Cannot find a book with id ' + id);
                err.status = 404;
                next(err);
            }
          
        })
        .catch(err=>next(err)); 

}

exports.edit=(req,res,next)=>{
    let id = req.params.id;
    if(ObjectId.isValid(id)){
        if(!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid book id');
            err.status = 404;
            return next(err);
        }
        BookSchema.findById(id)
        .then(book=>{
            if(book){
                res.render('./story/edit', { book });
            }else{
                let err = new Error('Cannot find a book with id ' + id);
                err.status = 404;
                next(err);
            }})
        .catch(err=>next(err))
    }else{
        let err = new Error('The route parameter is not a valid Objectid :' + id);
        err.status = 400;
        next(err); 
    }
}

exports.update=(req,res,next)=>{
    let book = req.body;
    let id = req.params.id;
    if(ObjectId.isValid(id)){
        if(!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid book id');
            err.status = 404;
            return next(err);
        }
    
        BookSchema.findByIdAndUpdate(id, book, {useFindAndModify: false, runValidators: true})
        .then(book=>{
            if(book) {
                res.redirect('/book/' + id);
            } else {
                let err = new Error('Cannot find a book with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err=> {
            if(err.name === 'ValidationError')
                err.status = 400;
            next(err);
        });
    }else{
        let err = new Error('The route parameter is not a valid Objectid :' + id);
        err.status = 400;
        next(err); 
    }
  
}

exports.delete=(req,res,next)=>{
    let id = req.params.id;
    if(ObjectId.isValid(id)){
        if(!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid book id');
            err.status = 404;
            return next(err);
        }
        BookSchema.findByIdAndDelete(id, {useFindAndModify: false})
        .then(book =>{
            if(book) {
                res.redirect('/books');
            } else {
                let err = new Error('Cannot find a book with id ' + id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err=>next(err))
    }
    else{
        let err = new Error('The route parameter is not a valid Objectid :' + id);
        err.status = 400;
        next(err); 
    }

}


/////


exports.watch = (req, res, next) => {
    let id = req.params.id;
    let userId = req.session.user;
    BookSchema
      .findByIdAndUpdate(
        id,
        { $addToSet: { watchList: userId } },
        { useFindAndModify: false, runValidators: true }
      )
      .then((trade) => {
        return res.redirect("/users/profile");
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  };

  exports.unwatch = (req, res, next) => {
    let id = req.params.id;
    let userId = req.session.user;
    BookSchema
      .findByIdAndUpdate(
        id,
        { $pull: { watchList: userId } },
        { useFindAndModify: false, runValidators: true }
      )
      .then((trade) => {
        return res.redirect("/users/profile");
      })
      .catch((err) => {
        next(err);
      });
  };


  exports.getAvailable = (req, res, next) => {
    let id = req.params.id;
    let user=req.session
    Promise.all([
        BookSchema.findById(id),
        BookSchema.find({ author: req.session.user, status: "Available" }),
    ])
      .then((results) => {
        const [trade, bookDetails] = results;
        if (trade) {
          res.render("./story/offerTrade", { user,id, bookDetails });
        } else {
          let err = new Error("Invalid trade id");
          err.status = 400;
          req.flash("error", err.message);
          return res.redirect("back");
        }
      })
      .catch((err) => next(err));
  };


  exports.makeOffer = (req, res, next) => {
    console.log("Makeoffer---------------------------")
    let id = req.params.id;
    let tradeItem = req.body.tradeItem;
    BookSchema
      .findByIdAndUpdate(
        tradeItem,
        { $set: { status: "Pending" } },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((trade) => {
        if (trade) {
        } else {
          console.log("update failed");
        }
      })
      .catch((err) => next(err));
      BookSchema
      .findByIdAndUpdate(
        id,
        {
          $set: {
            offerItemId: tradeItem,
            offerItemOwner: req.session.user,
            status: "Pending",
          },
        },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .catch((err) => next(err));
    return res.redirect("/users/profile");
  };


  exports.rejectOffer = (req, res, next) => {
    let tradeItem = req.params.tradeItemId;
    let itemId = req.params.itemId;
  
    BookSchema
      .findByIdAndUpdate(
        tradeItem,
        {
          $set: {
            offerItemId: null,
            offerItemOwner: null,
            status: "Available",
          },
        },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .catch((err) => next(err));
      BookSchema
      .findByIdAndUpdate(
        itemId,
        {
          $set: {
            status: "Available",
            offerItemId: null,
            offerItemOwner: null,
          },
        },
        { useFindAndModify: false, runValidators: true }
      )
      .catch((err) => next(err));
  
    return res.redirect("/users/profile");
  };
  
  exports.manageOffer = (req, res, next) => {
    let id = req.params.id;
    BookSchema
      .findById(id)
      .populate("offerItemId", "id title category")
      .then((trade) => {
        if (trade) {
          res.render("./story/viewOffer", { trade });
        }
      })
      .catch((err) => next(err));
  };
  
  exports.acceptOffer = (req, res, next) => {
  let itemId = req.params.itemId;
  let tradeItemId = req.params.tradeItemId;
  BookSchema
    .findByIdAndUpdate(itemId, { $set: { status: "Traded" } })
    .then((trade) => {
      if (trade) {
        itemId = trade.offerItemId;
      }
    })
    .catch((err) => next(err));
    BookSchema
    .findByIdAndUpdate(tradeItemId, {
      $set: {
        status: "Traded",
        offerItemId: itemId,
        offerItemOwner: req.session.user,
      },
    })
    .then((item) => {
      if (item) {
        console.log("success updating second item");
       return res.redirect("/users/profile")
      }
    })
    .catch((err) => next(err));
};




