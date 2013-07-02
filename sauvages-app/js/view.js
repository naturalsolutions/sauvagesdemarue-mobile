"use strict";


// -------------------------------------------------- The Views ---------------------------------------------------- //

	
app.views.AddSauvageOccurenceView = app.utils.BaseView.extend({
  template: 'form-add-obs',

  initialize: function() {
    this.model.bind("reset", this.render, this);
  },
  
//TEST PHOTOS
  beforeRender: function() {
    this.insertView("#obs-form", new app.views.FormAddOccurenceView({initialData:this.model}));
  },
	
});

app.views.FormAddOccurenceView = NS.UI.Form.extend({
    initialize: function(options) {
      NS.UI.Form.prototype.initialize.apply(this, arguments);
      this.on('submit:valid', function(instance) {
				//Get value for hidden fields
				instance.set('datetime', new Date());
        instance.save().done( function(model, response, options) {
						sauvages.notifications.obsSaveSuccess();
          }
        );
      });
    },
				
		afterRender: function () {
			$('input:submit', this.$el).attr('value', sauvages.messages.save);
			$('input:reset', this.$el).attr('style', 'display:none');
			$('h3', this.$el).attr('style', 'display:none');
		},
		

});


app.views.AddSauvageRueView = app.utils.BaseView.extend({
  template: 'form-add-sauvagerue',
  
  initialize: function() {
    this.model.bind("reset", this.render, this);
		//app.globals.currentrue
  },

  beforeRender: function() {
		var self = this;
    this.insertView("#rue-form", new app.views.FormAddSauvageRue({initialData:this.model}));
		
  },
});
app.views.FormAddSauvageRue = NS.UI.Form.extend({

    initialize: function(options) {
      NS.UI.Form.prototype.initialize.apply(this, arguments);
			//Test if new instance
			this.isNew = this.instance.isNew();
			
			var self = this;
      this.on('submit:valid', function(instance) {
				//Get value for hidden fields
				var prefix = 'end_';
				if (self.isNew) prefix = 'begin_';
				app.utils.geolocalisation.getCurrentPosition();
				
				instance.set(prefix+'datetime', new Date());
				instance.set(prefix+'latitude',app.utils.geolocalisation.currentPosition.latitude );
				instance.set(prefix+'longitude',app.utils.geolocalisation.currentPosition.longitude);
			 
        instance.save().done( function(model, response, options) {
							//On refetch le model pour récupérer le PK
							instance.fetch({
								success: function(data) {
									if (!self.isNew) {
										delete app.globals.currentrue;
										sauvages.notifications.finParcours();
									}
									else {
										app.globals.currentrue =	data;
										app.route.navigate('taxonlist', {trigger: true});
									}
								}
						});
          }
        );
      });
    },
		
		afterRender: function () {
			if (this.isNew)  $('input:submit', this.$el).attr('value', sauvages.messages.begin_street);
			else $('input:submit', this.$el).attr('value', sauvages.messages.end_street);
			
			$('input:reset', this.$el).attr('style', 'display:none');
			$('h3', this.$el).attr('style', 'display:none');
		},

});
app.views.HomePageView=  app.utils.BaseView.extend({

  template: 'page-home',

});

app.views.IdentificationKeyView =  app.utils.BaseView.extend({

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

app.views.IdentificationKeyViewText =  app.utils.BaseView.extend({

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


app.views.IKCriteriaListItemViewText =  app.utils.BaseView.extend({

  template: 'items-list-criteria',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },

});
/********/




app.views.IKCriteriaListItemView =  app.utils.BaseView.extend({

  template: 'items-list-criteria-picto',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },

});

	
app.views.TaxonListView =  app.utils.BaseView.extend({

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

app.views.TaxonItemView =  app.utils.BaseView.extend({

  template: 'items-list-taxon',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },

});


app.views.TaxonDetailView=  app.utils.BaseView.extend({

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
						$('.flexslider').flexslider({
						   animation: "slide",  
						   slideshow: false,
							 touch: true,  

						   start: function(slider) {
						       $('.flexImages').show();
						   }
						});
						
            self.insertView("#criteria-list-container", new app.views.CriteriaValueTaxonView({model: data})).render();
          }
        });
    }, this);
   },
});

app.views.CriteriaValueTaxonView=  app.utils.BaseView.extend({

  template: 'items-list-taxondetail-criteria',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },
});

app.views.AlphabeticAnchorView =  app.utils.BaseView.extend({

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

/********/


	
app.views.ObservationListView =  app.utils.BaseView.extend({

  template: 'page-obs-list',
  
  initialize: function() {
    this.collection.bind("reset", this.render, this);
  },
  
  serialize: function() {
    if (this.collection) return {collection : this.collection};
    return true;
  },


});
