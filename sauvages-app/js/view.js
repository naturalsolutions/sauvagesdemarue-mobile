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
			 console.log(data);
       //refresh front end
       $("#taxonNb").html(app.globals.currentFilterTaxonIdList.length);
       
      }
    );
  }
});

/*****démo clé texte****/

app.views.IdentificationKeyViewText =  app.views.BaseView.extend({

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
      this.insertView("#values-list", new app.views.IKCriteriaListItemViewText({model: criteria}));
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
			 console.log(data);
       //refresh front end
       $("#taxonNb").html(app.globals.currentFilterTaxonIdList.length);
       
      }
    );

  }
});


app.views.IKCriteriaListItemViewText =  app.views.BaseView.extend({

  template: 'items-list-criteria',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },

});
/********/




app.views.IKCriteriaListItemView =  app.views.BaseView.extend({

  template: 'items-list-criteria-picto',

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
    var availableLetter  = _.uniq(_.map(this.collection.models, function(taxon){ return taxon.get("commonName").charAt(0).toUpperCase();  }));
    
    this.insertView("#aphabetic-list", new app.views.AlphabeticAnchorView({anchorBaseName : 'anchor-taxon-', activeBtn: availableLetter, navheight :  60}));
    
    this.collection.models = _.sortBy(this.collection.models, function(taxon){
      return taxon.get("commonName").toUpperCase(); 
    });
    
  },
  
  serialize: function() {
    if (this.collection) return {collection : this.collection};
    return true;
  },


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
		//$(".flexslider").addClass('loading');
    var self = this;
    self.model.get('caracValues').each(function(model) {
      var criM = new app.models.CaracteristiqueDefValue({'criteraValueId' : model.get('fk_carac_value')});
			
        criM.fetch({
          success: function(data) {
						
					var target_flexslider = $('.flexslider');
       target_flexslider.flexslider({
           animation: "slide",  
           slideshow: false,
           controlsContainer: ".slider",

           start: function(slider) {
               target_flexslider.removeClass('loading');
           }
						});
						
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

app.views.AlphabeticAnchorView =  app.views.BaseView.extend({

  template: 'subview-alphabetic-anchor',

  initialize: function() {
    this.anchorBaseName = this.options['anchorBaseName'];
    this.navheight = this.options['navheight'];
    this.activeBtn = this.options['activeBtn'];
  },

  events: {
    "click input[type=button].internal-anchor": "goToAnchor"  
  },

  afterRender:function() {
    var self = this;
    $(this.el).find('.internal-anchor').attr('disabled','disabled');
    _.each(this.activeBtn,function(l){ 
      $(self.el).find('#anc-'+l).removeAttr('disabled');
    });
  },
  
  goToAnchor : function(event){
    var el = $(event.currentTarget).attr('value');
    var elWrapped = $('#'+this.anchorBaseName+el);
    if (elWrapped.length !== 0) {
      var totalScroll = elWrapped.offset().top-this.navheight;
      $("html,body").animate({ scrollTop: totalScroll }, "slow");
    }
  },

});
