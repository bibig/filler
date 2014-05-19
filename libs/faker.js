module.exports = Faker;

var rander = require('rander');
var yi     = require('yi');
var helpers  = require('./helpers');
var myna   = require('myna')({
  100: 'the field <%s> need values definition',
  101: 'no record found in the reference table <%s>'
});


function Faker (can, config) {
  this.can             = can;
  this.config          = config;
  this.tables          = config.tables;
  this.reference_caches = {};
  this.mice            = require('mice')(config.lang || 'cn');
}


Faker.prototype.build = function () {
  var self = this;

  Object.keys(this.tables).forEach(function (name) {
    self.fill(name);
  });

};

Faker.prototype.fill = function (name) {
  var Table = this.can.open(name);
  var count = this.tables[name];

  do {
    Table.insertSync(this.assemble(name));
  } while (--count > 0);

};

Faker.prototype.getReferenceTableIds = function (tableName, fieldName) {
  var Table = this.can.open(tableName);
  var cacheId = this.getReferenceTableCacheId(tableName, fieldName);
  var refTable, filters = {}, records, field;

  if ( ! this.reference_caches[cacheId] ) {
    
    refTable = Table.Ref.getReferenceTable(fieldName);
    field = Table.schemas.getField(fieldName);

    if (field.prepare) {
      filters =  field.prepare.filters || {};
    }

    records = this.can.open(refTable).query(filters).select('_id').execSync();
    
    if (yi.isEmpty(records)) {
      throw myna.speak(101, refTable);
    }

    this.reference_caches[cacheId] = records;
  }

  return this.reference_caches[cacheId];
};

Faker.prototype.getReferenceTableCacheId = function (tableName, refFieldName) {
  return tableName + refFieldName;
};


Faker.prototype.checkFieldValues = function (field) {

  if ( yi.isEmpty(field.values)) {
    throw myna.speak(100, name);
  }

};

Faker.prototype.assemble = function (tableName) {
  var Table = this.can.open(tableName);
  var self = this;
  var data = {};

  Table.schemas.forEachField(function (name, field) {
    if ( ! field.required || field.default !== undefined || field.type === 'random' || ['created', 'modified'].indexOf(name) > -1 ) { return; }

    switch (field.type) {
      case 'int':
        data[name] = helpers.integer(field);
        break;

      case 'float':
        data[name] = helpers.float(field);
        break;

      case 'array': 
        self.checkFieldValues(field);
        data[name] = rander.dice(field.values.length - 1);
        break;

      case 'enum':
        self.checkFieldValues(field);
        data[name] = rander.element(field.values);
        break;

      case 'map':
      case 'hash':
        self.checkFieldValues(field);
        data[name] = rander.key(field.values);
        break;

      case 'ref':
        data[name] = rander.element(self.getReferenceTableIds(tableName, name))._id;
        break;

      case 'boolean':
        data[name] = rander.element([true, false]);
        break;

      case 'enum':
        self.checkFieldValues(field);
        data[name] = rander.dice(field.values.length - 1);
        break;

      case 'email':
        data[name] = helpers.email();
        break;

      case 'password':
        data[name] = '111111';
        break;

      case 'date':
        data[name] = helpers.date();
        break;

      case 'datetime':
        data[name] = helpers.datetime();
        break;

      case 'timestamp':
        data[name] = helpers.timestamp();
        break;

      case 'alphanumeric':
        data[name] = helpers.alphanumeric(field);
        break;

      case 'numeric':
        data[name] = helpers.numeric(field);
        break;

      // to do
      case 'url':
      case 'uuid':
      case 'alpha':
      case 'numeric':
      
      case 'ip': // same as ip4
      case 'ip4':
      case 'ip6':
      case 'creditCard':
      case 'credit card': // same as creditCard
        data[name] = null; 
        break;

      case 'image':
        break;

      default:
        data[name] = helpers.string(field);
    }
  });

  return data;
};
