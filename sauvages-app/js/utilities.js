"use strict";


// -------------------------------------------------- Utilities ---------------------------------------------------- //

// WebDataBase DAO base code
app.dao.baseDAOBD = {
  
  buildSQLTable: function(model) {
    //Construction de la requête SQL
    var sql = 'CREATE TABLE  IF NOT EXISTS ' + model.table + ' ( ';
    var pKisDefined = false;
    _.each(model.schema, function( field, index) {
      
      //Set the col type
      var type = '' ;
      if (field.sqltype) type =field.sqltype ; 
      else type =app.utils.bbforms2sqlite.dataType[field.type]; 
      if  (type !== 'NOT_AVAILABLE') {
        //Set the col constraints
        var constraint  = field.constraints; 
        if (typeof(field.constraints) === 'undefined') {
          constraint  = '';
        }
        if (field.required) constraint  = constraint + app.utils.bbforms2sqlite.constraints.required;
        
        if (field.sqlconstraints === 'PRIMARY KEY') {
          pKisDefined = true;
        }
        
        sql = sql + index + ' ' + type  + ' ' + constraint + ',';
      }
    });
    if (!pKisDefined ) sql = sql + 'PK INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT ,';
    sql = sql.slice(0, -1);
    sql = sql + ')';
    console.log (sql);
    return sql;
  },
    
  getSQLFieldList: function(model)  {
   var field =  _.map(model.schema, function(field, key) {
      if ((field.sqltype) || (app.utils.bbforms2sqlite.dataType[field.type] !=='NOT_AVAILABLE' ) ) return  key;  
    });
    field = _.filter(field, function(key){ return (typeof(key) !== 'undefined') ; }); 
    return field;
  },
  
  buildSQLInsert: function(model) {
    //Construction de la requête SQL
    var sql = ' INSERT INTO ' + model.table + ' ( ';
    var field = this.getSQLFieldList(model);
    sql = sql + field.join(',') + ') VALUES (' ;
    sql = sql + Array(field.length+1).join('?,');
    sql = sql.slice(0, -1);
    sql = sql + ')';
    return sql;
  },
 
  populate: function(model, callback) {
    deferreds.push(runQuery(this.buildSQLTable(model) , []));
  },
  
  create: function(model, callback) {
    var self =this;
    //First save subModel data
    var subobjects = _.map(model.schema, function(field, key) {
      if (field.type === 'NestedModel' ) return  key;  
    });
    subobjects = _.filter(subobjects, function(key){ return (typeof(key) !== 'undefined') ; }); 
    if (subobjects.length >0) {
      $.each(subobjects, function(index, data) {
        if (model.schema[data].save) {
          var subValues = model.get(data);
          if (typeof(subValues) !== 'undefined')  subValues.save();
        }
      });    
    }
    this.db.transaction(
      function(tx) {
        //Build SQL 
        var sql = self.buildSQLInsert(model);
        var values = _.map(self.getSQLFieldList(model), function(field){ return model.get(field); });
        console.log(values);
        tx.executeSql(sql,values);
      },
      function(tx, error) {
        console.log(tx);
      }
    );
  },
  
  findAll: function(model, callback) {
    this.db.transaction(
      function(tx) {
        var sql = 'SELECT * FROM '+model.table+' LIMIT 500 ';
        console.log(sql);
        tx.executeSql(sql,[], function(tx, results) {
          var len = results.rows.length,
            data = [],
            i = 0;
          for (; i < len; i = i + 1) {
            data[i] = results.rows.item(i);
          }
          callback(data);
        });
      },
      function(tx, error) {
          console.log(tx);
      }
    );
  },

  findWithCriteria :  function(model, callback) {
    this.db.transaction(
      function(tx) {
        //Récupération des arguments
        var args = ((model.attributes) ? model.attributes: model.filters); 
        
        var sqlWere = ' WHERE ';
        var parameters = new Array();
        //Mise en place du filtre WHERE et du tableau des valeurs
        $.each(args, function(index, arg) {
          sqlWere = sqlWere +  ' ' + index + ' =  ? AND';
          parameters.push(""+arg+"");
        });
        sqlWere = sqlWere.slice(0, -3);
        
        var sql = 'SELECT * FROM '+model.table+' ' + sqlWere + ' LIMIT 500 ';
        console.log(sql);
        tx.executeSql(sql,parameters, function(tx, results) {
          var len = results.rows.length,
            data = [],
            i = 0;
          for (; i < len; i = i + 1) {
            data[i] = results.rows.item(i);
          }
          //Charger les données des subviews
          callback(data);
        });
      },
      function(tx, error) {
          console.log(tx);
      }
    );
  },
}

// The Template Loader. Used to asynchronously load templates located in separate .html files
app.utils.templateLoader = {
    templates: {},

    load: function(names) {
      //var deferreds = [], self = this;
      var self = this;
      $.each(names, function(index, name) {
          deferreds.push($.get('tpl/' + name + '.html', function(data) {
              console.log('load ' + name);
              self.templates[name] = data;
          }));
      });

      //$.when.apply(null, deferreds).done(callback);
    },

    // Get template by name from hash of preloaded templates
    get: function(name) {
        return this.templates[name];
    }

};

app.utils.bbforms2sqlite= {
  dataType : {
    'Text': 'VARCHAR(250)',
    'Number': 'REAL',
    'Password': 'VARCHAR(250)',
    'TextArea':'TEXT',
    'Checkbox':'NOT_AVAILABLE',
    'Checkboxes':'NOT_AVAILABLE',
    'Hidden':'NOT_AVAILABLE',
    'Select':'NOT_AVAILABLE',
    'Radio':'NOT_AVAILABLE',
    'Object':'NOT_AVAILABLE',
    'NestedModel':'NOT_AVAILABLE',
    'Date': 'DATE',
    'DateTime': 'DATETIME',
    'List': 'NOT_AVAILABLE',
    'Boolean':'INTEGER',
  },
  constraints: {
    'required' : 'NOT NULL'
  },  
}
