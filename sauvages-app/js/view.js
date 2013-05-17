"use strict";

/*
* Base view: customize Backbone.Layout for remote template loading
*/

app.views.BaseView = Backbone.Layout.extend({
    prefix: app.config.root + '/tpl/',
    el: false, // LM will use template's root node

    fetch: function(path) {
        path += '.html';
        app.templates = app.templates || {};
        if (app.templates[path]) {
            return app.templates[path];
        }
        var done = this.async();
        $.get(path, function(contents) {
            done(app.templates[path] = _.template(contents));
        }, "text");
    },

    serialize: function() {
      if (this.model) return this.model.toJSON();
      return true;
    }
});

// -------------------------------------------------- The Views ---------------------------------------------------- //

	
app.views.HomePageView=  app.views.BaseView.extend({

  template: 'page-home',

});

app.views.IdentificationKeyView =  app.views.BaseView.extend({

  template: 'page-identification-key',
  
  initialize: function() {
    app.globals.currentFilter= new Array();
    this.collection.bind("reset", this.render, this);
  },
  
  events: {
    "click input[type=checkbox]": "filterTaxon"
  },

  beforeRender: function() {
    this.collection.each(function(criteria) {
      this.insertView("#values-list", new app.views.IKCriteriaListItemView({model: criteria}));
    }, this);
  },
  
  filterTaxon : function(event) {
    //if checked
    if ($(event.currentTarget).is(':checked') == true) {
      console.log($(event.currentTarget).val() );
      app.globals.currentFilter.push($(event.currentTarget).val() );
    }
    else { //if uncheked
      var index =  app.globals.currentFilter.indexOf($(event.currentTarget).val());
       app.globals.currentFilter.splice(index, 1);
    }
    //Select Taxon Id; for the moment exact matching (must contain all the selected criteria)
    app.utils.queryData.getFilterTaxonIdList(app.globals.currentFilter, true).done(
      function(data) {
       app.globals.currentFilterTaxonIdList =  data;
       //refresh front end
       $("#taxonNb").html(app.globals.currentFilterTaxonIdList.length);
       
      }
    );

  }
});

app.views.IKCriteriaListItemView =  app.views.BaseView.extend({

  template: 'items-list-criteria',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },

});

	
app.views.TaxonListView =  app.views.BaseView.extend({

  template: 'page-taxon-list',
  
  initialize: function() {
    this.collection.bind("reset", this.render, this);
  },

  beforeRender: function() {
    this.collection.each(function(taxon) {
      this.insertView("#values-list", new app.views.TaxonItemView({model: taxon}));
    }, this);
  }

});

app.views.TaxonItemView =  app.views.BaseView.extend({

  template: 'items-list-taxon',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },

});


app.views.TaxonDetailView=  app.views.BaseView.extend({

  template: 'page-taxon-detail',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },
  
  beforeRender: function() {
    console.log(this.model.get('caracValues').models); 
    var self = this;
    
    this.model.get('caracValues').each(function(model) {
      var criM = new app.models.CaracteristiqueDefValue({'criteraValueId' : model.get('fk_carac_value')});
        criM.fetch({
          success: function(data) {
            self.insertView("#criteria-list-container", new app.views.CriteriaValueTaxonView({model: data})).render();
          }
        });
    }, this);
   },
});

app.views.CriteriaValueTaxonView=  app.views.BaseView.extend({

  template: 'items-list-taxondetail-criteria',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },
});
