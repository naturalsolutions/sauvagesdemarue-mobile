"use strict";


// -------------------------------------------------- The Views ---------------------------------------------------- //

	
app.views.AddSauvageOccurenceView = app.utils.BaseView.extend({
  template: 'form-add-obs',

  initialize: function() {
    this.model.bind("reset", this.render, this);
  },

  beforeRender: function() {
    this.insertView("#obs-form", new app.views.FormAddOccurenceView({initialData:this.model}));
  },
  
	
});

app.views.FormAddOccurenceView = NS.UI.Form.extend({
    initialize: function(options) {
      NS.UI.Form.prototype.initialize.apply(this, arguments);
      this.on('submit:valid', function(instance) {
	//Get value for hidden fields
	instance.set('datetime', new Date().format("yyyy-MM-dd h:mm:ss"));
        instance.save().done( function(model, response, options) {
          sauvages.notifications.obsSaveSuccess();
        });
      });
    },
    afterRender: function () {
      $('input:submit', this.$el).attr('value', sauvages.messages.save);
      $('input:submit', this.$el).addClass('btn-lg btn-success');
      $('input:reset', this.$el).attr('style', 'display:none');
      $('h3', this.$el).attr('style', 'display:none');
    },

});


app.views.AddSauvageRueView = app.utils.BaseView.extend({
  template: 'form-add-sauvagerue',
  
  initialize: function(options) {
    this.model.bind("reset", this.render, this);
    this.collection = options.collection; 
  },

  beforeRender: function() {
    var self = this;
    this.insertView("#rue-form", new app.views.FormAddSauvageRue({initialData:this.model, collection: this.collection}));
		
  },
});
app.views.FormAddSauvageRue = NS.UI.Form.extend({

  initialize: function(options) {
    NS.UI.Form.prototype.initialize.apply(this, arguments);
      //Test if new instance
      this.isNew = this.instance.isNew();
      this.collection = options.collection;
      
      var self = this;
						this.on('submit:valid', function(instance) {
      //Get value for hidden fields
      var prefix = 'end_';
      if (self.isNew) prefix = 'begin_';
      app.utils.geolocalisation.getCurrentPosition();
      
      instance.set(prefix+'datetime', new Date().format("yyyy-MM-dd h:mm:ss"));
      instance.set(prefix+'latitude',app.utils.geolocalisation.currentPosition.latitude );
      instance.set(prefix+'longitude',app.utils.geolocalisation.currentPosition.longitude);
		       
      instance.save().done( function(model, response, options) {
								//On refetch le model pour récupérer le PK
								instance.fetch({
										success: function(data) {
												if (!self.isNew) {
														// TODO enlever les globales
														delete app.globals.currentrue;
														data.set('state',1).save();
														sauvages.notifications.finParcours();
												}
												else {
														// TODO enlever les globales
														app.globals.currentrue =	data;
														app.route.navigate('taxonlist/:all', {trigger: true});
												}
										}
								});
      });
    });
  },
	      
  afterRender: function () {
    if (this.isNew)  {
      $('input:submit', this.$el).attr('value', sauvages.messages.begin_street).addClass('btn-lg btn-success');}
    else{
      $('input:submit', this.$el).attr('value', sauvages.messages.end_street).addClass('btn-lg btn-danger');
      $('input:text', this.$el).addClass('disabled');
      $('select', this.$el).addClass('disabled');    
     }
    $('input:reset', this.$el).attr('style', 'display:none');
    $('h3', this.$el).attr('style', 'display:none');
  },
  beforeRender: function(){
    if (this.collection) {
      this.insertView("#rue-obs", new app.views.ObsRueView({collection: this.collection }));
    }
  }
});

app.views.ObsRueView=  app.utils.BaseView.extend({

  template: 'table-obs-rue',

  initialize: function() {
    this.collection.bind('reset', this.render, this);
  },
  
  events:{
  },
  
  serialize: function() {
    return {collection:this.obsCurrentRue};
  },
  
  beforeRender: function(){
    this.obsCurrentRue = this.collection.where({fk_rue : app.globals.currentrue.get('id')});   
  }
  
});
app.views.HomePageView=  app.utils.BaseView.extend({

  template: 'page-home',

});

