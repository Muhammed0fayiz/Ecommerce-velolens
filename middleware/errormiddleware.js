const error1 = (req, res, next) => {
    res.status(404);
    res.render('user/error');
};

const error2 = (err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    res.status(err.status || 500);
    console.log(err);
    res.render('user/error');
};
  
module.exports = (req, res, next) => {
    res.error1 = error1;
    res.error2 = error2;
    next();
};
