"use strict";


// -------------------------------------------------- The Views ---------------------------------------------------- //

app.views.AddSauvageOccurenceNonIdentifierView = app.utils.BaseView.extend({
		  template: 'form-add-obs-non-identifie',

  initialize: function() {
				$('.footer-default').hide();
    this.model.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  beforeRender: function() {
    this.insertView("#obs-ni-form", new app.views.FormAddOccurenceNIView({initialData:this.model}));
				$('.page-title').replaceWith("<div class='page-title'> Nouvelle observation</div>");
  },
		
		remove : function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('.footer-default').show();		
		},
	
		events:{ 
		'click .annuler-enregistrement-obs': 'annulerTerminer'
  },
  annulerTerminer : function(evt){
				window.history.back();
        return false;
		},
});
app.views.FormAddOccurenceNIView = NS.UI.Form.extend({
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
						$('input:text', this.$el).attr('style', 'display:none');
      $('input:submit', this.$el).attr('value', sauvages.messages.save);
						$('input:reset', this.$el).replaceWith("<button class='btn btn-default btn-footer annuler-enregistrement-obs' >Annuler</button>");
      $('h3', this.$el).attr('style', 'display:none');
    },
		
});

app.views.AddSauvageOccurencePasDansListeView = app.utils.BaseView.extend({
		  template: 'form-add-obs-non-identifie',

  initialize: function() {
				$('.footer-default').hide();
    this.model.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  beforeRender: function() {
    this.insertView("#obs-pl-form", new app.views.FormAddOccurencePasDansListeView({initialData:this.model}));
				$('.page-title').replaceWith("<div class='page-title'>Espèce non répertoriée</div>");
  },
		
		remove : function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('.footer-default').show();		
		},
	
		events:{ 
		'click .annuler-enregistrement-obs': 'annulerTerminer'
  },
  annulerTerminer : function(evt){
			window.history.back();
        return false;
		},
});
app.views.FormAddOccurencePasDansListeView = NS.UI.Form.extend({
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
						$('input:reset', this.$el).replaceWith("<button class='btn btn-default btn-footer annuler-enregistrement-obs' >Annuler</button>");
      $('h3', this.$el).attr('style', 'display:none');
    },
		
});

app.views.AddSauvageOccurenceView = app.utils.BaseView.extend({
  template: 'form-add-obs',

  initialize: function() {
				$('.footer-default').hide();
    this.model.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  beforeRender: function() {
    this.insertView("#obs-form", new app.views.FormAddOccurenceView({initialData:this.model}));
				$('.page-title').replaceWith("<div class='page-title'> Nouvelle observation</div>");
  },
		
		remove : function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('.footer-default').show();		
		},
	
		events:{ 
		'click .annuler-enregistrement-obs': 'annulerTerminer'
  },
  annulerTerminer : function(evt){
						window.history.back();
        return false;	
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
						$('input:text', this.$el).addClass('disabled');
      $('input:submit', this.$el).attr('value', sauvages.messages.save);
						$('input:reset', this.$el).replaceWith("<button class='btn btn-default btn-footer annuler-enregistrement-obs' >Annuler</button>");
      //$('input:reset', this.$el).attr('style', 'display:none');
      $('h3', this.$el).attr('style', 'display:none');
    },
		
});

app.views.AddSauvageRueView = app.utils.BaseView.extend({
  template: 'form-add-sauvagerue',
  
  initialize: function(options) {
				$('#header').show();
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
		'click .annuler-retour': 'annulerParcours',
  },

		annulerTerminer : function(evt){
				window.history.back();
        return false;
		},
		annulerParcours : function(evt){
				window.history.back();
        return false;
		},

  beforeRender: function() {
    this.insertView("#rue-form", new app.views.FormAddSauvageRue({initialData:this.model}));
				if (typeof(this.collection) !== 'undefined') {
						this.insertView("#rue-obs", new app.views.ObsRueView({collection: this.collection }));
				}
				if (typeof(this.model) !== 'undefined') {
						$('.page-title').empty();
						$('.page-sub-title').empty();
						$('.page-title').append('Ma rue en cours');
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
      $('input:submit', this.$el).attr('value', sauvages.messages.begin_street);
						$('input:reset', this.$el).replaceWith("<button class='btn btn-footer btn-default annuler-retour' >Annuler</button>");
				}
    else{
      $('input:submit', this.$el).attr('value', sauvages.messages.end_street).removeClass('btn-primary').addClass('btn-danger');
      $('input:text', this.$el).addClass('disabled');
      $('select', this.$el).addClass('disabled');
						$('input:reset', this.$el).replaceWith("<button class='btn btn-footer btn-default annuler-fin-saisie' >Annuler</button>");
     }
    //$('input:reset', this.$el).attr('style', 'display:none');
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
				$('.page-title').replaceWith("<div class='page-title'>Fin de parcours</div>");
  }
  
});