app.views.IdentificationKeyView =  app.utils.BaseView.extend({

  template: 'page-identification-key',
  
  initialize: function() { 		
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
    var objCurrentTarget=$(event.currentTarget);
    var idCurrentTarget= objCurrentTarget['context']['id'];
    //if checked
    if ($(event.currentTarget).is(':checked') == true) {
      //test if a value has a class RadioCustomOn
      var criteriaValueChecked = $(event.currentTarget).parent().parent().parent().find("span").hasClass('RadioCustomOn');
      if (criteriaValueChecked == true) {
        var objcriteriaValueChecked = $(event.currentTarget).parent().parent().parent().children().children(".RadioCustomOn");
        var valuecriteriaValueChecked = objcriteriaValueChecked.children('input').attr('value');
        var idcriteriaValueChecked = objcriteriaValueChecked.children('input').attr('id');
        $('input[name="'+idcriteriaValueChecked+'"]').prop('checked', false).parent().removeClass("RadioCustomOn");
        //remove the old value of the variable app.globals.currentFilter
        var index =  app.globals.currentFilter.indexOf(valuecriteriaValueChecked);
        if (index> -1) {
         var newAppglogal = app.globals.currentFilter.splice(index, 1);
        }
      }
      // add the class radioCustomOn to currentTarget
      $('input[name="'+idCurrentTarget+'"]').prop('checked', true).parent().addClass("RadioCustomOn");
      //add the currentTarget to the variable app.globals.currentFilter
      app.globals.currentFilter.push($(event.currentTarget).val());
    }
    else { //if uncheked
      $('input[name="'+idCurrentTarget+'"]').prop('checked', false).parent().removeClass("RadioCustomOn");
      var index =  app.globals.currentFilter.indexOf($(event.currentTarget).val());
       app.globals.currentFilter.splice(index, 1);
    }
    //Select Taxon Id; for the moment exact matching (must contain all the selected criteria)
    if (app.globals.currentFilter.length > 0) {
      app.utils.queryData.getFilterTaxonIdList(app.globals.currentFilter, true).done(
        function(data) {
          app.globals.currentFilterTaxonIdList =  data;
          //refresh front end
          $("#taxonNb").html(app.globals.currentFilterTaxonIdList.length);
        }
      );
    }
    else{
      $("#taxonNb").html(app.globals.cListAllTaxons.length);
    }
  }
});



