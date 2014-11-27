"use strict";


// -------------------------------------------------- The Views ---------------------------------------------------- //

app.views.AddSauvageOccurenceNonIdentifierView = app.utils.BaseView.extend({
		template: 'form-add-obs-non-identifie',
		
    initialize: function() {
          $('.footer-default').hide();
     // this.model.bind("reset", this.render, this);
          app.utils.BaseView.prototype.initialize.apply(this, arguments);
    },

    beforeRender: function() {
      this.insertView("#obs-ni-form", new app.views.FormAddOccurenceNIView({initialData:this.model}));
      $('.page-title').replaceWith("<div class='page-title'>Sauvage non identifiée</div>");
      $('#content').scrollTop(0);
    },
    afterRender: function() {
      $('body').scrollTop(0);
    },
		
		remove : function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('.footer-default').show();		
		},
	
		events:{ 
				'click .annuler-enregistrement-obs': 'annulerTerminer',
				'click .btn-footer-right' : 'verifPhoto',
        'change div.control-group' :'renderView'
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
    renderView : function(evt){
      //Fix bug Android Sony
      setTimeout(function(){$('.bottom-navbar').show();},2500)
    }
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
                .fail(function(error){console.log(error)});
      });
    },
    afterRender: function () {
						$('textarea',this.$el).focus();
						$('.input-text', this.$el).attr('style', 'display:none');
						$('.select .glyphicon',this.$el).replaceWith("<span class='glyphicon glyphicon-globe'></span> ");
      $('input:submit', this.$el).attr('value', sauvages.messages.save);
						$('input:reset', this.$el).replaceWith("<button class='btn btn-default btn-footer annuler-enregistrement-obs' type='button'>Retour aux résultats</button>");
      $('h3', this.$el).attr('style', 'display:none');
						$('input.scientificName', this.$el).attr('style', 'display:none').val('inconnue');
						$('input.fk_taxon', this.$el).attr('style', 'display:none').val(0);
    },
		
});

app.views.AddSauvageOccurencePasDansListeView = app.utils.BaseView.extend({
		  template: 'form-add-obs-non-identifie',

  initialize: function() {
				$('.footer-default').hide();
    //this.model.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  beforeRender: function() {
    this.insertView("#obs-pl-form", new app.views.FormAddOccurencePasDansListeView({initialData:this.model}));
				$('.page-title').replaceWith("<div class='page-title'>Sauvage non répertoriée</div>");
  },
  afterRender: function() {
    $('body').scrollTop(0);
				var especeSearch = new app.models.EspeceCelCollection()
				new AutoCompleteView({
										input: $("input.scientificName"), // your input field
										model: especeSearch // your collection
				}).render();
  },
		
		remove : function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('.footer-default').show();		
		},
	
		events:{ 
				'click .annuler-enregistrement-obs': 'annulerTerminer',
				'click .btn-footer-right' : 'verifPhoto',
    'change div.control-group' :'renderView'
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
  renderView : function(evt){
    setTimeout(function(){$('.bottom-navbar').show();},2500)
  }

});