app.views.HomePageView=  app.utils.BaseView.extend({

  template: 'page-home',

		initialize: function() {
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
		remove : function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('body').addClass('pad-bottom-top');
				$('.navbar').show();
				$('#header').removeClass('hide');
    $('#menu').removeClass('hide'); 
		},
		afterRender: function(){
    $('body').removeClass('pad-bottom-top');
				$('#header').addClass('hide');
    $('#menu').addClass('hide'); 
  }
});

app.views.FooterView=  app.utils.BaseView.extend({

  template: 'footer',

		initialize: function() {
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

});

app.views.IdentificationKeyView =  app.utils.BaseView.extend({

  template: 'page-identification-key',
  
  initialize: function() {
    this.collection.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
  
  events: {
    "click input[type=checkbox]": "filterTaxon",
				"dragleft" : "swipeTaxonList",
				"click #supprimer-filtre" : "suppFiltre"
  },
		
  beforeRender: function() {
				this.insertView("#wrapper-footer", new app.views.FooterView());
    this.collection.each(function(criteria) {
      this.insertView("#values-list", new app.views.IKCriteriaListItemView({model: criteria}));
    }, this);
				$('body').append("<div id='impressionContinue'></div>").addClass('cleliste cle');
				$('body.cleliste.cle').append("<div id='languette'><a href='#taxonlist'><span id='taxonNb'>"+ app.globals.cListAllTaxons.length +"</span></a></div>");
				$('.page-title').replaceWith("<div class='page-title'>Identification</div>");
				$('.elem-right-header').append("<button href='' class='btn btn-header btn-lg disabled'><span class='glyphicon glyphicon-question-sign'></span></button>");		
				this.$el.hammer();
		},
		afterRender: function(){
				$('.bottom-navbar .btn-group').append("<a class='btn btn-default btn-footer btn-footer-left' id='supprimer-filtre'>Supprimer les filtres</a>");
				$('.bottom-navbar .btn-group').append("<a class='btn btn-danger btn-footer btn-footer-right' href='#addParcours' role='button'>Fin de parcours</a>");
		},
		
		remove: function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				console.log('remove identification');
				$('.navbar-fixed-bottom .btn-group .btn-footer');
				$('body').removeClass('cleliste cle');
				$('#impressionContinue').remove();
    $('#languette').remove();
		},
		
		swipeTaxonList : function(event){

				
				app.route.navigate('taxonlist', {trigger: true, replace: true});
    console.log("event gesture"+event.gesture);
				event.gesture.preventDefault();
		},

  suppFiltre :function(event){
				app.globals.currentFilter.length = 0;
				app.globals.currentFilterTaxonIdList.length = 0;
				$("#taxonNb").html(app.globals.cListAllTaxons.length);
				$('.RadioCustom').removeClass('RadioCustomOn');
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
						app.globals.currentFilterTaxonIdList.length = 0;
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
				this.insertView("#wrapper-footer", new app.views.FooterView());
				$('body').append("<div id='impressionContinue'></div>").addClass('cleliste liste');
				
    var availableLetter  = _.uniq(_.map(this.collection.models, function(taxon){ return taxon.get("commonName").charAt(0).toUpperCase();  }));
    
    //this.insertView("#aphabetic-list", new app.views.AlphabeticAnchorView({anchorBaseName : 'anchor-taxon-', activeBtn: availableLetter, navheight :  72}));
    
    this.collection.models = _.sortBy(this.collection.models, function(taxon){
      return taxon.get("commonName").toUpperCase(); 
    });
				$('.page-block-title em').remove();
				if(app.globals.currentFilterTaxonIdList.length === 0){
						$('.page-title').replaceWith("<div class='page-title'>Liste des Sauvages</div>");
				}else{
						$('.page-title').replaceWith("<div class='page-title'><b>"+ app.globals.currentFilterTaxonIdList.length + "</b> Résultat(s)</div>");
				};	
  },
		afterRender: function(){
				$('.bottom-navbar .btn-group').append("<a class='btn btn-primary btn-footer btn-footer-left' href='#addNonIdentifiee' role='button'>Pas identifié</a>");
				$('.bottom-navbar .btn-group').append("<a class='btn btn-primary btn-footer btn-footer-right' href='#addPasListe''>Pas dans la liste</a>");
		},
  serialize: function() {
    if (this.collection) return {collection : this.collection};
    return true;
  },
		remove: function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				console.log('remove liste');
				$('body').removeClass('cleliste liste');
				$('#impressionContinue').remove();
    $('#languette').remove();
		},
		events: {
				"dragright" : "swipeIdentification"
  },
		swipeIdentification : function(event){
				app.route.navigate('identification', {trigger: true, replace: true});
    console.log("event gesture"+event.gesture);
				event.gesture.preventDefault;
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
				this.insertView("#wrapper-footer", new app.views.FooterView());
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
				$('.page-title').replaceWith("<div class='page-title'>"+ this.model.get('commonName')+"</div><em>"+ this.model.get('scientificName')+"</em>");
  },
		
		afterRender: function(){
				$('.bottom-navbar .btn-group').append("<a class='btn btn-default btn-footer btn-footer-left' href='#taxonlist' role='button'>Retour aux résultats</a>");
				$('.bottom-navbar .btn-group').append("<a class='btn btn-primary btn-footer btn-footer-right' href='#addObs/"+ this.model.get('taxonId') +"' role='button'>Ajouter une obs</a>");
		},
		
		remove: function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				console.log('remove détail taxon')
				$('.page-block-title em').remove();
				$('.navbar-fixed-bottom .btn-group .btn-footer').remove();
		},
		
//   events: {
//      'click div.accordion-heading': 'changeIcon',
//    },
//      
//    changeIcon: function(event){
//      $('.accordion-group').on('hide.bs.collapse', function () {
//				$(this).children().children().children(".glyphicon").removeClass('glyphicon-minus');
//				$(this).children().children().children(".glyphicon").addClass('glyphicon-plus');
//      });
//      $('.accordion-group').on('show.bs.collapse', function () {
//				$(this).children().children().children(".glyphicon").removeClass('glyphicon-plus');
//				$(this).children().children().children(".glyphicon").addClass('glyphicon-minus');
//      });
//    },
});

app.views.CriteriaValueTaxonView=  app.utils.BaseView.extend({

  template: 'items-list-taxondetail-criteria',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
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
		beforeRender: function(){
				$('.page-title').replaceWith("<div class='page-title'>Mes sauvages</div>");
				this.insertView("#wrapper-footer", new app.views.FooterView());
		},

		afterRender: function(){
				var rueEnCours = this.parcours.findWhere({'state': 0});
				var rueAPartager = this.parcours.findWhere({'state': 1});
				$('.bottom-navbar .btn-group').append("<button id='send-obs' type='button' class='btn btn-footer btn-warning'>Partager</button>");
				if(typeof(rueAPartager) === 'undefined'){$('#send-obs').addClass('disabled')};
				if(typeof(rueEnCours) !== 'undefined'){
						$('.bottom-navbar .btn-group').append("<button  type='button' class='btn btn-footer btn-default back-rue-en-cours'>Retour à la saisie</button>");
				}else{
						$('.bottom-navbar .btn-group').append("<button type='button' class='btn btn-footer btn-primary back-home'>Nouvelle rue</button>");
				}
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
				app.route.navigate('identification', {trigger: true});
		},
		backHome : function(event){
				app.route.navigate('', {trigger: true});
		}
});