app.views.IKCriteriaListItemView =  app.utils.BaseView.extend({

  template: 'items-list-criteria-picto',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },
		events: {
    "click .help": "helpShow"
  },
  afterRender:function() {
   if (app.globals.currentFilter.length > 0) { 
      _.each(app.globals.currentFilter,function(l){ 
								var currentInput = 'defCaracValue-'+l ;
								$('input[name="'+currentInput+'"]').prop('checked', true).parent().addClass("RadioCustomOn");
								$("#taxonNb").html(app.globals.currentFilterTaxonIdList.length);
      });
    }
  },
	helpShow :function(){
		var self=this;
		var criteriaName = capitaliseFirstLetter(self.model.get('name'));
		var msg = _.template(
								"<div class='helpKeyDiv'>"+
									'<p><%= data.criteriaDescription %></p> '+
									'<ul><% _.each(data.criteriaValues,function(criteriaValueItem,i){%>'+
										"<li><img src='./data/images/pictos/<%= criteriaValueItem.get('picture')%>'/><p><%= criteriaValueItem.get('name') %><p></li>"+
									'<% }); %></ul>'+
								'</div>'					
							);
		sauvages.notifications.helpKey(criteriaName,msg({criteriaName : criteriaName,criteriaDescription:this.model.get('description'), criteriaValues: this.model.get('defCaracValues').models}));
	}
});

	
app.views.TaxonListView =  app.utils.BaseView.extend({

  template: 'page-taxon-list',
  
  initialize: function() {
    this.collection.bind("reset", this.render, this);
  },

  beforeRender: function() {
    var availableLetter  = _.uniq(_.map(this.collection.models, function(taxon){ return taxon.get("commonName").charAt(0).toUpperCase();  }));
    
    this.insertView("#aphabetic-list", new app.views.AlphabeticAnchorView({anchorBaseName : 'anchor-taxon-', activeBtn: availableLetter, navheight :  72}));
    
    this.collection.models = _.sortBy(this.collection.models, function(taxon){
      return taxon.get("commonName").toUpperCase(); 
    });
    
  },
  
  serialize: function() {
    if (this.collection) return {collection : this.collection};
    return true;
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
   events: {
        'click div.accordion-heading': 'changeIcon',
    },
      
    changeIcon: function(event){
      $('.accordion-group').on('hide.bs.collapse', function () {
				$(this).children().children().children(".glyphicon").removeClass('glyphicon-minus');
				$(this).children().children().children(".glyphicon").addClass('glyphicon-plus');
      });
      $('.accordion-group').on('show.bs.collapse', function () {
				$(this).children().children().children(".glyphicon").removeClass('glyphicon-plus');
				$(this).children().children().children(".glyphicon").addClass('glyphicon-minus');
      });
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
				this.parcours = this.options.parcours;
    this.collection.bind("reset", this.render, this);
				this.parcours.bind("change", this.render, this);
  },
  
  serialize: function() {
    if (this.collection) return {collection : this.collection, parcours : this.parcours};
    return true;
  },
  
  events: {
    "click #tabObs a[href='#espece']": "tabObsespece",
    "click #tabObs a[href='#rue']": "tabObrue",
    'click div.accordion-heading': 'changeIcon',
    'click #send-obs': 'sendObs',
				'click #submitEmail':'setEmail',
				'click .destroyObs':'destroyObs'
  },
  
  tabObsespece: function(event){
    $("#tabObs a[href='#espece']").tab('show');
  },
  tabObrue: function(event){
    $("#tabObs a[href='#rue']").tab('show');
  },
  
  changeIcon: function(event){
    $('.accordion-group').on('hide.bs.collapse', function () {
      $(this).children().children().children(".glyph-collpase").removeClass('glyphicon-minus');
      $(this).children().children().children(".glyph-collpase").addClass('glyphicon-plus');
    });
    $('.accordion-group').on('show.bs.collapse', function () {
      $(this).children().children().children(".glyph-collpase").removeClass('glyphicon-plus');
      $(this).children().children().children(".glyph-collpase").addClass('glyphicon-minus');
    });
  },
  
  sendObs: function (event) {
    //Get current Obs
    var obsTosend ;
    var self = this;
				var currentUser = new app.models.User({'userId': 1});
				currentUser.fetch({
          success: function(data) {
            var emailUser = data.get('email'); 
												if (typeof(emailUser) !== 'undefined') {
														var dfd = $.Deferred();
														//var collectionRueFinie = parcours;

														app.utils.queryData.getObservationsTelaWSFormated()
																.done(
																		function(data) {
																				console.log(data);
																				if (data.length !== 0 ) {
																						//Send to tela via cel ws
																						var wstela = new NS.WSTelaAPIClient(SERVICE_SAISIE_URL, TAG_IMG, TAG_OBS, TAG_PROJET);
																						wstela.sendSauvageObservation(data, self.collection, self.parcours).done(function() { 
																								self.render();
																								//@TODO trouver mieux !!
																								$("#tabObs a[href='#rue']").tab('show');
																								$('#dataloader-img').remove();
																								$("body").find("a,button").removeClass("disabled");	
																						});
																				}else{
																						alert("Il n'y a pas d'observations à envoyer.");		
																				}		
																		}
																)
																.fail(function(msg) {
																		console.log(msg);
																});
												}
												else{
												var msg = _.template(
																	"<form role='form'>"+
																		"<div class='form-group'>"+
																		" <label for='InputEmail'>Adresse email</label>"+
																		"<input type='email' class='form-control' id='InputEmail' placeholder='Enter email'>"+
																		"<button type='submit' id='submitEmail' class='btn btn-default'>Valider</button>"+
																		"</div>"+
																	"</form>"					
																);
												sauvages.notifications.email(msg());
												self.render();
												}
										}
				});
  },
		destroyObs : function(event){
						var self = this;
						var ctarget = $(event.currentTarget);
						var obsToDestroy = self.collection.findWhere({'id': parseInt(ctarget.context.id)});
						obsToDestroy.destroy({success: function(obs, results) {
								alert("identifiant destruction obs" + results);
								self.render();
								$("#tabObs a[href='#rue']").tab('show');
								var nbObs = self.collection.length;
								var obsFkRue = obs.get('fk_rue');
								var parcoursObs = self.parcours.findWhere({'id' : parseInt(obsFkRue)});
								var parcoursState =	parcoursObs.get('state');
								if (parseInt(nbObs) <= 0 && parcoursState !==  0) {
										parcoursObs.destroy({success: function(rue, results) {
												self.render();
												$("#tabObs a[href='#rue']").tab('show');
										}});
								}
						}
				});
		}
});
