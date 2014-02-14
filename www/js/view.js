"use strict";


// -------------------------------------------------- The Views ---------------------------------------------------- //

	
app.views.AddSauvageOccurenceView = app.utils.BaseView.extend({
  template: 'form-add-obs',

  initialize: function() {
    this.model.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  beforeRender: function() {
    this.insertView("#obs-form", new app.views.FormAddOccurenceView({initialData:this.model}));
				$('h1.page-sub-title').replaceWith("<h1 class='page-sub-title'> Nouvelle observation : "+ this.model.get("name_taxon")+"</h1>");
  },
	
		events:{ 
		'click .annuler-enregistrement-obs': 'annulerTerminer'
  },
  annulerTerminer : function(evt){
				app.route.navigate('taxonlist/:all', {trigger: true});	
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
				$('.navbar').show();
    this.model.bind("reset", this.render, this);
    this.collection = options.collection;
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
		serialize: function() {
    if (this.collection) {
						return {collection:this.collection};
				};
		return true;
  },
		events:{ 
		'click .annuler-fin-saisie': 'annulerTerminer',
  },

		annulerTerminer : function(evt){
				app.route.navigate('taxonlist/:all', {trigger: true});	
		},

  beforeRender: function() {
    this.insertView("#rue-form", new app.views.FormAddSauvageRue({initialData:this.model}));
				if (typeof(this.collection) !== 'undefined') {
						this.insertView("#rue-obs", new app.views.ObsRueView({collection: this.collection }));
				}
				if (typeof(this.model) !== 'undefined') {
						$('.page-title').empty();
						$('.page-sub-title').empty();
						$('.page-title').append(this.model.get('name')+' - '+this.model.get('cote'));
						$('.page-sub-title').append('Ma rue en cours');
				}
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
														app.globals.currentrue =	data;
														app.route.navigate('identification', {trigger: true});
												}
										}
								});
      });
    });
  },
 
  afterRender: function () {
    if (this.isNew)  {
      $('input:submit', this.$el).attr('value', sauvages.messages.begin_street).addClass('btn-lg btn-success');
				}
    else{
      $('input:submit', this.$el).attr('value', sauvages.messages.end_street).addClass('btn-lg btn-danger');
      $('input:text', this.$el).addClass('disabled');
      $('select', this.$el).addClass('disabled');
     }
    $('input:reset', this.$el).attr('style', 'display:none');
    $('h3', this.$el).attr('style', 'display:none');
  }
});

