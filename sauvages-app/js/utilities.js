"use strict";


// -------------------------------------------------- Utilities ---------------------------------------------------- //


app.utils.queryData = {
  //count taxon nb
  getFilterTaxonIdList: function(filters, exact) {
    var dfd = $.Deferred();
    var sqlWere = ' WHERE ';
    var parameters = new Array();
    $.each(filters, function(index, arg) {
      sqlWere = sqlWere +  ' fk_carac_value =  ? OR';
      parameters.push(""+arg+"");
    });
    sqlWere = sqlWere.slice(0, -3);
    var sqlGroupBy = ' GROUP BY fk_taxon ' ;
    if (exact == true) {
      sqlGroupBy =  sqlGroupBy + ' HAVING count(*) = '+ filters.length;
    }
    else {
      sqlGroupBy =  sqlGroupBy + '  ORDER BY count(*) ';
    }
    var sql = 'SELECT DISTINCT fk_taxon, count(*) as count FROM TvalTaxon_Criteria_values ' + sqlWere + sqlGroupBy;
    runQuery(sql, parameters).done(
      function(results){
          var len = results.rows.length,
            data = [],
            i = 0;
          for (; i < len; i = i + 1) {
            data[i] = results.rows.item(i);
          }
          
          return dfd.resolve(data);
      }
    );
    return dfd.promise();
  }
  
}
    
    

