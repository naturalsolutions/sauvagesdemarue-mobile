"use strict";

// ----------------------------------------------- The Application Router ------------------------------------------ //

app.Router = Backbone.Router.extend({

  routes: {
    'identification' : 'viewIdentKey',
    'taxonlist' : 'viewTaxonlist',
    'region' : 'viewRegions',
    'maregion/:nom' : 'viewMaRegion',
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

    $(window).on("hashchange", app.Router.hashChange); // this will run before backbone's route handler
    $(window).on("beforeunload", app.Router.beforeUnload);


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

    
  // add the following function to your router
  // for any view that may have a dirty condition, set a property named dirty to true, and if the user navigates away, a confirmation dialog will show
  hashChange : function(evt) {
   if(this.cancelNavigate) { // cancel out if just reverting the URL
    evt.stopImmediatePropagation();
    this.cancelNavigate = false;
    return;
   }
   if(this.view && this.view.dirty) {
    var dialog = confirm("You have unsaved changes. To stay on the page, press cancel. To discard changes and leave the page, press OK");
    if(dialog == true)
     return;
    else {
     evt.stopImmediatePropagation();
     this.cancelNavigate = true;
     window.location.href = evt.originalEvent.oldURL;
    }
   }
  },

  beforeUnload : function() {
   if(this.view && this.view.dirty)
    return "You have unsaved changes. If you leave or reload this page, your changes will be lost.";
  },
	
  goToLastPage: function() {
    window.history.back();
    return false;
  },
	
  viewHomePage: function() {
    var self= this;
    if ($(".loading-splash").length !== 0) {
      setTimeout(function() {
        $(".loading-splash").remove();
        $('#splash-screen').remove();
        var currentView = new app.views.HomePageView();
        self.displayView(currentView);
      }, 2000);
    }else{
      var currentView = new app.views.HomePageView({dirty : true});
      self.displayView(currentView);
    }   
  },

  viewRegions: function() {
      var currentView = new app.views.RegionPageView();
      this.displayView(currentView);  
  },
  
  viewMaRegion : function(name) {
    var self = this;
    var taxonsPaca  = new app.models.TaxonLiteCollection();
    taxonsPaca.models = app.globals.cListAllTaxons.multiValueWhere({'commonName' : LISTE_PACA});
    console.log(taxonsPaca);
  //  var currentView = new app.views.maRegionView({collection: taxonPaca});
  //  self.displayView(currentView);

  },

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
        var obs = new app.models.OccurenceDataValueNoRequired({"fk_taxon": taxonI, fk_rue:app.globals.currentrue.get('id'), "name_taxon" : selectedTaxon[0].get('commonName')});

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
        app.globals.currentrue = new app.models.ParcoursDataValue();
		      var currentView = new app.views.AddSauvageRueView({model:app.globals.currentrue});
		      self.displayView(currentView);  
      }
      else {
        var currentRueId = app.globals.currentrue.get('id');
        var collObs = new app.models.OccurenceDataValuesCollection;
       // var currentCollObs = collObs.findWhere({'fk_rue' : parseInt(currentRueId) })
       // if (typeof(currentCollObs) !== "undefined") {
            collObs.fetch({
              success: function(data) {
              var currentView = new app.views.AddSauvageRueView({model:app.globals.currentrue, collection: data});
              self.displayView(currentView);
            }
          });
        //}
      }
     // var currentView = new app.views.AddSauvageRueView({model:app.globals.currentrue});
      //self.displayView(currentView); 
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
        //this._currentView.transitionOut();
        this._currentView.remove();
        this._currentView.off();
        $('.elem-right-header').empty();
      }
      //view.render({ page: true });     
      //view.transitionIn();
      //$('.page').addClass('transition-none');
      this._currentView = view;
      $('#content').append(view.el);
      view.render();
  },


});