app.views.ObsRueView=  app.utils.BaseView.extend({
  template: 'table-obs-rue',

  initialize: function() {
    this.collection.bind('reset', this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
  
 serialize: function() {
    return {collection:this.obsCurrentRue};
  },
  
  beforeRender: function(){
    this.obsCurrentRue = this.collection.where({fk_rue : app.globals.currentrue.get('id')});
				$('h1.page-sub-title').replaceWith("<h1 class='page-sub-title'>Mes Sauvages</h1>");
  }
  
});

app.views.HomePageView=  app.utils.BaseView.extend({

  template: 'page-home',

		initialize: function() { 		
    $('.navbar').hide();
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  }
});

//app.views.pageChoixOutils=  app.utils.BaseView.extend({
//
//  template: 'page-choix-outils',
//
//		initialize: function() {
//						app.utils.BaseView.prototype.initialize.apply(this, arguments);
//  },
//	
//		beforeRender : function(event) {
//										$('h1.page-sub-title').replaceWith("<h1 class='page-sub-title'>Choisissez votre outil</h1>");
//		}
//});

app.views.IdentificationKeyView =  app.utils.BaseView.extend({

  template: 'page-identification-key',
  
  initialize: function() { 		
    this.collection.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
  
  events: {
    "click input[type=checkbox]": "filterTaxon",
				"drag" : "dragTaxonList"
  },

  beforeRender: function() {
    this.collection.each(function(criteria) {
      this.insertView("#values-list", new app.views.IKCriteriaListItemView({model: criteria}));
    }, this);
				$('h1.page-sub-title').replaceWith("<h1 class='page-sub-title'>Assistant d'identification</h1>");
				$('.elem-right-header').append("<a href='#taxonlist/all' class='sprite-sauvages sprite-list-fond'></a><a href='#taxonlist' class='sprite-sauvages sprite-btn-resultat'><span id='taxonNb'>"+ app.globals.cListAllTaxons.length +"</span></a>");
				this.$el.hammer();
		},
		
		
		dragTaxonList : function(event){
				app.route.navigate('taxonlist', {trigger: true, replace: true});
    console.log("event gesture"+event.gesture);
				event.preventDefault();
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
				app.utils.BaseView.prototype.initialize.apply(this, arguments);

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
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  beforeRender: function() {
    var availableLetter  = _.uniq(_.map(this.collection.models, function(taxon){ return taxon.get("commonName").charAt(0).toUpperCase();  }));
    
    this.insertView("#aphabetic-list", new app.views.AlphabeticAnchorView({anchorBaseName : 'anchor-taxon-', activeBtn: availableLetter, navheight :  72}));
    
    this.collection.models = _.sortBy(this.collection.models, function(taxon){
      return taxon.get("commonName").toUpperCase(); 
    });
				if(app.globals.currentFilterTaxonIdList.length === 0){
						$('.page-block-sub-title em').remove();
						$('h1.page-sub-title').replaceWith("<h1 class='page-sub-title'>Liste des Sauvages</h1>");
				}else{
						$('.page-block-sub-title em').remove();
						$('h1.page-sub-title').replaceWith("<h1 class='page-sub-title'><b>"+ app.globals.currentFilterTaxonIdList.length + "</b> Résultat(s)</h1>");
				};	
				$('.elem-right-header').append("<a class='pull-right sprite-sauvages sprite-btn-assistant' href='#identification'></a>");
  },
  
  serialize: function() {
    if (this.collection) return {collection : this.collection};
    return true;
  },
		events: {
				"drag" : "dragIdentification"
  },
		dragIdentification : function(event){
				app.route.navigate('identification', {trigger: true, replace: true});
    console.log("event gesture"+event.gesture);
				event.preventDefault();
		
		}

});

app.views.TaxonDetailView=  app.utils.BaseView.extend({

  template: 'page-taxon-detail',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
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
    },this);
				$('h1.page-sub-title').replaceWith("<h1 class='page-sub-title'>"+ this.model.get('commonName')+"</h1><em>"+ this.model.get('scientificName')+"</em>");
				$('.elem-right-header').append("<a href='#taxonlist/all' class='pull-right sprite-sauvages sprite-list-fond'></a>");
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
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
});

app.views.AlphabeticAnchorView =  app.utils.BaseView.extend({

  template: 'subview-alphabetic-anchor',

  initialize: function() {
    this.anchorBaseName = this.options['anchorBaseName'];
    this.navheight = this.options['navheight'];
    this.activeBtn = this.options['activeBtn'];
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
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

app.views.ObservationListView =  app.utils.BaseView.extend({

  template: 'page-obs-list',
  
  initialize: function() {
				this.parcours = this.options.parcours;
    this.collection.bind("reset", this.render, this);
				this.parcours.bind("change", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
  
  serialize: function() {
    if (this.collection) return {collection : this.collection, parcours : this.parcours};
    return true;
  },
  
  events: {
    "click #tabObs a[href='#espece']": "tabObsespece",
    "click #tabObs a[href='#rue']": "tabObrue",
    'click #send-obs': 'sendObs',
				'click #submitEmail':'setEmail',
				'click .destroyObs':'destroyObs',
				'click .back-rue-en-cours':'backRueEnCours',
				'click .back-home' : 'backHome',
				'click div.panel-heading': 'changeIcon'
		},
  
  tabObsespece: function(event){
    $("#tabObs a[href='#espece']").tab('show');
  },
  tabObrue: function(event){
    $("#tabObs a[href='#rue']").tab('show');
  },
  
		changeIcon: function(event){
				$('#mesObsParRue').on('hide.bs.collapse', function () {
						$(this).children().children().children().children('.glyph-collpase').removeClass('glyphicon-minus');
						$(this).children().children().children().children('.glyph-collpase').addClass('glyphicon-plus');
				});
				$('#mesObsParRues').on('show.bs.collapse',  function () {
						$(this).children().children().children().children(".glyph-collpase").removeClass('glyphicon-plus');
						$(this).children().children().children().children(".glyph-collpase").addClass('glyphicon-minus');
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
												if (typeof(emailUser) !== 'undefined' && emailUser.length !== 0 ) {
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
																	"<form role='form form-inline'>"+
																		"<div class='form-group'>"+
																		"<p>Ajouter votre email, vous permettra de retrouver vos observations sur le site Sauvages de ma Rue.</p>"+
																		"<label for='InputEmail'>Adresse email</label>"+
																		"<input type='email' class='form-control' id='InputEmail' placeholder='Entrer votre email'>"+
																		"</div>"+
																		"<button type='submit' id='submitEmail' class='btn btn-primary'>Valider</button>"+
																	"</form>"					
																);
												sauvages.notifications.email(msg());
												$('.modal-footer').addClass("hide");
												//$('#modal-close').addClass("pull-left btn-primary").removeClass('btn-default');
												self.render();
												}
										}
				});
  },
		destroyObs : function(event){
						var self = this;
						var ctarget = $(event.currentTarget);
						var obsToDestroy = self.collection.findWhere({'id': parseInt(ctarget.context.id)});
						obsToDestroy.destroy({success: function(obs, idObs) {
								alert("Destruction de l'observation : " + idObs);
								self.render();
								$("#tabObs a[href='#rue']").tab('show');
								
								var obsFkRue = obs.get('fk_rue');
								var ObsWhereRueTarget = self.collection.where({'fk_rue' : parseInt(obsFkRue)})
								var nbObs = ObsWhereRueTarget.length;
								
								var parcoursObs = self.parcours.findWhere({'id' : parseInt(obsFkRue)});
								var parcoursState =	parcoursObs.get('state');
								if (parseInt(nbObs) === 0 && parcoursState !==  0) {
										parcoursObs.destroy({success: function(rue, results) {
												self.render();
												$("#tabObs a[href='#rue']").tab('show');
										}});
								}
						}
				});
		},
		backRueEnCours : function(event){
				app.globals.currentrue =	this.parcours.findWhere({'state': 0});
				app.route.navigate('taxonlist/:all', {trigger: true});
		},
		backHome : function(event){
				app.route.navigate('', {trigger: true});
		}
});