// WebDataBase DAO base code
app.dao.baseDAOBD = {
  
  getDaoMetadata : function (model) {
    this.table = (typeof(model.constructor.table) === 'undefined') ?  model.model.table :  model.constructor.table;
    this.schema = (typeof(model.constructor.schema) === 'undefined') ?  model.model.schema :  model.constructor.schema;
  },
  
  buildSQLTable: function(model) {
    this.getDaoMetadata(model);
    //var schema = (options.initialData) ? options.initialData : {};
    //Construction de la requête SQL
    var sql = 'CREATE TABLE  IF NOT EXISTS ' + this.table+ ' ( ';
    var pKisDefined = false;
    _.each(this.schema, function( field, index) {
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
				//@TODO improve code
        if (field.required) constraint  = constraint + app.utils.bbforms2sqlite.constraints.required;
        if (field.autoincrement) constraint  = constraint + app.utils.bbforms2sqlite.constraints.autoincrement;
        
        if (field.sqlconstraints === 'PRIMARY KEY') {
					constraint = 'PRIMARY KEY  '+constraint;
          pKisDefined = true;
        }
        
        sql = sql + index + ' ' + type  + ' ' + constraint + ',';
      }
    });
    if (!pKisDefined ) sql = sql + 'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT ,';
    sql = sql.slice(0, -1);
    sql = sql + ')';
    console.log (sql);
    return sql;
  },
    
  getSQLFieldList: function()  {
   var field =  _.map(this.schema, function(field, key) {
      if ( ((field.sqltype) || (app.utils.bbforms2sqlite.dataType[field.type] !=='NOT_AVAILABLE' )) && ((field.autoincrement=== false )  || (!field.autoincrement)  ) )  {
				return  key;  
			}
    });
    field = _.filter(field, function(key){ return (typeof(key) !== 'undefined') ; }); 
    return field;
  },
  
  buildSQLInsert: function(model) {
    this.getDaoMetadata(model);
    //Construction de la requête SQL
    var sql = ' INSERT INTO ' + this.table + ' ( ';
    var field = this.getSQLFieldList(model);
    sql = sql + field.join(',') + ') VALUES (' ;
    sql = sql + Array(field.length+1).join('?,');
    sql = sql.slice(0, -1);
    sql = sql + ')';
		console.log(sql);
    return sql;
  },
  
  buildSQLUpdate: function(model) {
    this.getDaoMetadata(model);
    //Construction de la requête SQL
    var sql = ' UPDATE ' + this.table + '  SET ';
    var field = this.getSQLFieldList(model);
			
    sql = sql + field.join('= ? ,') + ' =? ' ;
    //Find PK 
		
		sql = sql +  ' WHERE id = ? ';
		console.log(sql);
    return sql;
  },
 
  populate: function(model, callback) {
    //Run sql create query and return defered object
    return runQuery(this.buildSQLTable(model) , []);
  },
  
  create: function(model, callback) {
    this.getDaoMetadata(model);
    var self =this;
    //First save subModel data
    var subobjects = _.map(this.schema, function(field, key) {
      if (field.type === 'NestedModel' ) return  key;  
    });
    subobjects = _.filter(subobjects, function(key){ return (typeof(key) !== 'undefined') ; }); 
    if (subobjects.length >0) {
      $.each(subobjects, function(index, data) {
        if (self.schema[data].save) {
          var subValues = model.get(data);
          if (typeof(subValues) !== 'undefined')  subValues.save();
        }
      });    
    }
    var sql = self.buildSQLInsert(model);
    var values = _.map(self.getSQLFieldList(model), function(field){ return model.get(field); });
      //console.log(values);
      //Return a defered object
    return runQuery(sql , values);
  },
	update: function(model, callback) {
    this.getDaoMetadata(model);
    var self =this;
    //First save subModel data
    var subobjects = _.map(this.schema, function(field, key) {
      if (field.type === 'NestedModel' ) return  key;  
    });
    subobjects = _.filter(subobjects, function(key){ return (typeof(key) !== 'undefined') ; }); 
    if (subobjects.length >0) {
      $.each(subobjects, function(index, data) {
        if (self.schema[data].save) {
          var subValues = model.get(data);
          if (typeof(subValues) !== 'undefined')  subValues.save();
        }
      });    
    }
    var sql = self.buildSQLUpdate(model);
    var values = _.map(self.getSQLFieldList(model), function(field){ return model.get(field); });
		values = values.concat([model.get('id')]);
      //console.log(values);
      //Return a defered object
    return runQuery(sql , values);
  },
  
  findAll: function(model, callback) { 
    this.getDaoMetadata(model);
    var self = this;
    this.db.transaction(
      function(tx) {
        var selectField = _.filter(_.keys(self.schema), function(key){ return (typeof(key) !== 'undefined') ; }).join(','); 
        var sql = 'SELECT '+selectField+' FROM '+self.table+' LIMIT 500 ';
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
    this.getDaoMetadata(model);
    var self = this;
    this.db.transaction(
      function(tx) {
        //Récupération des arguments
        var args = ((model.attributes) ? model.attributes: model.filters); 
        var sqlWere = ' WHERE ';
        var parameters = new Array();
        //Mise en place du filtre WHERE et du tableau des valeurs
        $.each(args, function(index, arg) {
          //@TODO join query for nested model criteria
          if ((self.schema[index]['type'] !== 'NestedModel') && (typeof(arg) !== 'undefined')) {
            sqlWere = sqlWere +  ' ' + index + ' =  ? AND';
            parameters.push(arg);
          }
        });
        sqlWere = sqlWere.slice(0, -3);
        
        var sql = 'SELECT * FROM '+self.table+' ' + sqlWere + ' LIMIT 500 ';
        console.log(sql);
        tx.executeSql(sql,parameters, function(tx, results) {
          var len = results.rows.length,
            data = [],
            i = 0;
          for (; i < len; i = i + 1) {
            data[i] = results.rows.item(i);
          }
          //@TODO test if collection or model
          if (data.length === 1) data = data[0]
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
    'required' : 'NOT NULL', 
		'autoincrement':'AUTOINCREMENT',
  },  
}
// capitaliseFirstLetter
function capitaliseFirstLetter(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}




// -------------------------------------------------- GEOLOCALISATION ---------------------------------------------------- //

app.utils.geolocalisation = {
  // Fonction de callback en cas de succès
  watchCurrentPosition : function () {
    var survId = navigator.geolocation.watchPosition(_.bind(this.gotPositionCoords, this));
  },

  getCurrentPosition : function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(_.bind(this.gotPositionCoords, this), this.gotErr, { enableHighAccuracy: true, maximumAge: 100, timeout: 1000 });
    }
    else
      console.log("Votre navigateur ne prend pas en compte la géolocalisation HTML5");
  },
  
  // We've got our position, let's show map and update user
  gotPositionCoords: function (position) {
    this.currentPosition = position.coords;
  },//gotPos

  // Trap a GPS error, log it to console and display on site
  gotErr:  function (error) {
    var errors = { 
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
        };
    console.log("Error: " + errors[error.code]);
  },
}



	
