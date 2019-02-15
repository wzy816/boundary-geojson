'use strict'
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const router = require('./router.js')

const app = new Koa();
app.use(bodyParser());

app.use(async(ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err)
    ctx.status = 500;
    ctx.body = err.message || "Sorry, an error has occurred."
  }
});
app.use(router.routes());

app.listen(3000)
