const express=require('express');
const morgan=require('morgan');
const bookrouters= require('./routers/bookrouters');
const methodOverride=require('method-override');
const mongoose = require('mongoose');
const userRoutes = require('./routers/userRoutes');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const app=express();

let port=3000;
let hostname='localhost';

app.set('view engine','ejs');

//connect to database
mongoose.connect('mongodb://127.0.0.1:27017/booksdb', 
                {useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    app.listen(port, hostname, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

app.use(
    session({
        secret: "dygfyubfuyewgyfighqufhqwuiogdqiuogowqf",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://127.0.0.1:27017/booksdb'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.firstName = req.session.firstName||null;
    res.locals.lastName = req.session.lastName||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});


app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'))

app.get('/',(req,res)=>{
    res.render('index');
})

app.use('/',bookrouters);
app.use('/users',userRoutes);

app.use((req,res,next)=>{
let err=new Error('The server cannot locate '+req.url);
err.status=404;
console.log("err",err);
next(err);
});

app.use((err,req,res,next)=>{
if(!err.status){
    console.log("err",err);
    err.status=500;
    err.message=("Internal Server Error");
}
res.status(err.status);
res.render('error',{error:err});
});


