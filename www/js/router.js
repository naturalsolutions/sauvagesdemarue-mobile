"use strict";

// ----------------------------------------------- The Application Router ------------------------------------------ //

app.Router = Backbone.Router.extend({
  
  routes: {
    'identification' : 'viewIdentKey',
    'taxonlist' : 'viewTaxonlist',
    'taxonlist/:all' : 'viewTaxonlist',
    'taxondetail/:id' : 'viewTaxonDetail',
    'addObs/:taxonId' : 'viewFormAddObs',
    'addNonIdentifiee'  : 'viewFormNIOnbs',
    'addPasListe'  : 'viewFormPLOnbs',
    'addParcours(/:state)' : 'viewFormAddParcours',
    'myObservation' : 'viewTableMyObs',
     //'choixOutils' : 'viewChoixOutils',
    '' : 'viewHomePage',
  },

  initialize: function() {
    app.globals.currentFilter = new Array();
    app.globals.currentFilterTaxonIdList = new Array();
    app.globals.currentRueList = new app.models.ParcoursDataValuesCollection;
    
    //Démarrage de l'écoute GPS
    app.utils.geolocalisation.watchCurrentPosition();
    // Keep track of the history of pages (we only store the page URL). Used to identify the direction
    // (left or right) of the sliding transition between pages.
    this.pageHistory = [];

    // Register event listener for back button troughout the app
    $('#content').on('click', '.header-back-button', function(event) {
        window.history.back();
        return false;
    });
  },
	
  goToLastPage: function() {
    window.history.back();
    return false;
  },
	
  viewHomePage: function() {
    var self= this;
    setTimeout(function() {
      $(".loading-splash").hide();
      $('#splash-screen').hide();
      var currentView = new app.views.HomePageView();
    self.displayView(currentView);
    }, 2000);
  },
  //viewChoixOutils: function() {
  //  var currentView = new app.views.pageChoixOutils();
  //  this.displayView(currentView);
  //},
  viewIdentKey : function() {
//    if (typeof(app.globals.currentrue) === 'undefined') {
//	    alert('Rue non initialisée');
//	    return false;
//    }
    console.log('viewIdentKey viewIdentKey');
    var self = this;
    var cListAllCriterias = new app.models.CaracteristiqueDefsCollection();
    cListAllCriterias.fetch({
        success: function(data) {
          var currentView = new app.views.IdentificationKeyView({collection: data});
          self.displayView(currentView);
        }
    }) 
  },

  viewTaxonlist : function(all) {
//    if (typeof(app.globals.currentrue) === 'undefined') {
//	    alert('Rue non initialisée');
//      return false;
//    }
    console.log('viewTaxonlist');
    var taxons;
    if( all || app.globals.currentFilterTaxonIdList.length === 0 ){
      taxons = app.globals.cListAllTaxons;    
    }
    else {
        taxons  = new app.models.TaxonLiteCollection();
        taxons.models = app.globals.cListAllTaxons.multiValueWhere({'taxonId' :_.pluck(app.globals.currentFilterTaxonIdList, 'fk_taxon')}) ;
    }
    var currentView = new app.views.TaxonListView({collection: taxons});
    this.displayView(currentView);
  },
  
  viewTaxonDetail : function(id) {
//    if (typeof(app.globals.currentrue) === 'undefined') {
//	    alert('Rue non initialisée');
//	    return false;
//    }
    console.log('viewTaxonDetail');
    var self = this;
    var taxon= new app.models.Taxon({"taxonId": id});
    taxon.fetch({
          success: function(data) {
            var currentView = new app.views.TaxonDetailView({model: data});
            self.displayView(currentView);
            
          }
      });
  },

  viewFormAddObs : function(taxonI) {
//    if (typeof(app.globals.currentrue) === 'undefined') {
//	    alert('Rue non initialisée');
//	    return false;
//    }
    var self = this;
    setTimeout(function() {
      app.utils.geolocalisation.getCurrentPosition();
      if (typeof(app.utils.geolocalisation.currentPosition) !== 'undefined') {
        var selectedTaxon = app.globals.cListAllTaxons.where({taxonId:parseInt(taxonI)});
        var obs = new app.models.OccurenceDataValue({"fk_taxon": taxonI, fk_rue:app.globals.currentrue.get('id'), "name_taxon" : selectedTaxon[0].get('commonName')});
        obs.set('latitude',app.utils.geolocalisation.currentPosition.latitude );
        obs.set('longitude',app.utils.geolocalisation.currentPosition.longitude);
        var currentView = new app.views.AddSauvageOccurenceView({model:obs});
        self.displayView(currentView);   
      }
      else{
        sauvages.notifications.gpsNotStart();
        self.goToLastPage();
      }
    },500);
    
  },
  
  viewFormNIOnbs  : function() {
//    if (typeof(app.globals.currentrue) === 'undefined') {
//	    alert('Rue non initialisée');
//	    return false;
//    }
    var self = this;
    setTimeout(function() {
      app.utils.geolocalisation.getCurrentPosition();
      if (typeof(app.utils.geolocalisation.currentPosition) !== 'undefined') {
        var obs = new app.models.OccurenceDataValue({"fk_taxon": -2, fk_rue:app.globals.currentrue.get('id'), "name_taxon" : "Non identifié"});
        obs.set('latitude',app.utils.geolocalisation.currentPosition.latitude );
        obs.set('longitude',app.utils.geolocalisation.currentPosition.longitude);
        var currentView = new app.views.AddSauvageOccurenceNonIdentifierView({model:obs});
        self.displayView(currentView);   
      }
      else{
        sauvages.notifications.gpsNotStart();
        self.goToLastPage();
      }
    },500);
    
  },
  viewFormPLOnbs : function() {
//    if (typeof(app.globals.currentrue) === 'undefined') {
//	    alert('Rue non initialisée');
//	    return false;
//    }
    var self = this;
    setTimeout(function() {
      app.utils.geolocalisation.getCurrentPosition();
      if (typeof(app.utils.geolocalisation.currentPosition) !== 'undefined') {
        var obs = new app.models.OccurenceDataValue({"fk_taxon": -1, fk_rue:app.globals.currentrue.get('id'), "name_taxon" : ""});
        obs.set('latitude',app.utils.geolocalisation.currentPosition.latitude );
        obs.set('longitude',app.utils.geolocalisation.currentPosition.longitude);
        var currentView = new app.views.AddSauvageOccurencePasDansListeView({model:obs});
        self.displayView(currentView);   
      }
      else{
        sauvages.notifications.gpsNotStart();
        self.goToLastPage();
      }
    },500);
    
  },
  
  viewFormAddParcours : function(state) {
		var self = this;
    if (typeof(app.utils.geolocalisation.currentPosition) !== 'undefined') {
      if (typeof( app.globals.currentrue) === 'undefined') {
	      //Get default street Name
	      //var nb= new app.dao.ParcoursDataValueDAO(app.db).getDefaultRueName().done(function(d) { 
		      //app.globals.currentrue = new app.models.ParcoursDataValue({name : d});
        app.globals.currentrue = new app.models.ParcoursDataValue();
		      var currentView = new app.views.AddSauvageRueView({model:app.globals.currentrue});
		      self.displayView(currentView);  
	     // });
      }
      else {
        var collObs = new app.models.OccurenceDataValuesCollection;
        collObs.fetch({
          success: function(data) {
            var currentView = new app.views.AddSauvageRueView({model:app.globals.currentrue, collection: data});
            self.displayView(currentView);
          }
        });
      }       
    }
    else{
      sauvages.notifications.gpsNotStart();
			this.goToLastPage();
    }
  },

  viewTableMyObs : function() {
    var self = this;
    console.log('viewTableMyObs');
    var myObsColl = new app.models.OccurenceDataValuesCollection();
    var mesRuesColl = new app.models.ParcoursDataValuesCollection();
    myObsColl.fetch({
      success: function(data) {
        mesRuesColl.fetch({
          success: function(parcours) {
            var currentView = new app.views.ObservationListView({collection: data, parcours : parcours});
            self.displayView(currentView);
          }
        });
      }
    });
   
  },
  _currentView: null,

  displayView: function (view) {
      if (this._currentView) {
        this._currentView.remove();
        this._currentView.off();
        $('.elem-right-header').empty();
      }
      this._currentView = view;
      $('#content').append(view.el);
      view.render();
  }

});
