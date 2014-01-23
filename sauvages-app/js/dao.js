"use strict";

// -------------------------------------------------- Sync ---------------------------------------------------- //
// Overriding Backbone's sync method. Replace the default RESTful services-based implementation
// with a simple local database approach.
/*
 * 
    method – the CRUD method ("create", "read", "update", or "delete")
    model – the model to be saved (or collection to be read)
    options – success and error callbacks, and all other jQuery request options
*/

Backbone.sync = function(method, model, options) {
  //Get dao 
  var dao = (typeof(model.constructor.dao) === 'undefined') ?  new model.model.dao(app.db) :  new model.constructor.dao(app.db);
  var dfd ;
  if (method === "read") {   
   if (model.get('FAKE_taxonName')) {
     dao.findByName(model, function(data) {
          options.success(data);
      });
  }
   else if ((model.attributes) || (model.filters)) {
      dao.findWithCriteria(model, function(data) {
          options.success(data);
      });
    }
    else {
      dao.findAll(model, function( data) {
          options.success(data);
      });
    }
  }
  else if (method === "create") {
    dfd = dao.create(model, function(data) {
      options.success(data);
    });
  }
	else if (method === "update") {
		 dfd = dao.update(model, function(data) {
      options.success(data);
    });
	}
  else if (method === "delete") {
    if (model.attributes.id) {
      dfd = dao.destroyObs(model.attributes.id, function(data) {
        options.success(data);
      });  
    }else{
      dfd = dao.delete(model, function(data) {
        options.success(data);
      });
    }
    
  }
  return dfd;
};

// -------------------------------------------------- DAO ---------------------------------------------------- //
// The Taxon Data Access Object (DAO). Encapsulates logic (in this case SQL statements) to access data.
app.dao.UserDAO = function(db) {
    this.db = db;
};
app.dao.TaxonDAO = function(db) {
    this.db = db;
};
app.dao.PictureDAO = function(db) {
    this.db = db;
};
app.dao.TaxonCaracValueDAO = function(db) {
    this.db = db;
};
app.dao.GroupeDAO = function(db) {
    this.db = db;
};
app.dao.CaracteristiqueDefDAO = function(db) {
    this.db = db;
};
app.dao.CaracteristiqueDefValueDAO = function(db) {
    this.db = db;
};
app.dao.ContextDAO = function(db) {
    this.db = db;
};
app.dao.OccurenceDataValueDAO = function(db) {
    this.db = db;
};

app.dao.ParcoursDataValueDAO = function(db) {
    this.db = db;
};

_.extend(app.dao.UserDAO.prototype, app.dao.baseDAOBD,{
  /*updateEmailTuser: function(model, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "UPDATE Tuser SET email= ? WHERE userId = ? ";
                tx.executeSql(sql, [model.get('email'), model.get('Tuser')]);
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    }*/
});
_.extend(app.dao.TaxonDAO.prototype, app.dao.baseDAOBD);
_.extend(app.dao.PictureDAO.prototype, app.dao.baseDAOBD);
_.extend(app.dao.TaxonCaracValueDAO.prototype, app.dao.baseDAOBD);
_.extend(app.dao.GroupeDAO.prototype, app.dao.baseDAOBD);
_.extend(app.dao.CaracteristiqueDefDAO.prototype, app.dao.baseDAOBD);
_.extend(app.dao.CaracteristiqueDefValueDAO.prototype, app.dao.baseDAOBD);
_.extend(app.dao.ContextDAO.prototype, app.dao.baseDAOBD);
_.extend(app.dao.OccurenceDataValueDAO.prototype, app.dao.baseDAOBD,{
   destroyObs: function(id,callback) {
        this.db.transaction(
            function(tx) {
                var sql = "delete from TdataObs_occurences where id= ? " ;
              tx.executeSql(sql, [id], function(tx, results) {
                callback(id,results);
              });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    }
});
_.extend(app.dao.ParcoursDataValueDAO.prototype, app.dao.baseDAOBD);


_.extend(app.dao.ParcoursDataValueDAO.prototype , {

  getDefaultRueName: function( callback) {
		var dfd = $.Deferred();
		var sql = "SELECT max(id) + 1 as nextStreet FROM TdataObs_parcours ";			
		runQuery( sql , []).done(function(d) {
			var defaultStreetName =  (!d.rows.item(0)['nextStreet']) ? 'Rue 1' : 'Rue ' +d.rows.item(0)['nextStreet'];
			return  dfd.resolve(defaultStreetName);
		});
     return  dfd.promise();     
	}
});

_.extend(
app.dao.TaxonDAO.prototype, {
    
  /*findByName: function(key, callback) {
      this.db.transaction(
          function(tx) {

              var sql = "SELECT fk_collectionid , pageid , taxonConceptId, taxonName , flathierarchy, preferredCommonNames , textDesc_objectid , textDesc_title , textDesc_credits , textDesc_description, iucnStatus , image_objectid , image_title, image_credits , image_fileName " +
                  "FROM Ttaxons " +
                  "WHERE preferredCommonNames || taxonName LIKE ?  LIMIT 20";

              tx.executeSql(sql, ['%' + key + '%'], function(tx, results) {
                  var len = results.rows.length,
                      taxons = [],
                      i = 0;
                  for (; i < len; i = i + 1) {
                      taxons[i] = results.rows.item(i);
                  }
                  callback(taxons);
              });
          },
          function(tx, error) {
              console.log(tx);
              alert("Transaction Error: " + error);
          }
      );
  },

  findByTaxonConceptId: function(id, callback) {
      this.db.transaction(
          function(tx) {
              var sql = "SELECT fk_collectionid , pageid , taxonConceptId, taxonName , flathierarchy, preferredCommonNames , textDesc_objectid , textDesc_title , textDesc_credits , textDesc_description, iucnStatus , image_objectid , image_title, image_credits , image_fileName " +
                  "FROM Ttaxons " +
                  "WHERE taxonConceptId=?";
              tx.executeSql(sql, [id], function(tx, results) {
                  callback(results.rows.length === 1 ? results.rows.item(0) : null);
              });
          },
          function(tx, error) {
              console.log(tx);
              alert("Transaction Error: " + error);
          }
      );
  },
  
  findAllByCollectionid: function(id,callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT fk_collectionid , pageid , taxonConceptId, taxonName , flathierarchy, preferredCommonNames , textDesc_objectid , textDesc_title , textDesc_credits , textDesc_description, iucnStatus , image_objectid , image_title, image_credits , image_fileName " +
                    "FROM Ttaxons " +
                    "WHERE ','||fk_collectionid||',' LIKE ?";
             
                tx.executeSql(sql,['%,' +id+',%' ], function(tx, results) {
                    var len = results.rows.length,
                        taxons = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        taxons[i] = results.rows.item(i);
                    }
                    callback(taxons);
                });
            },
            function(tx, error) {
                console.log(tx);
                alert("Transaction Error: " + error);
            }
        );
    }*/    
});


