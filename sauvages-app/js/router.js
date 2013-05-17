"use strict";

// ----------------------------------------------- The Application Router ------------------------------------------ //

app.Router = Backbone.Router.extend({
  //currentProfil : app.models.ProfilsCollection,
  
  routes: {
   'identification' : 'viewIdentKey',
   'taxonlist' : 'viewTaxonlist',
   'taxondetail/:id' : 'viewTaxonDetail',
   '' : 'viewHomePage',
  },

  initialize: function() {
    app.globals.currentFilter = new Array();
    app.globals.currentFilterTaxonIdList = new Array();
    
  },
  viewHomePage: function() {
    var currentView = new app.views.HomePageView();
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
  
  viewTaxonlist : function() {
    console.log('viewTaxonlist');
    var taxons;
    if (app.globals.currentFilterTaxonIdList.length >0 ) {
      taxons  = new app.models.TaxonLiteCollection();
      taxons.models = app.globals.cListAllTaxons.multiValueWhere({'taxonId' :_.pluck(app.globals.currentFilterTaxonIdList, 'fk_taxon')}) ;
    }
    else {
        taxons = app.globals.cListAllTaxons;
    }
    var currentView = new app.views.TaxonListView({collection: taxons});
    this.displayView(currentView);
  },
  
  viewTaxonDetail : function(id) {
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
  
  displayView : function (view) {
    if (this._currentView) {
        this._currentView.remove();
        this._currentView.off();
    }
    this._currentView = view;
    // Render is asynchronous with LayoutManager
    view.render().done(function(view) {
        $('#content').append(view.el);
    });
  },

});
