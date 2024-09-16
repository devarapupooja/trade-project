const express=require('express');
const controller=require('../controllers/tradeController');
const { isLoggedIn, isAuthor,isNotAuthor,canCancel,canAccept } = require('../middlewares/auth');
const {validateId,validateTrade,validateResult} = require('../middlewares/validator');
 

const router=express.Router();



router.get('/',controller.index);

router.get('/books',controller.books);

router.get('/newbook',isLoggedIn,controller.newbook);

router.post('/',controller.create);

router.get('/book/:id',isLoggedIn,controller.display);

router.get('/:id/edit',isLoggedIn,isAuthor,controller.edit);

router.put('/:id',isLoggedIn,isAuthor,controller.update);

router.delete('/:id',isLoggedIn,isAuthor,controller.delete);




//////
router.put("/trade/watch/:id",validateId,isLoggedIn,isNotAuthor,validateResult,controller.watch);

router.put("/trade/unwatch/:id",validateId,isLoggedIn,isNotAuthor,validateResult,controller.unwatch);

router.get("/trade/offer/:id",validateId,isLoggedIn,isNotAuthor,validateResult,controller.getAvailable);

router.post("/trade/offer/:id",validateId,isLoggedIn,isNotAuthor,validateResult,controller.makeOffer);

router.post("/trade/offer/reject/:tradeItemId/:itemId",isLoggedIn,canCancel,validateResult,controller.rejectOffer);

router.get("/trade/offer/manage/:id",validateId,validateResult,controller.manageOffer);

router.post("/trade/offer/:tradeItemId/:itemId/accept",isLoggedIn,canAccept,validateResult,controller.acceptOffer);



module.exports=router;