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
  utils: {},
  globals : {},
};

// ----------------------------------------------- The Application initialisation ------------------------------------------ //

$().ready(function() {
  init();
}) ;

function init(){

  window.deferreds = [];
  
  $("body").addClass("ui-disabled");
  $("body").append("<img id='dataloader-img' src='css/images/ajax-loader.gif'/>");
  
  initDB();

  $.when.apply(null, deferreds).done(function() {
    console.log ('all deferreds finished');
    app.globals.cListAllTaxons = new app.models.TaxonLiteCollection();
    app.globals.cListAllTaxons.fetch({
       success: function(data) {
          app.route = new app.Router();
          Backbone.history.start();
          $('#dataloader-img').remove();
          $("body").removeClass("ui-disabled");
        }
    }); 
    
  });
  
}

function initDB(){
  console.log("initBD");
  // Initialisation des données 
  app.db = openDatabase("sauvage-PACA", "1.0", "db sauvage-PACA", 20*1024*1024);
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Taxon()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.TaxonCaracValue()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Picture()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.CaracteristiqueDef()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.CaracteristiqueDefValue()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Groupe()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Context()));

  var dfd = $.Deferred();
  deferreds.push(dfd);
  //test if data are already loaded
  //Si oui alors => pas de chargement des données en base
  $.when(runQuery("SELECT * FROM Ttaxon" , [])).done(function (dta) {
    var arr = [];
    if (dta.rows.length == 0 ) {      
      arr.push(loadXmlTaxa());
      arr.push(loadXmlCriteria());
    }
    $.when.apply(this, arr).then(function () {
      console.log('when finished dfd.resolve test if data are loaded');
      return  dfd.resolve();
    });
  }).fail(function (err) {
      return dfd.resolve();
  });
}
