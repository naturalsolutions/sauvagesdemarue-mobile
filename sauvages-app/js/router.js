"use strict";

// ----------------------------------------------- The Application Router ------------------------------------------ //

app.Router = Backbone.Router.extend({
  //currentProfil : app.models.ProfilsCollection,
  
  routes: {
   'identification' : 'viewIdentKey',
   '' : 'viewTaxonlist',
  },

  initialize: function() {

  },
  
  viewIdentKey : function(view) {
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
  
  viewTaxonlist : function(view) {
    console.log('viewTaxonlist');
    var self = this;
    var cListAllTaxons = new app.models.TaxonCollection();
    cListAllTaxons.fetch({
        success: function(data) {
         /*var currentView = new app.views.IdentificationKeyView({model: data});
          self.displayView(currentView);*/
          console.log(data);
        }
    }) 
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
