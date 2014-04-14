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
		  //this.model.set('identified', false);
			//	this.model.constructor.schema.photo.validators = [new NS.UI.Form.validators.PictureConditional(this.model)];
    this.insertView("#obs-ni-form", new app.views.FormAddOccurenceNIView({initialData:this.model}));
				$('.page-title').replaceWith("<div class='page-title'>Sauvage non identifiée</div>");
  },
		
		remove : function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('.footer-default').show();		
		},
	
		events:{ 
				'click .annuler-enregistrement-obs': 'annulerTerminer',
				'click .btn-footer-right' : 'verifPhoto'
  },

		verifPhoto : function(e){
				var val = $('.editor-picture-img',this.$el).attr('src');
				if (val === '') {
						$('.img-preview').siblings('.help-inline').html('La photo est obligatoire.').addClass('error');
						return false;
				}
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
								instance.set('regionPaca', 0);
        instance.save()
										.done( function(model, response, options) {
											app.globals.currentFilter.length = 0;
											app.globals.currentFilterTaxonIdList.length = 0;
										 sauvages.notifications.obsSaveSuccess();
										})
										.fail(function(error){console.log(error)})
						;
      });
    },
    afterRender: function () {
						$('textarea',this.$el).focus();
						$('.input-text', this.$el).attr('style', 'display:none');
						$('.select .glyphicon',this.$el).replaceWith("<span class='glyphicon glyphicon-globe'></span> ");
      $('input:submit', this.$el).attr('value', sauvages.messages.save);
						$('input:reset', this.$el).replaceWith("<button class='btn btn-default btn-footer annuler-enregistrement-obs' type='button'>Retour aux résultats</button>");
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
				$('.page-title').replaceWith("<div class='page-title'>Sauvage non répertoriée</div>");
  },
		
		remove : function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('.footer-default').show();		
		},
	
		events:{ 
				'click .annuler-enregistrement-obs': 'annulerTerminer',
				'click .btn-footer-right' : 'verifPhoto'
  },

		verifPhoto : function(e){
				var val = $('.editor-picture-img',this.$el).attr('src');
				if (val === '') {
						$('.img-preview').siblings('.help-inline').html('La photo de la plante est obligatoire.').addClass('error');
						return false;
				}
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
								instance.set('regionPaca', 0);
        instance.save()
										.done( function(model, response, options) {
												app.globals.currentFilter.length = 0;
											app.globals.currentFilterTaxonIdList.length = 0;
												sauvages.notifications.obsSaveSuccess();
												})
										.fail(function(error){console.log(error)})
								;
      });
    },
    afterRender: function () {
      $('input:submit', this.$el).attr('value', sauvages.messages.save);
						$('input:reset', this.$el).replaceWith("<button class='btn btn-default btn-footer annuler-enregistrement-obs' type='button' >Retour aux résultats</button>");
						$('.input-text .glyphicon',this.$el).replaceWith("<span class='icon-fleurgrasse-sauvages'></span> ");
						$('.select .glyphicon',this.$el).replaceWith("<span class='glyphicon glyphicon-home'></span> ");
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
				this.insertView("#obs-form", new app.views.FormAddOccurenceView({initialData:this.model, localisation : this.options.localisation}));
				if (this.options.localisation !== null ) {
						$('.select').hide(); 
				}
				$('.page-title').replaceWith("<div class='page-title'> Nouvelle Sauvage</div>");
  },
		afterRender: function() {
						if (this.options.localisation !== null ) {
								$('.select').hide(); 
						}
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
								if (this.options.localisation === "Provence-Alpes-Cotes-Azur") {
										instance.set('regionPaca', 1);
								}else{
										instance.set('regionPaca', 0);
								}
								var self = this;
        instance.save()
										.done( function(model, response, options) {
												app.globals.currentFilter.length = 0;
												app.globals.currentFilterTaxonIdList.length = 0;
												sauvages.notifications.obsSaveSuccess(self.options.localisation);
										})
										.fail(function(error){console.log(error)})
										;
      });
    },
    afterRender: function () {
						$('input:text', this.$el).addClass('disabled');
      $('input:submit', this.$el).attr('value', sauvages.messages.save);
						$('input:reset', this.$el).replaceWith("<button class='btn btn-default btn-footer annuler-enregistrement-obs' type='button'>Retour aux résultats</button>");
						$('.input-text .glyphicon',this.$el).replaceWith("<span class='icon-fleurgrasse-sauvages'></span> ");
						$('.select .glyphicon',this.$el).replaceWith("<span class='glyphicon glyphicon-globe'></span> ");
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
			app.route.navigate('identification', {trigger: true});
				return false;
		},
		annulerParcours : function(evt){
				delete app.globals.currentrue;
				app.route.navigate('', {trigger: true});
				return false;
		},

  beforeRender: function() {
				$('.icone-page-title').hide();
    this.insertView("#rue-form", new app.views.FormAddSauvageRue({initialData:this.model}));
				
				if (typeof(this.collection) !== 'undefined') {
						var currentCollObs = this.collection.findWhere({'fk_rue' : parseInt(this.model.get('id')) });
						if (this.collection.length !== 0 && typeof(currentCollObs) !== 'undefined') {
								this.insertView("#rue-obs", new app.views.ObsRueView({collection: this.collection }));
						}
				}
				if (typeof(this.model.get('name')) === 'undefined') {
						$('.page-title').replaceWith("<div class='page-title'>J'enregistre ma rue</div>");
						$('.page-sub-title').empty();
						$('.page-sub-title').append('Ma nouvelle rue');
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
												//fin de parcours
												if (!self.isNew) {
														// TODO enlever les globales
														delete app.globals.currentrue;
														data.set('state',1).save();
														app.globals.currentFilter.length = 0;
														app.globals.currentFilterTaxonIdList.length = 0;
														$('.page-sub-title').empty();
														sauvages.notifications.finParcours();				
												}
												//nouvelle rue
												else {
														data.set('state',0).save();
														app.globals.currentrue =	data;
														app.route.navigate('identification', {trigger: true});
												}
										}
								});
						})
						.fail(function(error){console.log(error)})
						;
				});
  },
 
  afterRender: function () {
    if (this.isNew)  {
      $('input:submit', this.$el).attr('value', sauvages.messages.begin_street);
						$('input:reset', this.$el).replaceWith("<button class='btn btn-footer btn-default annuler-retour' type='button' >Retour à l'accueil</button>");
				}
    else{
						$('.page-title').replaceWith("<div class='page-title'>"+sauvages.messages.end_street+"</div>");
      $('input:submit', this.$el).attr('value', 'Terminer').removeClass('btn-primary').addClass('btn-danger');
      $('input:text', this.$el).addClass('disabled');
      $('select', this.$el).addClass('disabled');
						$('input:reset', this.$el).replaceWith("<button class='btn btn-footer btn-default annuler-fin-saisie' type='button'>Retour à la saisie</button>");
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
				$('#content').removeClass('content-home');
		},
		afterRender: function(){
    $('body').removeClass('pad-bottom-top');
				$('#header').addClass('hide');
    $('#menu').addClass('hide'); 
  }
});

