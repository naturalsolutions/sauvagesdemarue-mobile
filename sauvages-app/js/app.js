"use strict";

// Creating the application namespace
var app = {
  config: {
    // Find pathname portion of the URL and clean it (remove trailing slash if any)
    root: window.location.pathname.replace(/\/(?:index.html)?$/, '')
  },
  dao: {},
  models: {},
  views: {},
  utils: {}
};

// ----------------------------------------------- The Application initialisation ------------------------------------------ //

$().ready(function() {
  init();
}) ;

function init(){

  window.deferreds = [];
  
  initDB();

  $.when.apply(null, deferreds).done(function() {
    console.log ('all deferreds finished');
    app.route = new app.Router();
    Backbone.history.start();
  });
}

function initDB(){
  console.log("initBD");
  // Initialisation des données 
  app.db = openDatabase("sauvage-PACA", "1.0", "db sauvage-PACA", 20*1024*1024); // espace accordé à la BD: 20 MO
  app.dao.baseDAOBD.populate(new app.models.Taxon());
  app.dao.baseDAOBD.populate(new app.models.TaxonCaracValue());
  app.dao.baseDAOBD.populate(new app.models.Picture());
  app.dao.baseDAOBD.populate(new app.models.CaracteristiqueDef());
  app.dao.baseDAOBD.populate(new app.models.CaracteristiqueDefValue());
  app.dao.baseDAOBD.populate(new app.models.Groupe());
  //test if data are already loaded
  var dfd = $.Deferred();
  deferreds.push(dfd);
  //Test si les données existes
  //Si oui alors => pas de chargement des données en base
  $.when(runQuery("SELECT * FROM Ttaxon" , [])).done(function (dta) {
    if (dta.rows.length == 0 ) {
      loadXmlTaxa();
      loadXmlCriteria();
    }
    return dfd.resolve();
  }).fail(function (err) {
      return dfd.resolve();
  });
}