app.views.FormAddOccurencePasDansListeView = NS.UI.Form.extend({
    initialize: function(options) {
      NS.UI.Form.prototype.initialize.apply(this, arguments);
      this.on('submit:valid', function(instance) {
								//Get value for hidden fields
								instance.set('datetime', new Date().format("yyyy-MM-dd h:mm:ss"));
								instance.set('regionPaca', 0);
								instance.set('name_taxon', 'Non renseigné');
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
						$('.name_taxon', this.$el).attr('style', 'display:none');
						$('.fk_taxon', this.$el).attr('style', 'display:none');
    },
		
});

app.views.AddSauvageOccurenceView = app.utils.BaseView.extend({
  template: 'form-add-obs',

  initialize: function() {
    //this.model.bind("reset", this.render, this);
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
    $('body').scrollTop(0);

    $('img.editor-picture-img').on('load', function () {
      $('.bottom-navbar').show();
    });
  },
		remove : function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('.footer-default').show();		
		},
	
		events:{ 
		'click .annuler-enregistrement-obs': 'annulerTerminer',
  'change div.control-group' :'renderView'
  },
  annulerTerminer : function(evt){
						window.history.back();
        return false;	
		},
  renderView : function(evt){
    setTimeout(function(){$('.bottom-navbar').show();},2500)
  }
});

app.views.FormAddOccurenceView = NS.UI.Form.extend({
    initialize: function(options) {
      NS.UI.Form.prototype.initialize.apply(this, arguments);
      this.on('submit:valid', function(instance) {
								//Get value for hidden fields
								instance.set('datetime', new Date().format("yyyy-MM-dd h:mm:ss"));
								if (this.options.localisation === "Provence-Alpes-Cotes-Azur") {
										instance.set('regionPaca', 1);
										instance.set('fk_rue', 'regionPaca');
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
						$('.scientificName', this.$el).attr('style', 'display:none');
						$('.fk_taxon', this.$el).attr('style', 'display:none');
    },
		
});

app.views.AddSauvageRueView = app.utils.BaseView.extend({
    template: 'form-add-sauvagerue',
  
    initialize: function(options) {
				$('#header').show();
        // this.model.bind("reset", this.render, this);
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
    'focusin .notNew': 'editFormElem',
    'blur .notNew': 'readOnlyFormElem',
    "click .input-text" : "editFormElem",
    },

		annulerTerminer : function(evt){
			app.route.navigate('identification', {trigger: true});
				return false;
		},
		annulerParcours : function(evt){
				delete app.globals.currentrue;
				app.route.navigate('#', {trigger: true});
				return false;
		},
    editFormElem : function(evt){
          var objCurrentTarget=$(evt.target);
          var idCurrentTarget= objCurrentTarget['context']['id'];
          $('#'+idCurrentTarget).removeAttr("readonly","readonly");
    },
  
    readOnlyFormElem : function(evt){
          var objCurrentTarget=$(evt.target);
          var idCurrentTarget= objCurrentTarget['context']['id'];
      $('#'+idCurrentTarget).attr("readonly","readonly");
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
    }

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
						
						var coords = app.models.pos.get('coords');

						instance.set(prefix+'datetime', new Date().format("yyyy-MM-dd h:mm:ss"));
						instance.set(prefix+'latitude',coords.latitude );
						instance.set(prefix+'longitude',coords.longitude);
									
						instance.save().done( function(model, response, options) {
								//On refetch le model pour récupérer le PK
								instance.fetch({
										success: function(data) {
												//fin de parcours
												if (!self.isNew) {
														delete app.globals.currentrue;
														data.set('state',1).save();
														app.globals.currentFilter.length = 0;
														app.globals.currentFilterTaxonIdList.length = 0;
														$('.page-sub-title').empty();

														var msg = _.template(
																				"<form role='form form-inline'>"+
																					"<div class='form-group'>"+
																					"		<p>Retrouver vos données dans la rubrique <strong>Mes Sauvages</strong>.<br/> N\'oublier pas de les partager aux scientifiques !</p>"+
																					"</div>"+
																					"<button type='submit' class='btn btn-success'>Partager</button>"+
																					"<button type='reset' class='btn btn-default pull-right'>Mes Sauvages</button>"+
																				"</form>"					
																		);
														sauvages.notifications.finParcours(msg(),data.get('id'),data);				
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
						$('.page-title').replaceWith("<div class='page-title'>Mon parcours</div>");
      $('input:text,select', this.$el).attr("readonly","readonly").addClass('notNew');
      $('input:submit', this.$el).replaceWith("<button class='btn btn-footer btn-default annuler-fin-saisie' type='button'>Retour à la saisie</button>")
      $('input:reset', this.$el).replaceWith("<input type='submit' class='btn btn-footer btn-footer-right btn-danger' value='Terminer'>");
     }
    $('input:reset', this.$el).attr('style', 'display:none');
    $('h3', this.$el).attr('style', 'display:none');

    var connect = checkConnection();
    if (connect !== 'inconnu'||connect !== "none" || connect !== false || connect !== undefined) {
      var self = this;
      $('#'+this.id+'_name',this.el).geocomplete({country: "FR"}) 
      .bind("geocode:result", function(event, result){
        })
        .bind("geocode:error", function(event, status){
          console.log("ERROR: " + status);
        })
        .bind("geocode:multiple", function(event, results){
        });
    }
  }
});

app.views.ObsRueView=  app.utils.BaseView.extend({
    template: 'table-obs-rue',

    initialize: function() {
     // this.collection.bind('reset', this.render, this);
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

		beforeRender:function(){
        $('#content').addClass('content-home');
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
				$('#header').addClass('hide');
        $('#menu').addClass('hide');
        app.utils.queryData.getObservationsTelaWSFormatedAll()
        .done(function(data) {
          if (data.length !== 0 && $('#home-page-content .flag-container').has('#flagObs').length === 0) {
            $('#home-page-content .flag-container p').after("<span id='flagObs' class='glyphicon glyphicon-refresh pull-left'></span>");  
          }else if(data.length === 0 && $('#home-page-content .flag-container').has('#flagObs').length === 1){
            $('#flagObs').remove();
          }
        });
        if ($('.row-fluid')[0].offsetHeight < $('.row-fluid')[0].scrollHeight) {
            $('.row-fluid', this.$el).append("<div class='icon-scroll-bottom' ></div>");
        };
        $('body #home-page-content div.row-fluid').scroll(this.checkpositionScroll);
    },

    checkpositionScroll : function(event){
				var pos = $('body #home-page-content div.row-fluid').scrollTop();
				if (pos > 5) {
						$('.icon-scroll-bottom').hide();	
				}else if (pos == 0){
      $('.icon-scroll-bottom').show();
    }
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
				var coords = app.models.pos.get('coords');
				if (coords) {
						var latitudePosition = coords.latitude;
						var longitudePosition = coords.longitude;
						$('.page-sub-title').replaceWith("<h1 class='page-sub-title'> lat : "+latitudePosition.toPrecision(5) +" - lon : "+longitudePosition.toPrecision(5)+"</h1>");
						this.map = L.map(this.el).setView([latitudePosition, longitudePosition], 13);
						var marker = L.marker([latitudePosition, longitudePosition]).addTo(this.map);
						L.Icon.Default.imagePath = 'libs/leaflet/images';
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
        $('.page-block-sub-title h1').remove();
				if (app.globals.currentrue !== undefined) {
						$('.page-block-sub-title').append("<h1 class='page-sub-title'>"+app.globals.currentrue.get('name') +" - "+app.globals.currentrue.get('cote') +"</h1>");
				}
  }
});

app.views.ClassementNationalView =  app.utils.BaseView.extend({
    template: 'table-classement-national',

    initialize: function() {
        // collection = classement
        if (this.collection !== undefined) {
            //this.collection.bind('reset', this.render, this);
            //this.collection.bind('add', this.render, this);
        }
        this.model.bind('reset', this.render, this);
        this.model.bind('change', this.render, this);
        app.utils.BaseView.prototype.initialize.apply(this, arguments);
    },
  
    serialize: function() {
       return {collection: this.collection, model : this.model};
    },
  
    beforeRender: function(){
    }
});

app.views.MyRecompenseView =  app.utils.BaseView.extend({
    template: 'table-recompense',

    initialize: function() {
        // collection = recompense
        if (this.collection !== undefined) {
            //this.collection.bind('reset', this.render, this);
            this.collection.bind('add', this.render, this);
        }
        app.utils.BaseView.prototype.initialize.apply(this, arguments);
    },
  
    serialize: function() {
       return {collection: this.collection};
    },
  
    beforeRender: function(){
    }
});

app.views.infoUserView =  app.utils.BaseView.extend({
    template: 'block-info-user',

    initialize: function() {
        // model = user
        this.model.bind('change', this.render,this);
        this.model.bind('remove', this.render,this);
        app.utils.BaseView.prototype.initialize.apply(this, arguments);
    },
  
    serialize: function() {
       return {model: this.model};
    },
  
    beforeRender: function(){
    }
});
app.views.UtilisateurPageView = app.utils.BaseView.extend({

  template: 'page-utilisateur',

		initialize: function() {
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
    },

    serialize: function() {
        if (this.collection) {
            return {collection:this.collection, model : this.model};
        }
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

		enableSave	: _.debounce(function(){
				if ($('.btn-update', this.$el).hasClass('enable-email')) {
						$('.btn-update', this.$el).addClass('modifier-enregistrement').removeClass('enable-email').html('Enregistrer');
				}
		},800),

		enableInputEmail: function(evt){
				var isDisabled = $('input[type=text]').hasClass('disabled');
				if (isDisabled) {
						$('input[type=text]').removeClass('disabled');		
				}
		},
		updateEmail: function(evt){
        var currentEmail = this.$el.find('input[type="text"]').val();
        if (validatorsEmail(currentEmail)) {
            this.model.set('email',String(currentEmail)).save().done( function(model, response, options) {
                //synchro
                var synchroU = new NS.SynchroUser();
                synchroU.deleteTrecompense({success: function() {
                    var connect = checkConnection();
                    if (connect !== 'none' || connect === false){
                        synchroU.mailExiste();
                    }
                }});
                $('input[type=text]').addClass('disabled');
                $('.modifier-enregistrement', this.$el).replaceWith("<button class='btn btn-default btn-footer btn-update enable-email' type='button' >Modifier</button>");
               // sauvages.notifications.emailSaveSuccess();
            });
        }
		},
		
		beforeRender: function(){
				$('.icone-page-title').hide();		
				this.insertView("#user-form", new app.views.FormUserView({initialData:this.model}));
        this.insertView("#classement", new app.views.ClassementNationalView({collection : this.options.classement, model : this.model}));
        this.insertView("#recompense", new app.views.MyRecompenseView({collection : this.collection}));
        this.insertView("#user-info", new app.views.infoUserView({model : this.model}));
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
        this.on('submit:valid', function(instance) {
        var self = this;

        instance.save().done( function(model, response, options) {
          instance.fetch({
            success: function(data) {
                var connect = checkConnection();
                    //synchro
                if ((connect !== 'none' && navigator.camera) || connect === true){
                    var synchroU = new NS.SynchroUser();
                    synchroU.mailExisteDrupal(data.get('email'))
                        .done(function(user){
                        //Get my_classement et my_recompense with uid
                        synchroU.retrieveRecompenseDrupal(user.uid).done(function(myRecompenses){
                            //object to model recompense
                            //_.each(myRecompenses,function(item) {
                            //  var modelRecomp = new app.models.RecompensesDataValue({title :item.filename});
                            //  app.globals.collectionRecompense.add(modelRecomp);
                            //});
                            synchroU.retrieveMyClassementDrupal(user.uid).done(function(myClassement){
                                //object to model classement
                                app.globals.currentUser.set('score', myClassement[0].score).save;
                                app.globals.currentUser.set('rank', myClassement[0].rank).save;
                            });
                        });
                    });
                }
                $('input[type=text]').addClass('disabled');
                $('input:submit', self.$el).replaceWith("<button class='btn btn-default btn-footer btn-update enable-email' type='button' >Modifier</button>");                
//sauvages.notifications.emailSaveSuccess();
            }
          });
        });
      });
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
			//	this.collection.bind("reset", this.render, this);
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
   // this.collection.bind("reset", this.render, this);
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
    //this.collection.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
				//Mise à zéro de la position du scroll pour la liste
				app.globals.positionScroll = 0;
  },
  
  events: {
    "click input[type=checkbox]": "filterTaxon",
				"click #supprimer-filtre" : "suppFiltre",
    "click .help": "helpShow",
  },
		
  beforeRender: function() {
    this.collection.each(function(criteria) {
      this.insertView("#values-list", new app.views.IKCriteriaListItemView({model: criteria}));
    }, this);
				$('body').addClass('cleliste cle');
				$('.page-title').replaceWith("<div class='page-title'>Identification</div>");
				if (app.globals.currentrue !== undefined) {
						$('.page-sub-title').replaceWith("<h1 class='page-sub-title'>"+app.globals.currentrue.get('name') +" - "+app.globals.currentrue.get('cote') +"</h1>");
				}
		},

		afterRender :function(){
				$('body').scrollTop(0);
  		$('body.cleliste.cle').append("<div id='languette' class='languette-right'><a href='#taxonlist'><span id='taxonNb'>"+ app.globals.cListAllTaxons.length +"</span><span class='glyphicon glyphicon-chevron-right' ></span></a></div>");
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
   // this.model.bind("reset", this.render, this);
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
  //  this.model.bind("reset", this.render, this);
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
								$('input[name="'+currentInput+'"]').prop('checked', false).parent().removeClass("disabled");
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
  //  this.model.bind("reset", this.render, this);
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
});$(window)

app.views.TaxonListView =  app.utils.BaseView.extend({

  template: 'page-taxon-list',
  
  initialize: function() {
				this.hrefIdentification = 'identification';
				if (this.options.region !== undefined) {
						this.region = this.options.region;
						this.hrefIdentification = 	'identification/'+this.region;
				}
    //this.collection.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
    $(window).scroll(this.checkpositionScroll);
  },


  beforeRender: function() {
				$('body').addClass('cleliste liste');
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

		checkpositionScroll : function(event){
    var $body =  $('body.liste');
				var pos = $body.scrollTop();
				if (pos > 0) {
						app.globals.positionScroll = pos;
				}
		},

		afterRender: function() {
				$('body.cleliste.liste #content').append("<div id='languette' class='languette-left'><a href='#"+this.hrefIdentification+"'><span class='glyphicon glyphicon-chevron-left' ></span></a></div>");
				if (this.options.region !== undefined) {
						$('.footer-default').remove();
				}
    setTimeout(this.goToLastPosition(),0);
    setTimeout(function(){$('.loading.cover-content').remove();},300)
		},

  goToLastPosition : function(){
    var bodyListe =  $('body.liste');
    if (app.globals.positionScroll.length !== 0) {
      //bodyListe.css({'-webkit-transform':'translateY(-'+app.globals.positionScroll+'px)'});
      bodyListe.scrollTop(app.globals.positionScroll);
    }
  },

		remove: function(){
    $(window).off("scroll",this.checkpositionScroll);    
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				console.log('remove liste');
				$('body').removeClass('cleliste liste');
    $('#languette').remove();
		}
});

app.views.TaxonDetailView=  app.utils.BaseView.extend({

  template: 'page-taxon-detail',

   initialize: function() {
				//this.collection.bind("reset", this.render, this);
    //this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  beforeRender: function() {
  		$('body').addClass('detail-taxon');
    var self = this;
						this.collection.each(function(criteria) {
								self.insertView("#values-list", new app.views.IKCriteriaListItemFilterTaxonView({model: criteria, taxon: self.model}));
						}, this);
				$('.page-title').replaceWith("<div class='page-title'>"+ this.model.get('commonName')+"</div><em>"+ this.model.get('scientificName')+"</em>");
				$('.page-block-sub-title').empty();
  },

		afterRender: function() {
				$('.flexslider', this.$el).flexslider({
														animation: "slide",  
														slideshow: false,  
														start: function(slider) {
															$('.flexImages').show();
														}
				});
    $('body').scrollTop(0);
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
				if (app.globals.currentrue !== undefined) {
						$('.page-block-sub-title').append("<h1 class='page-sub-title'>"+app.globals.currentrue.get('name') +" - "+app.globals.currentrue.get('cote') +"</h1>");
				}else if(this.options.localisation !== undefined){
						$('.page-block-sub-title').append("<h1 class='page-sub-title'>"+this.options.localisation+"</h1>");
				}
				$('.navbar-fixed-bottom .btn-group .btn-footer').remove();
    $('body').removeClass('detail-taxon');

		}
});

app.views.obsDetailView=  app.utils.BaseView.extend({

  template: 'page-obs-detail',

   initialize: function() {
				this.parcours = this.options.parcours;
    //this.collection.bind("reset", this.render, this);
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  beforeRender: function() {
				$('.page-title').replaceWith("<div class='page-title'>"+ this.collection.models[0].get('name_taxon') +"</div><em>"+ this.parcours.get('name')+" - "+this.parcours.get('cote')+"</em>");
				$('.page-block-sub-title').empty();
  },

		afterRender: function() {
    $('body').scrollTop(0);
		},
		
		serialize: function() {
				if (this.collection) return {collection : this.collection};
    return true;
  },
		
  events : {
    "click .confirme-supp" : "confirmeSupprObs",
    "click .destroy-obs" : "destroyObs"
  },

		remove: function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('.page-block-title em').remove();
				$('.navbar-fixed-bottom .btn-group .btn-footer').remove();
		},

		confirmeSupprObs : function(event){
				var msg = _.template(
						"<form role='form form-inline'>"+
							"<div class='form-group'>"+
							"		<p>Voulez-voulez supprimer l'observation <i><%= data.models[0].get('name_taxon') %></i> du <%= data.models[0].get('datetime') %>.</p>"+
							"</div>"+
							"<button type='submit' class='btn btn-danger'>Supprimer</button>"+
							"<button type='button' class='btn btn-default pull-right' data-dismiss='modal' aria-hidden='true'>Annuler</button>"+
						"</form>"					
				);
				sauvages.notifications.supprimerData(msg(this.collection), this.$el);
		},

		destroyObs : function(event){
						var self = this;
						this.obsCollection = new app.models.OccurenceDataValuesCollection();
						this.obsCollection.fetch({success: function(dataParcours) {
								var obsToDestroy = self.obsCollection.findWhere({'id': self.collection.models[0].get('id')});
								obsToDestroy.destroy({success: function(obs, idObs) {
										var obsTime = 	obs.set('datetime', new Date().format("dd/MM/yyyy"));
										var msg = "L'observation a été supprimée du mobile." 
										sauvages.notifications.supprimerObs(msg);
										app.route.navigate('myObservation', {trigger: true});

										var obsFkRue = obs.get('fk_rue');
										var ObsWhereRueTarget = self.obsCollection.where({'fk_rue' : parseInt(obsFkRue)})
										var nbObs = ObsWhereRueTarget.length;
										
										var parcoursState =	self.parcours.get('state');
										if (parseInt(nbObs) === 0 && parcoursState !==  0) {
												self.parcours.destroy({success: function(rue, results) {
												app.route.navigate('myObservation', {trigger: true});
												}});
										}
								}
						});
				}});
		},

});

app.views.ObservationListView =  app.utils.BaseView.extend({

  template: 'page-obs-list',
  
  initialize: function() {
				this.parcours = this.options.parcours;
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
				this.flagSuppr = false;

  // -------------------------------------------------- Hammer event desktop et mobile ---------------------------------------------------- //
  //if (document.documentElement.hasOwnProperty('ontouchstart')) { var event = 'touchstart' }else{ event = 'click'};
				var options = {
						dragLockToAxis: true,
						dragBlockHorizontal: true
				};
				var element = document.getElementsByClassName('mm-page');
				var hammertime = new Hammer(element, options);
  },
  
  serialize: function() {
				this.parcours.models.reverse();
    if (this.collection) return {collection : this.collection, parcours : this.parcours};
    return true;
  },
		beforeRender: function(){
				$('body').addClass('obsListe');
				$('.icone-page-title').hide();
				$('.page-title').replaceWith("<div class='page-title'>Mes sauvages</div>");
				$('.page-sub-title').replaceWith("<h1 class='page-sub-title'>Liste de toutes mes sauvages</h1>");
		},


		remove: function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
				$('body').removeClass('obsListe');
		},
    events: {
        "click #tabObs a[href='#espece']": "tabObsespece",
        "click #tabObs a[href='#rue']": "tabObrue",
				'click .test-obs': 'sendObs',
				'click .destroyRue':'destroyRue',
				'click .back-rue-en-cours':'backRueEnCours',
				'click .back-home' : 'backHome',
				'click .back-parcours' : 'backParcours',
				'hidden.bs.collapse': 'hideIcon',
				'shown.bs.collapse': 'showIcon',
				'shown.bs.tab': 'scrollOnshow',
				'click .annulerEnvoi': 'abortRequete',
				'dragleft .panel-heading': 'supprDrag',
				'dragright .panel-heading': 'annuleDrag',
				'click a':'fermerAllDrag',
				"click .confirme-supp" : "confirmeSupprRue",
		},
  
  tabObsespece: function(event){
    $("#tabObs a[href='#espece']").tab('show');
				$('#content').scrollTop(0);
  },
  tabObrue: function(event){
    $("#tabObs a[href='#rue']").tab('show');
  },
		scrollOnshow : function(event){
				setTimeout(function(){$('#content').scrollTop(0);},100)
		},
		hideIcon: function(event){
				$('#mesObsParRue').on('hidden.bs.collapse', this.toggleChevron(event));
		},
		showIcon: function(event){
				$('#mesObsParRue').on('shown.bs.collapse', this.toggleChevron(event));
		},
		toggleChevron: function(event){
    $(event.target).prev().find('.glyph-collpase').toggleClass('glyphicon-minus glyphicon-plus');
		},

  sendObs: function (event) {
    var self = this;
		var idRue = findIdToTargetEvent(event);
		this.parcoursEnCours = this.findCollectionToTargetID(idRue,this.parcours);
    var results = this.collection.where({'fk_rue':idRue});
    var collection = new Backbone.Collection(results);

    var sendObservations = new NS.SendOBS(idRue,this.parcoursEnCours,collection);
    sendObservations.envoiUtilitaireWS(idRue,this.parcoursEnCours,collection)
    .done(
      function() {
        setTimeout(function(){$('#content').scrollTop(0);},100);
				self.parcours.models.reverse();
        self.render();
      }
    );
  },

		destroyRue : function(event){
				var self = this;
        var idRue = findIdToTargetEvent(event);
				var rueToDestroy = this.findCollectionToTargetID(idRue,self.parcours);
				var idRue = findIdToTargetEvent(event);
				rueToDestroy.destroy({
						success: function(rue, idRue) {
								if(app.globals.currentrue != undefined && app.globals.currentrue.get('id') == idRue){ app.globals.currentrue = undefined};
								var rueTime = 	rue.set('datetime', new Date().format("dd/MM/yyyy"));
								var msg = "La rue <i>"+rue.get('name')+"</i> du "+ rue.get('datetime')+" a été supprimée du mobile." 
								sauvages.notifications.supprimerObs(msg);
								$("#tabObs a[href='#rue']").tab('show');
								//Suppression des obs attachées à cette rue
								var collectionTarget = self.collection.where({'fk_rue': idRue})
								if (collectionTarget.length > 0) {
										_.each(collectionTarget,function(item) {
												item.destroy();
										});
								}
								self.parcours.models.reverse();
								self.render();
						}
				});
		},
		backRueEnCours : function(event){
				app.globals.currentrue =	this.parcours.findWhere({'state': 0});
				app.route.navigate('identification', {trigger: true});
		},
		backParcours : function(event){
				app.route.navigate('#addParcours', {trigger: true});
		},
		backHome : function(event){
				app.route.navigate('', {trigger: true});
		},
		supprDrag : function(event){
				event.gesture.stopDetect();
				event.stopPropagation();
				this.fermerAllDrag();
				var objCurrentTarget=$(event.currentTarget);
				var idCurrentTarget = objCurrentTarget[0]['id'];
				var idParentCurrentTarget= objCurrentTarget.parents('.panel');
				$('#'+idParentCurrentTarget[0]['id'] + ' .panel-heading')
						.css("border-right-style","solid")				
						.animate({ "borderRightWidth": "90px" }, "slow");
				var buttonDestroyRue = $('#'+idParentCurrentTarget[0]['id'] + ' .panel-heading').find('.confirme-supp');
				if (buttonDestroyRue.length === 0) {
						setTimeout(function(){$('#'+idParentCurrentTarget[0]['id'] + ' .panel-heading').append('<button type="button" class="confirme-supp btn btn-danger pull-right" id='+ idCurrentTarget + '><span class="glyphicon glyphicon-trash"></span></button>')},400);		
				}
				var buttonTestObs =$('#'+idParentCurrentTarget[0]['id'] + ' .panel-heading').find('.test-obs');
				if (buttonTestObs.length > 0) {
						setTimeout(function(){
								$(buttonTestObs).hide().fadeOut(1000);
								$('.badge').hide().fadeOut(1000)
						},400);		
				}
				var buttonBadge =$('#'+idParentCurrentTarget[0]['id'] + ' .panel-heading').children('.badge').hide();
		},
		annuleDrag : function(event){
				event.gesture.stopDetect()
				event.stopPropagation();
				this.fermerAllDrag();
		},
		fermerAllDrag : function(){
				$('button.destroyRue').remove();
				$('.panel-heading')
						.css("border-right-style","none")
						.animate({ "borderRightWidth": "0px" }, "slow");
				var buttonTestObs =$('.panel-heading').find('.test-obs');
				$('.badge').show().fadeIn(1000);
				if (buttonTestObs.length > 0) {
						setTimeout(function(){
								$('.test-obs').show().fadeIn(500)
						},400);		
				}	
		},
		confirmeSupprRue : function(event){
				var idRue = findIdToTargetEvent(event);
				var currentCollection = this.findCollectionToTargetID(idRue,this.parcours);
				var msg = _.template(
						"<form role='form form-inline'>"+
							"<div class='form-group'>"+
							"		<p>Voulez-voulez supprimer la rue <i><%= data.get('name') %></i> et toutes les observations liées à celle-ci ?</p>"+
							"</div>"+
							"<button type='submit' class='btn btn-danger'>Supprimer</button>"+
							"<button type='button' class='btn btn-primary pull-right' data-dismiss='modal' aria-hidden='true'>Annuler</button>"+
						"</form>"					
				);
				sauvages.notifications.supprimerRue(msg(currentCollection),idRue ,this.$el);
		},
		findCollectionToTargetID : function(id,collection){
				var currentCollection = collection.findWhere({'id': id});
				return currentCollection;
		}
});

app.views.AidePageView = app.utils.BaseView.extend({
  template: 'page-aide',

   initialize: function() {
				app.utils.BaseView.prototype.initialize.apply(this, arguments);
  },

  events: {
   "click #quitter-aide": "navigateHome"
  },

  navigateHome: function(evt){
    app.route.navigate('', {trigger: true});
  },

  beforeRender: function() {
    $('#header').hide();
    $('body').addClass('page-aide');
  },

		afterRender: function() {
				$('.flexslider', this.$el).flexslider({
														animation: "slide",  
														slideshow: false,
														start: function(slider) {
                var FirstLoad = $('.loading-splash', document).hasClass( "loading-splash" );
                if (FirstLoad ) {
                  $(".loading-splash").remove();
                  $('#splash-screen').remove();
                }
                $('body').removeClass('loading-slide opacite-null');
														}
				});
    $('body').scrollTop(0);
		},
  remove: function(){
				app.utils.BaseView.prototype.remove.apply(this, arguments);
    $('#header').show();
    $('body').removeClass('page-aide');
  }
});