app.views.LocalisationPageView =  app.utils.BaseView.extend({

  template: 'page-localisation',

		initialize: function() {
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
  beforeRender:function(){
    $('#content').addClass('content-home');
  },
		afterRender: function(){
				$('.page-title').replaceWith("<div class='page-title'>Ma localisation</div>");
				app.utils.geolocalisation.getCurrentPosition();
				if (typeof app.utils.geolocalisation.currentPosition !== undefined) {
						var latitudePosition = app.utils.geolocalisation.currentPosition.latitude;
						var longitudePosition = app.utils.geolocalisation.currentPosition.longitude;
						$('.page-sub-title').replaceWith("<h1 class='page-sub-title'> latitude : "+latitudePosition +" - longitude : "+longitudePosition+"</h1>");
						this.map = L.map(this.el).setView([latitudePosition, longitudePosition], 13);
						var marker = L.marker([latitudePosition, longitudePosition]).addTo(this.map);
						
						L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
						attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
						maxZoom: 18
						}).addTo(this.map);
						return this;
				}else{
						sauvages.notifications.gpsNotStart();
						self.goToLastPage();
				}
		},
  remove : function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('#content').removeClass('content-home');
  }
});

app.views.UtilisateurPageView = app.utils.BaseView.extend({


  template: 'page-utilisateur',

		initialize: function() {
				this.model.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

		events : {
				"click .modifier-enregistrement"	: "updateEmail",
				"click .annuler-enregistrement"	: "annuler",
				"click .enable-email" : "enableInputEmail",
				"keydown input" : "enableSave"
	},
		
		annuler: function(evt){
				app.route.navigate('', {trigger: true});
		},

		enableSave	: function(evt){
				if ($('.btn-update', this.$el).hasClass('enable-email')) {
						$('.btn-update', this.$el).addClass('modifier-enregistrement').removeClass('enable-email').html('Enregistrer');
				}
		},
		
		enableInputEmail: function(evt){
				var isDisabled = $('input[type=text]').hasClass('disabled');
				if (isDisabled) {
						$('input[type=text]').removeClass('disabled');		
				}		
		},
		updateEmail: function(evt){
				var currentEmail = this.$el.find('input[type="text"]').val();
				this.model.set('email',String(currentEmail))
						.save();
		},
		
		beforeRender: function(){
				$('.icone-page-title').hide();		
				this.insertView("#user-form", new app.views.FormUserView({initialData:this.model}));
		},

		afterRender: function(){
				$('.page-title').replaceWith("<div class='page-title'>Mon profil</div>");
				$('.page-sub-title').replaceWith("<h1 class='page-sub-title'>Paramètres </h1>");
  }
});
app.views.FormUserView = NS.UI.Form.extend({
    initialize: function(options) {
      NS.UI.Form.prototype.initialize.apply(this, arguments);
						var self = this;
						if (this.initialData.email !== undefined) {
								//$('input:submit', this.$el).replaceWith("<button class='btn btn-default btn-footer modifier-enregistrement' type='button'>Modifier</button>");
								//$('input[type=text]').addClass('disabled');
						}else{
								this.on('submit:valid', function(instance) {
										var self = this;
												instance.set('userId', 1).save().done( function(model, response, options) {
														instance.fetch({
																success: function(data) {
																		$('input[type=text]').addClass('disabled');
																		$('input:submit', self.$el).replaceWith("<button class='btn btn-default btn-footer btn-update enable-email' type='button' >Modifier</button>");
																		sauvages.notifications.emailSaveSuccess();
																		app.route.navigate('', {trigger: true});
																}
														});
												});
								});
						}
    },
    afterRender: function () {
						if (this.initialData.email !== undefined) {
								$('input[type=text]',this.$el).addClass('disabled');
								$('input:submit', this.$el).replaceWith("<button class='btn btn-default btn-footer btn-update enable-email' type='button'>Modifier</button>");
						}
      $('input:submit', this.$el).attr('value', sauvages.messages.save);
						$('input:reset', this.$el).replaceWith("<button class='btn btn-default btn-footer annuler-enregistrement' type='button'>Retour à l'accueil</button>");
						$('.input-text .glyphicon',this.$el).replaceWith("<span class='glyphicon glyphicon-user'></span> ");
      $('h3', this.$el).attr('style', 'display:none');
    },
		
});

app.views.CreditsPageView =  app.utils.BaseView.extend({

  template: 'page-credits',

		initialize: function() {
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
		beforeRender: function(){
		$('.icone-page-title').hide();		
		},

		afterRender: function(){
				$('.page-title').replaceWith("<div class='page-title'>Crédits</div>");
				$('.page-sub-title').replaceWith("<h1 class='page-sub-title'>Sauvages de Ma Rue Mobile </h1>");
  }
});

app.views.RegionPageView= app.utils.BaseView.extend({

  template: 'page-region',

		initialize: function(options) {
				$('#header').show();
   // this.model.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

		events:{ 
		'click .retour-home': 'retourHome',
		'click div#map': 'selectRegion',
  },

		selectRegion : function(evt){
				var objCurrentTarget=$(evt.target);
				var idCurrentTarget= objCurrentTarget['context']['id'];
				app.route.navigate('#maregion/'+idCurrentTarget+'', {trigger: true});
				return false;
		},	

		retourHome : function(evt){
				app.route.navigate('', {trigger: true});
				return false;
		},

  beforeRender: function() {		
				$('.page-title').replaceWith("<div class='page-title'>Ma région</div>");
				$('.page-sub-title').replaceWith("<h1 class='page-sub-title'>Choisis ta région !</h1>");
				$('.icone-page-title').hide();		
  },
		afterRender: function(){
				if(typeof device !== 'undefined'){
						if(device.platform === "Android" && parseInt(device.version) < 3 ){
								$('.liste-not-support-svg').remove();
								$('#map', this.$el).append("<div class='row-fluid liste-not-support-svg' ><div class='row'><a id='Provence-Alpes-Cotes-Azur' class='btn btn-lg btn-danger android2'>Région Provence Alpes Côtes-d'Azur</a></div></div>");
						}else{		
								$('#map', this.$el).load('css/map/map_regions.svg');
						}
				}else{
						$('#map', this.$el).load('css/map/map_regions.svg');
				}
		}
});

app.views.MaRegionView= app.utils.BaseView.extend({

  template: 'page-ma-region',

		initialize: function(options) {
				this.collection.bind("reset", this.render, this);
				this.region = options.region;
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

		events:{ 
		'click .retour-home': 'retourHome',
  },

		retourHome : function(evt){
				app.route.navigate('', {trigger: true});
				return false;
		},

  beforeRender: function() {
				if ( this.region === 'Provence-Alpes-Cotes-Azur') this.regionEditorial = "Provence Alpes Côtes d'Azur" ;
				$('.icone-page-title').attr("id", "icone"+this.region);
				$('.icone-page-title').show();		
				$('.page-title').replaceWith("<div class='page-title'>Ma région</div>");
				$('.page-sub-title').replaceWith("<h1 class='page-sub-title'>"+this.regionEditorial+"</h1>");
  },

		afterRender: function() {
				$('.sauvages-region a', this.$el).attr("href","#identification/"+this.region);
				$('#map-region', this.$el).load('css/map/carte-paca.svg');
  }
});

app.views.IdentificationKeyFilterView = app.utils.BaseView.extend({


  template: 'page-identification-key-filter',
  
  initialize: function() {
				this.region = this.options.region;
			 this.href = 'taxonlistRegion/'+this.region;
				if (this.options !== undefined) {
						this.filtreRegion = this.options.filtreRegion;
				}
    this.collection.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
  
  events: {
    "click input[type=checkbox]": "filterTaxon",
				"click #supprimer-filtre" : "suppFiltre",
    "click .help": "helpShow"
  },
		
  beforeRender: function() {
    this.collection.each(function(criteria) {
      this.insertView("#values-list", new app.views.IKCriteriaListItemFilterView({model: criteria, filtreRegion : this.filtreRegion, region : this.region}));
    }, this);
				$('body').addClass('cleliste cle');
				$('body.cleliste.cle #content').append("<div id='languette' class='languette-right'><a href='#"+this.href+"'><span id='taxonNb'>"+ app.globals.cListAllTaxonsRegion.models.length +"</span><span class='glyphicon glyphicon-chevron-right' ></span></a></div>");
				$('.page-title').replaceWith("<div class='page-title'>Identification</div>");
		},
		
		remove: function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				console.log('remove identification');
				$('.navbar-fixed-bottom .btn-group .btn-footer');
				$('body').removeClass('cleliste cle');
    $('#languette').remove();
		},
		

		helpShow :function(){
				var self=this;
				var criteriaName = "Aide de l'assistant d'identification";
				var criteriaColl = self.collection;
				var msg = _.template(
										"<div class='helpKeyDiv'>"+
										"	<div class='row'><% _.each(data.models,function(criteriaValueCollItem,i){%>"+
										"		<div class='col-xs-12 col-sm-12 col-md-12'>	<h4><%= criteriaValueCollItem.get('name') %></h4> "+
										"			<p><%= criteriaValueCollItem.get('description') %></p>"+
										"			<div class='row'><% _.each(criteriaValueCollItem.get('defCaracValues').models,function(criteriaValueItem,i){%>"+
										"				<div class='col-xs-4 col-sm-4 col-md-4'><img src='./data/images/pictos/<%= criteriaValueItem.get('picture')%>'/><p class='nomValeur'><%= criteriaValueItem.get('name') %><p></div>"+
										'			<% }); %>'+
										'			</div>'+
										"		</div>"+
										'	<% }); %>'+
										'	</div>'+
										'</div>'					
									);
				sauvages.notifications.helpKey(criteriaName,msg(criteriaColl));
	},
  
		suppFiltre :function(event){
				app.globals.currentFilter.length = 0;
				app.globals.currentFilterTaxonIdList.length = 0;
				$("#taxonNb").html(app.globals.cListAllTaxonsRegion.models.length);
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
      app.utils.queryData.getFilterTaxonIdList(app.globals.currentFilter, true, lISTE_PACA_FKID).done(
        function(data) {
          app.globals.currentFilterTaxonIdList =  data;
          //refresh front end
          $("#taxonNb").html(app.globals.currentFilterTaxonIdList.length);
        }
      );
    }
    else{
						app.globals.currentFilterTaxonIdList.length = 0;
      $("#taxonNb").html(app.globals.cListAllTaxonsRegion.models.length);
    }
  }

});

app.views.IdentificationKeyView =  app.utils.BaseView.extend({

  template: 'page-identification-key',
  
  initialize: function() {
    this.collection.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
  
  events: {
    "click input[type=checkbox]": "filterTaxon",
				"click #supprimer-filtre" : "suppFiltre",
    "click .help": "helpShow"
  },
		
  beforeRender: function() {
    this.collection.each(function(criteria) {
      this.insertView("#values-list", new app.views.IKCriteriaListItemView({model: criteria}));
    }, this);
				$('body').addClass('cleliste cle');
				$('body.cleliste.cle').append("<div id='languette' class='languette-right'><a href='#taxonlist'><span id='taxonNb'>"+ app.globals.cListAllTaxons.length +"</span><span class='glyphicon glyphicon-chevron-right' ></span></a></div>");
				$('.page-title').replaceWith("<div class='page-title'>Identification</div>");
				if (app.globals.currentrue !== undefined) {
						$('.page-sub-title').replaceWith("<h1 class='page-sub-title'>"+app.globals.currentrue.get('name') +" - "+app.globals.currentrue.get('cote') +"</h1>");
				}
		},
		
		remove: function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				console.log('remove identification');
				$('.navbar-fixed-bottom .btn-group .btn-footer');
				$('body').removeClass('cleliste cle');
    $('#languette').remove();
		},
		
		helpShow :function(){
				var self=this;
				var criteriaName = "Aide de l'assistant d'identification";
				var criteriaColl = self.collection;
				var msg = _.template(
										"<div class='helpKeyDiv'>"+
										"	<div class='row'><% _.each(data.models,function(criteriaValueCollItem,i){%>"+
										"		<div class='col-xs-12 col-sm-12 col-md-12'>	<h4><%= criteriaValueCollItem.get('name') %></h4> "+
										"			<p><%= criteriaValueCollItem.get('description') %></p>"+
										"			<div class='row'><% _.each(criteriaValueCollItem.get('defCaracValues').models,function(criteriaValueItem,i){%>"+
										"				<div class='col-xs-4 col-sm-4 col-md-4'><img src='./data/images/pictos/<%= criteriaValueItem.get('picture')%>'/><p class='nomValeur'><%= criteriaValueItem.get('name') %><p></div>"+
										'			<% }); %>'+
										'			</div>'+
										"		</div>"+
										'	<% }); %>'+
										'	</div>'+
										'</div>'					
									);
				sauvages.notifications.helpKey(criteriaName,msg(criteriaColl));
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
  afterRender:function() {
   if (app.globals.currentFilter.length > 0) {
      _.each(app.globals.currentFilter,function(l){ 
								var currentInput = 'defCaracValue-'+l ;
								$('input[name="'+currentInput+'"]').prop('checked', true).parent().addClass("RadioCustomOn");
      });
					$("#taxonNb").html(app.globals.currentFilterTaxonIdList.length);
    }
  }
});

app.views.IKCriteriaListItemFilterView =  app.utils.BaseView.extend({

  template: 'items-list-criteria-picto-filter',

  initialize: function() {
				if (this.options.filtreRegion !== undefined) {
						this.filtreRegion = this.options.filtreRegion;
				}
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);

  },
  afterRender:function() {
   if (app.globals.currentFilter.length > 0) { 
      _.each(app.globals.currentFilter,function(l){ 
								var currentInput = 'defCaracValue-'+l ;
								$('input[name="'+currentInput+'"]').prop('checked', true).parent().addClass("RadioCustomOn");
								$("#taxonNb").html(app.globals.currentFilterTaxonIdList.length);
      });
    }
				if (app.globals.regiontaxon.length > 0) { 
      _.each(app.globals.regiontaxon,function(l){ 
								var currentInput = 'defCaracValue-'+l;
								$('input[name="'+currentInput+'"]').prop('checked', true).parent().removeClass("disabled");
      },this);
    }
  },
});

app.views.IKCriteriaListItemFilterTaxonView =  app.utils.BaseView.extend({

  template: 'items-list-taxondetail-criteria',

  initialize: function() {
				if (this.options.taxon !== undefined) {
						this.taxon = this.options.taxon;
				}
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },
  afterRender:function() {
				if (this.taxon.get('caracValues').length > 0) { 
      _.each(this.taxon.get('caracValues').models,function(l){ 
								var currentInput = 'defCaracValue-'+l.get('fk_carac_value');
								$('input[name="'+currentInput+'"]').prop('checked', true).parent().removeClass("disabled");
      },this);
    }
  },
});

app.views.TaxonListView =  app.utils.BaseView.extend({

  template: 'page-taxon-list',
  
  initialize: function() {
				this.hrefIdentification = 'identification';
				if (this.options.region !== undefined) {
						this.region = this.options.region;
						this.hrefIdentification = 	'identification/'+this.region;
				}
    this.collection.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  beforeRender: function() {
				$('body').addClass('cleliste liste');
				$('body.cleliste.liste #content').append("<div id='languette' class='languette-left'><a href='#"+this.hrefIdentification+"'><span class='glyphicon glyphicon-chevron-left' ></span></a></div>");
    var availableLetter  = _.uniq(_.map(this.collection.models, function(taxon){ return taxon.get("commonName").charAt(0).toUpperCase();  }));
    
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
  serialize: function() {
				if (this.options.region !== undefined){
						if (this.collection) return {collection : this.collection,region : this.options.region};
				}else{
						if (this.collection) return {collection : this.collection};
				}	
    return true;
  },
		
		afterRender: function() {
				if (this.options.region !== undefined) {
						$('.footer-default').remove();
				}
		},
		remove: function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				console.log('remove liste');
				$('body').removeClass('cleliste liste');
    $('#languette').remove();
		}
});

app.views.TaxonDetailView=  app.utils.BaseView.extend({

  template: 'page-taxon-detail',

   initialize: function() {
				this.collection.bind("reset", this.render, this);
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  beforeRender: function() {
    var self = this;
						this.collection.each(function(criteria) {
								self.insertView("#values-list", new app.views.IKCriteriaListItemFilterTaxonView({model: criteria, taxon: self.model}));
						}, this);
				$('.page-title').replaceWith("<div class='page-title'>"+ this.model.get('commonName')+"</div><em>"+ this.model.get('scientificName')+"</em>");
  },

		afterRender: function() {
				$('.flexslider', this.$el).flexslider({
														animation: "slide",  
														slideshow: false,
														touch: true,  
														start: function(slider) {
															$('.flexImages').show();
														}
				});
		},
		
		serialize: function() {
				if (this.options.localisation !== null){
						if (this.model) return {model : this.model, localisation : this.options.localisation};
				}else{
						if (this.model) return {model : this.model};
				}	
    return true;
  },
		
		remove: function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('.page-block-title em').remove();
				$('.navbar-fixed-bottom .btn-group .btn-footer').remove();
		}
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
				$('.icone-page-title').hide();
				$('.page-title').replaceWith("<div class='page-title'>Mes sauvages</div>");
				$('.page-sub-title').replaceWith("<h1 class='page-sub-title'>Liste de toutes mes sauvages</h1>");
		},
 
  events: {
    "click #tabObs a[href='#espece']": "tabObsespece",
    "click #tabObs a[href='#rue']": "tabObrue",
    'click #send-obs': 'sendObs',
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
						$(this).children().children().children().children('.glyph-collpase').addClass('glyp.hicon-plus');
				});
				$('#mesObsParRues').on('show.bs.collapse',  function () {
						$(this).children().children().children().children(".glyph-collpase").removeClass('glyphicon-plus');
						$(this).children().children().children().children(".glyph-collpase").addClass('glyphicon-minus');
				});
		}, 
  sendObs: function (event) {
    var connect = checkConnection();
    var obsTosend ;
				var emailUser;
    var self = this;
				var currentUser = new app.models.User({'userId': 1});
				if (connect === '4G' ||connect === '3G'||connect === 'WIFI'){
						currentUser.fetch({
          success: function(data) {
            self.emailUser = data.get('email');
												if (typeof(self.emailUser) !== 'undefined' && self.emailUser.length !== 0 ) {
														var dfd = $.Deferred();
														app.utils.queryData.getObservationsTelaWSFormated()
																.done(
																		function(data) {
																				if (data.length !== 0 ) {
																						//Send to tela via cel ws
																						var wstela = new NS.WSTelaAPIClient(SERVICE_SAISIE_URL, TAG_IMG, TAG_OBS, TAG_PROJET);
																						wstela.sendSauvageObservation(data, self.collection, self.parcours,self.emailUser).done(function() { 
																								self.render();
																								//@TODO trouver mieux !!
																								//$("#tabObs a[href='#rue']").tab('show');
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
																				"		<p>Ajouter votre email, vous permettra de retrouver vos observations sur le site Sauvages de ma Rue.</p>"+
																				'	<div class="input-group input-group-lg">'+
																				'  <span class="input-group-addon"><span class="glyphicon glyphicon-user"></span></span>'+
																				"		<label for='InputEmail' class='sr-only'>Adresse email</label>"+
																				"		<input type='email' class='form-control' id='InputEmail' placeholder='Entrer votre email'>"+
																				"	</div>"+
																				"</div>"+
																				"<button type='submit' id='submitEmail' class='btn btn-primary'>Valider</button>"+
																			"</form>"					
																		);
														sauvages.notifications.email(msg());
														$('.modal-footer').addClass("hide");
														self.render();
														}
										}
						});
						
				}else{
						sauvages.notifications.connection(connect);
				}

				
  },
		destroyObs : function(event){
						var self = this;
						var ctarget = $(event.currentTarget);
						var obsToDestroy = self.collection.findWhere({'id': parseInt(ctarget.context.id)});
						obsToDestroy.destroy({success: function(obs, idObs) {
								var obsTime = 	obs.set('datetime', new Date().format("dd/MM/yyyy"));
								var msg = "L'observation <i>"+obs.get('name_taxon')+"</i> du "+ obs.get('datetime')+" a été supprimée du mobile." 
								sauvages.notifications.supprimerObs(msg);
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
				app.route.navigate('#addParcours', {trigger: true});
		}
});
