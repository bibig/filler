exports.numeric      = numeric;
exports.alphanumeric = alphanumeric;
exports.string       = string;
exports.integer      = integer;
exports.float        = float;
exports.email        = email;
exports.date         = date;
exports.datetime     =datetime;
exports.timestamp    = timestamp;

var rander = require('rander');

function alphanumeric (field) {
  var min = field.min || 1;
  var max = field.max || 100;

  return rander.string(rander.between(min, max));
}

function numeric (field) {
  var min = field.min || 1;
  var max = field.max || 100;

  return rander.number(rander.between(min, max)); 
}

function string (field, lang) {
  var str = '';
  var mice = require('mice')(lang || 'cn');
  var min = field.min || 1;
  var max = field.max || 1500;

  function tail (inputType) {
    switch (inputType) {
      case 'rich_textarea':
        return mice.paragraphs(3, ['<p>', '</p>']);
      case 'textarea':
        return mice.sentences(3);
      default:
        return mice.sentence();
    }  
  }

  while (str.length < min) {
    str += tail(field.inputType);
  }

  if (str.length > max) {
    str = str.substring(0, max - 1);
  }

  return str;
}

function integer (field) {
  var min, max, decimals, tmp ;

  min = field.minValue || 0 ;
  max = field.maxValue || 100;
  decimals = field.decimals || 2;
  tmp = decimals * 10;

  return rander.between(min, max);
}

function float (field) {
  var min, max, decimal, v;

  min = field.minValue || 0 ;
  max = field.maxValue || 100;
  decimals = field.decimals || 2;

  v = Math.pow(10, decimals);
  return parseInt(rander.between(min * v, max * v), 10) / v; 
}

function email () {
 var domain = ['me.com', 'google.com', 'qq.com', 'facebook.com', 'yahoo.com', 'live.com', 'hotmail.com']; 

 return rander.string(rander.between(3, 10)) + '@' + rander.ele(domain);
}

function date () {
  var currentYear = new Date().getFullYear();
  var y = rander.between(currentYear - 20, currentYear);
  var m = rander.dice(11);
  var d = rander.dice(31);

  return new Date(y, m, d);
}

function datetime () {
  var currentYear = new Date().getFullYear();
  var y = rander.between(currentYear - 20, currentYear);
  var m = rander.dice(11);
  var d = rander.dice(31);
  var hh = rander.dice(59);
  var mm = rander.dice(59);
  var ss = rander.dice(59);

  return new Date(y, m, d, hh, mm, ss);
}

function timestamp () {
  return datetime().getTime();
}

