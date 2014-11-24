"use strict";

// ----------------------------------------------- The Application Router ------------------------------------------ //

app.Router = Backbone.Router.extend({

  routes: {
    'identification/:name' : 'viewIdentKeyFilter',
    'identification' : 'viewIdentKey',
    'taxonlist' : 'viewTaxonlist',
    'region' : 'viewRegions',
    'maregion/:name' : 'viewMaRegion',
    'taxonlist/:all' : 'viewTaxonlist',
    'taxonlistRegion/:region' : 'viewTaxonlistRegion',
    'taxondetail/:id/localisation/(:localisation)' : 'viewTaxonDetail',
    'addObs/:taxonId/localisation/(:localisation)' : 'viewFormAddObs',
    'detailObs/:id' : 'viewdetailObs',
    'addNonIdentifiee'  : 'viewFormNIOnbs',
    'addPasListe'  : 'viewFormPLOnbs',
    'addParcours(/:state)' : 'viewFormAddParcours',
    'myObservation' : 'viewTableMyObs',
    'ouSuisJe' : 'viewLocalisation',
    'credits' : 'viewCredits',
    'aide' : 'viewAide',
    'utilisateur' : 'viewUtilisateur' ,
    '' : 'viewHomePage'
  },

  initialize: function() {
    app.globals.positionScroll = 0;
    app.globals.currentFilter = new Array();
    app.globals.regiontaxon = new Array();
    app.globals.currentFilterTaxonIdList = new Array();
    app.globals.currentRueList = new app.models.ParcoursDataValuesCollection;
    app.globals.cListAllTaxonsRegion = new app.models.TaxonLiteCollection();
    app.globals.regionTaxonCaracValuesCollection = new app.models.TaxonCaracValuesCollection();

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
    var self = this;
    var onDataHandler = function(data, response, options) {
      $('body').css('background-color', '#28717E');
      if (data.get('aide') !== undefined) {
        $('#content').addClass('content-home');
        var FirstLoad = $('.loading-splash', document).hasClass( "loading-splash" );
        if (FirstLoad ) {
          $(".loading-splash").remove();
          $('#splash-screen').remove();
        }
        var currentView = new app.views.HomePageView();
        self.displayView(currentView);
      }else{
        app.route.navigate('aide',{trigger: true});
        var currentView = new app.views.AidePageView();
        self.displayView(currentView);
        self.applicationStateOnce = new app.models.Application(); 
        self.applicationStateOnce.set('aide', 1).save()
          .done( function(model, response, options) {})
          .fail(function(error){console.log(error)});
      };

    };
    var onErrorHandler = function(data, response, options) {
      alert(response.responseText);
    };
    this.applicationState = new app.models.Application({'id': 1}); 
    this.applicationState.fetch({ success : onDataHandler, error: onErrorHandler });
  },
  
  viewLocalisation: function() {
    var currentView = new app.views.LocalisationPageView();
    this.displayView(currentView);  
  },

  viewAide : function(){
    $('body').addClass('loading-slide opacite-null');
    var currentView = new app.views.AidePageView();
    this.displayView(currentView);
  },

  viewCredits: function() {
    var currentView = new app.views.CreditsPageView();
    this.displayView(currentView);  
  },

  viewUtilisateur: function() {
    var self = this;
    var onDataHandler = function(data, response, options) {
      if (data.get('email') !== undefined) {
				var recompenses = new app.models.RecompensesDataValuesCollection();
				recompenses.fetch({success: function(cRecompense) {
					var classement = new app.models.ClassementDataValuesCollection();
					classement.fetch({success: function(cClassement) {
						var currentView = new app.views.UtilisateurPageView({model : data, collection : cRecompense, classement : cClassement, uid : data.get('uid')});
						self.displayView(currentView);
					}})
					}
				});
      }else{
        var newUser = new app.models.User();
        var currentView = new app.views.UtilisateurPageView({model :newUser});
        self.displayView(currentView);
      }
    };
    var onErrorHandler = function(data, response, options) {
        console.log(response.responseText);
        alert(response.responseText);
    };
    this.currentUser = new app.models.User({'id': 1}); 
    this.currentUser.fetch({ success : onDataHandler, error: onErrorHandler });
  },

  viewRegions: function() {
    var msg = _.template(
             "<form role='form form-inline'>"+
               "<p>Cette option est disponible uniquement pour la région PACA. Utilisez la rubrique 'Je participe', pour reconnaître les plantes de ma rue partout en France. </p>"+				
                "<button type='submit'  class='btn btn-gris'>Annuler</button>"+
                "<button type='reset'  class='btn btn-jaune pull-right'>Poursuivre</button>"+
               "</form>"					
              );
    sauvages.notifications.infoRegion(msg());

    var currentView = new app.views.RegionPageView();
    this.displayView(currentView);  
  },
  
  viewMaRegion : function(name) {
    if (typeof app.globals.currentrue !== 'undefined' && app.globals.currentrue.get('name') !== undefined) {
      var msg = _.template(
               "<form role='form form-inline'>"+
                 "<p>Vous devez terminer votre rue pour accèder à cette partie de l'application.</p>"+				
                  "<button type='submit'  class='btn btn-jaune pull-right'>Terminer</button>"+
                  "<button type='reset'  class='btn btn-gris visibility-hidden'>Annuler</button>"+
                 "</form>"					
                );
      sauvages.notifications.SortieProtocol(msg());
    }
    var region;
    var taxonsPaca  = new app.models.TaxonLiteCollection();
    taxonsPaca.models = app.globals.cListAllTaxons.multiValueWhere({'commonName' : LISTE_PACA});
    app.globals.cListAllTaxonsRegion = taxonsPaca;

    //critères région
    //app.globals.regiontaxon = new app.models.CaracteristiqueDefValuesCollection();
    app.globals.regiontaxon = new Array();

    app.globals.cListAllTaxonsRegion.each(function(model){
      var id = model.get("taxonId");
      var taxon= new app.models.Taxon({"taxonId": id});
      taxon.fetch({
            success: function(data) { 
              data.get('caracValues').each(function(model) {
              app.globals.regionTaxonCaracValuesCollection  =  app.globals.regionTaxonCaracValuesCollection.add(model);
              var criM = new app.models.CaracteristiqueDefValue({'criteraValueId' : model.get('fk_carac_value')});
                criM.fetch({
                  success: function(dataCriM) {
                    var testDataCriM = $.inArray(dataCriM.get('criteraValueId'), app.globals.regiontaxon) > -1;
                    if (! testDataCriM) {
                     app.globals.regiontaxon.push(dataCriM.get('criteraValueId'));
                    }
                  }
                });
              },this);
            }
        });
    },this);
    var currentView = new app.views.MaRegionView({collection: app.globals.cListAllTaxonsRegion, region: name});
    this.displayView(currentView);
  },
  
  viewTaxonlistRegion : function(name) {
    var region;
    var taxons;
    if( app.globals.currentFilterTaxonIdList.length === 0 ){
      taxons = app.globals.cListAllTaxonsRegion;    
    }
    else {
      taxons  = new app.models.TaxonLiteCollection();
      taxons.models = app.globals.cListAllTaxonsRegion.multiValueWhere({'taxonId' :_.pluck(app.globals.currentFilterTaxonIdList, 'fk_taxon')}) ;
    }
    var currentView = new app.views.TaxonListView({collection: taxons, region: name});
    this.displayView(currentView);
  },

  viewIdentKey : function() {
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

  viewIdentKeyFilter : function(name) {
    var region = $.trim(name);
    var self = this;
    var cListAllCriterias = new app.models.CaracteristiqueDefsCollection();
    
    cListAllCriterias.fetch({
        success: function(data) {
          var currentView = new app.views.IdentificationKeyFilterView({collection: data, filtreRegion : app.globals.regiontaxon, region:name});
          self.displayView(currentView);
        }
    }) 
  },

  viewTaxonlist : function(all) {
    $('#content').append('<div class="loading cover-content"></div>');
    console.log('viewTaxonlist');
    var taxons;
    if( all || app.globals.currentFilterTaxonIdList.length === 0 ){
      taxons = app.globals.cListAllTaxons;    
    }
    else {
      taxons  = new app.models.TaxonLiteCollection();
      taxons.models = app.globals.cListAllTaxons.multiValueWhere({'taxonId' :_.pluck(app.globals.currentFilterTaxonIdList, 'fk_taxon')});
    }
    var currentView = new app.views.TaxonListView({collection: taxons});
    this.displayView(currentView);
  },
  
  viewTaxonDetail : function(id,localisation) {
    console.log('viewTaxonDetail');
    var self = this;
    var critereValeurtaxon = new app.models.CaracteristiqueDefValuesCollection();
    //Recupération des données du taxon
    var taxon= new app.models.Taxon({"taxonId": id});
    taxon.fetch({
          success: function(data) {
        //Recupération de tous les critères de la clé
           var cListAllCriterias = new app.models.CaracteristiqueDefsCollection();
           
           cListAllCriterias.fetch({
               success: function(critAll) {
                 var currentView = new app.views.TaxonDetailView({model: data, localisation:localisation, collection : critAll});
                 self.displayView(currentView);
               }
           }) 
          }
      });
   
  },

  viewdetailObs : function(id) {
    console.log('viewObsDetail');
    var self = this;
    //Recupération des données de l'obs
    var obs= new app.models.OccurenceDataValuesCollection({"id": id});
    obs.fetch({
      success: function(data) {
        var parcours = new app.models.ParcoursDataValuesCollection();
        parcours.fetch({success: function(dataParcours) {
          var currentParcours = dataParcours.findWhere({"id": data.models[0].get('fk_rue')});
          var currentView = new app.views.obsDetailView({collection: data, parcours : currentParcours});
          self.displayView(currentView);
        }
      });
      }       
    });
  },

  viewFormAddObs : function(taxonI,localisation) {
    var idCurrentRue = undefined;
    var self = this;
      var coords = app.models.pos.get('coords');
      if (coords) {
        var selectedTaxon = app.globals.cListAllTaxons.where({taxonId:parseInt(taxonI)});
        if (app.globals.currentrue !== undefined) {
          var idCurrentRue = app.globals.currentrue.get('id');
        }
        var obs = new app.models.OccurenceDataValue({"fk_taxon" : taxonI, fk_rue : idCurrentRue ,"name_taxon" : selectedTaxon[0].get('commonName'),"scientificName" : selectedTaxon[0].get('scientificName')});
  
        obs.set('latitude',coords.latitude );
        obs.set('longitude',coords.longitude);
        
        var currentView = new app.views.AddSauvageOccurenceView({model:obs, localisation : localisation});
        self.displayView(currentView);   
      }
      else{
        $('#content').addClass('content-home');
        sauvages.notifications.connection();
        self.goToLastPage();
      }
  },
  
  viewFormNIOnbs  : function() {
    var self = this;
    var coords = app.models.pos.get('coords');
				if (coords) {
        var obs = new app.models.OccurenceDataValue({fk_rue:app.globals.currentrue.get('id'), "name_taxon" : "inconnue"});
        obs.set('latitude',coords.latitude );
        obs.set('longitude',coords.longitude);
        var currentView = new app.views.AddSauvageOccurenceNonIdentifierView({model:obs});
        self.displayView(currentView);   
      }
      else{
        sauvages.notifications.connection();
        self.goToLastPage();
      }    
  },

  viewFormPLOnbs : function() {
    var self = this;
    var coords = app.models.pos.get('coords');
				if (coords) {
        var obs = new app.models.OccurenceDataValue({fk_rue:app.globals.currentrue.get('id'), "name_taxon" : ""});
        obs.set('latitude',coords.latitude );
        obs.set('longitude',coords.longitude);
        var currentView = new app.views.AddSauvageOccurencePasDansListeView({model:obs});
        self.displayView(currentView);   
      }
      else{
        sauvages.notifications.connection();
        self.goToLastPage();
      }
  },
  
  viewFormAddParcours : function(state) {
    var self = this; 
    //teste si il n'y a pas de rue en cours
    if (typeof( app.globals.currentrue) === 'undefined') {
      //Teste si il ya des données de géolocalisation
      var coords = app.models.pos.get('coords');
      if (coords) {
        var collParcours = new app.models.ParcoursDataValuesCollection();
        var collParcoursAll = collParcours.fetch({
          success: function(data) {
            var modelRueEncours = data.findWhere({'state': 0});
            if (modelRueEncours !== undefined) {
              app.globals.currentrue = modelRueEncours;
              var currentView = new app.views.AddSauvageRueView({model:modelRueEncours});
              self.displayView(currentView);  
            }else{
              app.globals.currentrue = new app.models.ParcoursDataValue();
              var currentView = new app.views.AddSauvageRueView({model:app.globals.currentrue});
              self.displayView(currentView);  
            }
          } 
        });
      }else{
        sauvages.notifications.gpsNotStart();
        self.goToLastPage();
      } 
    }else {
      var currentRueId = app.globals.currentrue.get('id');
      var collObs = new app.models.OccurenceDataValuesCollection;
        collObs.fetch({
            success: function(data) {
            var currentView = new app.views.AddSauvageRueView({model:app.globals.currentrue, collection: data});
            self.displayView(currentView);
          }
        });
    }
    //Supprime les filtres de la clé
    if (app.globals.currentFilter !== undefined) {
      app.globals.currentFilter.length = 0;
      app.globals.currentFilterTaxonIdList.length = 0;
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
