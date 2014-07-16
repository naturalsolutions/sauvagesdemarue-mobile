"use strict";

// Creating the application namespace
var app = {
  config: {
    // Find pathname portion of the URL and clean it (remove trailing slash if any)
    root: window.location.pathname.replace(/\/(?:index.html)?$/, '')
  },
  dao: {},
  models: {},
  views: {},
  utils: {},
  globals : {},

};
app.config.debug = true;


/*
 * Base view: common operations for all views (template base rendering, dynamic loading of templates, sub-views)
 */
app.utils.BaseView = Backbone.View.extend({

    initialize: function () {
        this._views = {};
        this._dfd = $.Deferred();
        this._dfd.resolve(this);
    },

    /*
     * Template management
     */

    prefix: app.config.root + '/tpl/',
    template: '',

    getTemplate: function () {
        var path = this.prefix + this.template,
            dfd = $.Deferred();
        app.templates = app.templates || {};

        if (app.templates[path]) {
            dfd.resolve(app.templates[path]);
        } else if (app.config.debug === false) {
          var data = $('#'+this.template).html();
          app.templates[path] = _.template(data);
          dfd.resolve(app.templates[path]);
        } else {
            $.get(path + '.html', function (data) {
                app.templates[path] = _.template(data);
                dfd.resolve(app.templates[path]);
            }, "text");
        }

        return dfd.promise();
    },

    /*
     * Sub-view management
     */

    getViews: function (selector) {
        if (selector in this._views) {
            return this._views[selector];
        }
        return [];
    },

    insertView: function (selector, view) {
        if (!view) {
            view = selector;
            selector = '';
        }
        // Keep a reference to this selector/view pair
        if (!(selector in this._views)) {
            this._views[selector] = [];
        }
        this._views[selector].push(view);
        // Forget this subview when it gets removed
        view.once('remove', function (view) {
            var i, found = false;
            for (i = 0; i < this.length; i++) {
                if (this[i].cid === view.cid) {
                    found = true;
                    break;
                }
            }
            if (found) {
                this.splice(i, 1);
            }
        }, this._views[selector]);
    },

    removeViews: function (selector) {
        if (selector in this._views) {
            while (this._views[selector].length) {
                this._views[selector][0].remove();
            }
        }
    },

    // Take care of sub-views before removing
    remove: function () {
        _.each(this._views, function (viewList, selector) {
            _.each(viewList, function (view) {
                view.remove();
            });
        });
        this.trigger('remove', this);
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    /*
     * Rendering process
     */

    serialize: function () {
      if (this.model) return this.model.toJSON();
      return true;
    },



    // transition slide

  transitionIn: function (callback) {

    var view = this;

    var animateIn = function () {
      view.$el.addClass('is-visible');
      view.$el.on('webkitTransitionEnd', function () {
        view.$el.addClass('transition-none');

        if (_.isFunction(callback)) {
          callback();
        }
      });
    };

    _.delay(animateIn, 20);

  },

  transitionOut: function (callback) {

    var view = this;

    view.$el.removeClass('is-visible');
    view.$el.on('webkitTransitionEnd', function () {
      if (_.isFunction(callback)) {
        callback();
      }
    });

  },
    // Can be overridden by child classes
    beforeRender: function () {},
    afterRender: function () {},

    render: function (options) {
        // Reset promise
        this._dfd = $.Deferred();

        // Give a chance to child classes to do something before render
        this.beforeRender();

        this.getTemplate().done(_.bind(function (tpl) {

            var data = this.serialize(),
                rawHtml = tpl(data),
                rendered,
                subViewsDfd = [];

            // Re-use nice "noel" trick from LayoutManager
            rendered = this.$el.html(rawHtml).children();
            this.$el.replaceWith(rendered);
            this.setElement(rendered);

            _.each(this._views, function (viewList, selector) {
                    var context = _.pick(this, 'BaseView', 'dfds');
                    context.base = selector ? this.$el.find(selector) : this.$el;
                    _.each(viewList, function (view) {
                        view.render();
                        view.$el.appendTo(this.base);
                        if (view instanceof this.BaseView) {
                            // Sub-view inherit from BaseView, we can safely assume an asynchronous behaviour and a promise method
                            this.dfds.push(view.promise());
                        }
                    }, context);
                }, {$el: this.$el, BaseView: this.constructor, dfds: this.subViewsDfd});

                    //transition slide
            options = options || {};
            if (options.page === true) {
              this.$el.addClass('page');
            }

            // Give a chance to child classes to do something after render
            try {
                var self = this;
                $.when.apply($, this.subviewsDfd).always(function() {
                  self.afterRender();
                  self._dfd.resolve(this);
                });
            } catch (e) {
                if (console && console.error) {
                    console.error(e);
                }
                this._dfd.reject(this);
            }

        }, this));

        return this;
    },

    promise: function () {
        return this._dfd.promise();
    }
});

// ----------------------------------------------- The Application initialisation ------------------------------------------ //
document.addEventListener("deviceready", onDeviceReady, false);

//pour fonctionner sur navigateur desktop
//if (app.config.debug === true){$( document ).ready(function() {onDeviceReady();});}

function onDeviceReady() {
  window.deferreds = [];  
  app.models.pos = new app.models.Position;

  if (navigator.connection) {
    var geoldfd = $.Deferred();
    // Wait first response of Geolocation API before starting app
    app.models.pos.once('change:coords', function() {this.resolve($('#geoloc').remove())}, geoldfd);
    deferreds.push(geoldfd);
  }

  setTimeout(function(){
    geolocalisation();
    $('body').append("<strong id='geoloc'>En attente de la Géolocalisation de l'appareil.<br/> Activer le wifi accélère la géolocalisation.</strong>");
  },500);

  init();

  function geolocalisation(){
    navigator.geolocation.watchPosition(
      function(position) {
        app.models.pos.set({'coords': position.coords});
        $('#geoloc').remove();
      },
      function(error) {
        app.models.pos.clear();
        console.warn('ERROR(' + error.code + '): ' + error.message);
        if (error.code === 2 || error.code === 1 || error.code === 0){ 
          sauvages.notifications.gpsNotStart(); 
        }
        geolocalisation();
      },
      {
        maximumAge: 10000,
        enableHighAccuracy: true
      }
    );
  }

  //Détecte l'ouverture et la fermeture du clavier sur Android et cache le footer 
  document.addEventListener("showkeyboard", function(){ $('.bottom-navbar').hide();}, false);
  document.addEventListener("hidekeyboard", function(){ $('.bottom-navbar').show();}, false);

  new NS.UI.NotificationList();
  new NS.UI.NotificationModalList();
 
  $("#menu").mmenu({
          classes: "mm-slide",
          transitionDuration : 0,
  });
}


function init(){
  // Customize Underscore templates behaviour: 'with' statement is prohibited in JS strict mode
  _.templateSettings['variable'] = 'data';

		initDB();

  $.when.apply(null, deferreds).done(function() {
    console.log ('all deferreds finished');
    app.globals.cListAllTaxons = new app.models.TaxonLiteCollection();
    app.globals.cListAllTaxons.fetch({
       success: function(data) {
          app.route = new app.Router();
          if (!Backbone.History.started) {
            Backbone.history.start();
          }        
          var FirstLoad = $('.loading-splash', document).hasClass( "loading-splash" );
          if (!FirstLoad ) {
           // Spinner management (visual feedback for ongoing requests) ici pour eviter superposition avec splash screen spinner
            $(document).ajaxStart(function () { $('body').addClass('loading disabled'); });
            $(document).ajaxStop(function () { $('body').removeClass('loading disabled'); });
          }
          //preloader
          for(var i=0; app.globals.cListAllTaxons.models;i++ ){
            var image = app.globals.cListAllTaxons.models[i].get('picture');
            var	imageLocal = image.replace("http://api.tela-botanica.org/img:","./data/images/images_formated/");
            $('#preloader').append(	"<img src="+ imageLocal +" width='1' height='1' />");
          };
          $('#map').load('css/map/map_regions.svg');
        }
    });
  });
  
}

function initDB(){
  console.log("initBD");

  // Initialisation des données
  app.db = openDatabase("sauvage-PACA", "", "db sauvage-PACA", 20*1024*1024);


  deferreds.push(app.dao.baseDAOBD.populate(new app.models.User()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Application()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Taxon()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.TaxonCaracValue()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.EspeceCel()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Picture()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.CaracteristiqueDef()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.CaracteristiqueDefValue()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Groupe()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Context()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.OccurenceDataValue()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.ParcoursDataValue()));
  

try {
console.log('version avant changeV : ' +app.db.version);
		// Si première installation de l'appli
  if(app.db.version === "") {
    var dfdTaxon = $.Deferred();
    deferreds.push(dfdTaxon);
    console.log('im a "" user');
    app.db.changeVersion("", "1.2", 
      function() {
          console.log('deferreds version vide '+ deferreds.length);
          //teste si les données taxons sont chargés dans la base
          //Si le tableau retourné est vide alors => chargement des données en base
          $.when(runQuery("SELECT * FROM Ttaxon" , [])).done(function (dta) {
          var arr = [];
            if (dta.rows.length == 0 ) {
              arr.push(loadXmlTaxa());
              arr.push(loadXmlCriteria());
              arr.push(loadXmlEspCEL());
            }
          $.when.apply(this, arr).then(function () {
            console.log('when finished dfd.resolve test if data are loaded');
            return setTimeout(function(){ dfdTaxon.resolve()},1000);
          });
          }).fail(function (err) {
            return dfdTaxon.resolve();
          });
      }, 
      // error
      function(e) {
       console.log('error in changeV vide à 1.2');
       console.log(JSON.stringify(e));
      },
      // success
      function() {
       console.log("success '' à 1.2 : "+app.db.version);
      }
			);
  // Sinon si la base de données de l'appli à mettre à jour est 1.1 
		}
		else if(app.db.version === "1.1") {
    var dfdTaxon = $.Deferred();
    deferreds.push(dfdTaxon);
    console.log('im a "" user');
    app.db.changeVersion("1.1", "1.2", 
      function() {
          console.log('deferreds version vide '+ deferreds.length);
          //teste si les données taxons sont chargés dans la base
          //Si le tableau retourné est vide alors => chargement des données en base
          $.when(runQuery("SELECT * FROM TespeceCel" , [])).done(function (dta) {
          var arr = [];
            if (dta.rows.length == 0 ) {
              arr.push(loadXmlEspCEL());
            }
          $.when.apply(this, arr).then(function () {
            console.log('when finished dfd.resolve test if data are loaded');
            return setTimeout(function(){ dfdTaxon.resolve()},1000);
          });
          }).fail(function (err) {
            return dfdTaxon.resolve();
          });
      }, 
      // error
      function(e) {
       console.log('error in changeV 1.1 à 1.2');
       console.log(JSON.stringify(e));
      },
      // success
      function() {
       console.log("success 1.1 à 1.2 : "+app.db.version);
      }
			);
  // Sinon si la base de données de l'appli à mettre à jour est 1.0 
		} else if(app.db.version === "1.0") {
    var dfdTaxon = $.Deferred();
    deferreds.push(dfdTaxon);
      console.log('im a 1.0 user');	
      app.db.changeVersion("1.0", "1.2", 
        function(trans) {
         //do initial setup
          var dfd = $.Deferred();
          var arr = [];
          arr.push(runQuery('DROP TABLE Ttaxon',[]));
          arr.push(runQuery('DROP TABLE TvalTaxon_Criteria_values',[]));
          arr.push(runQuery('DROP TABLE Tpicture',[]));
          arr.push(runQuery('DROP TABLE TdefCriteria',[]));
          arr.push(runQuery('DROP TABLE TdefCriteria_values',[]));     
          arr.push(runQuery('alter table TdataObs_occurences add column scientificName',[]));

          $.when.apply(this, arr).then(function () {
            console.log('when finished dfd.resolve DROP TABLE');
            deferreds.push(app.dao.baseDAOBD.populate(new app.models.Taxon()));
            deferreds.push(app.dao.baseDAOBD.populate(new app.models.TaxonCaracValue()));
            deferreds.push(app.dao.baseDAOBD.populate(new app.models.EspeceCel()));
            deferreds.push(app.dao.baseDAOBD.populate(new app.models.Picture()));
            deferreds.push(app.dao.baseDAOBD.populate(new app.models.CaracteristiqueDef()));
            deferreds.push(app.dao.baseDAOBD.populate(new app.models.CaracteristiqueDefValue()));
          
            //test if data are already loaded
            //Si oui alors => pas de chargement des données en base
            $.when(app.dao.baseDAOBD.populate(new app.models.Taxon())).done(function (dta) {
              var arr = [];
              if (dta.rows.length == 0 ) {
                arr.push(loadXmlTaxa());
                arr.push(loadXmlEspCEL());
              }
              $.when.apply(this, arr).then(function () {
                console.log('when finished dfd.resolve test if data are loaded');
                return setTimeout(function(){ dfdTaxon.resolve()},1000);
              });
            }).fail(function (err) {
                console.log(err);
                return dfdTaxon.resolve();
            });

            var dfdCrit = $.Deferred();
            deferreds.push(dfdCrit);
          
            //test if data are already loaded
            //Si oui alors => pas de chargement des données en base
            $.when(runQuery("SELECT * FROM TvalTaxon_Criteria_values" , [])).done(function (dta) {
              var arr = [];
              if (dta.rows.length == 0 ) {
                arr.push(loadXmlCriteria());
              }
              $.when.apply(this, arr).then(function () {
                console.log('when finished dfd.resolve CRITERIA TAXON VALUES if data are loaded');
                return  dfdCrit.resolve();
              });
            }).fail(function (err) {
                console.log(err);
                return dfdCrit.resolve();
            });

            return  dfd.resolve();
          });

        }, 
        //used for error
        function(e) {
         console.log('error in changeV for v1.2');
         console.log(JSON.stringify(e));
        },
        //used for success
        function() {
         console.log('success in changeV for v1.2');
         console.log(app.db.version);
        }
      );			
		}
		
		console.log('database mise à jour');

  }catch(e) {
    console.log(JSON.stringify(e));
  }


//NS.UI.Form customize editors' template
var stringVersion  = navigator.userAgent.toString();
var stringVersionMatch = stringVersion.match(/4.1/i);
var intVersionMatch =  parseInt(stringVersionMatch);

NS.UI.Form.templateSrc.stacked = 
                '<form>' +
                '    <div class="form-content"></div>' +
                '    <div class="form-actions">' +
                '      <div id="footer" class="mm-fixed-bottom">'+
                '       <nav class="bottom-navbar" role="navigation">'+
                '         <div class="btn-group btn-group-justified">'+
                '           <input type="reset" class="btn btn-default btn-footer btn-footer-left"/>'+
                '           <input type="submit" class="btn btn-primary btn-footer btn-footer-right"/>'+
                '         </div>'+
                '       </nav>'+
                '     </div>	'+
                '     </div>' +
                '</form>';
  if (intVersionMatch < 4.1) {
    NS.UI.Form.editors.Text.templateSrc.stacked =
      '<div class="form-group  <%- data.name %>">' +
                    '    <label  for="<%- data.id %>"><% if (data.required) { %><b>*</b><% } %> <%- data.label %></label>' +
      '   <input class="form-control <%- data.name %>" type="text" id="<%- data.id %>" name="<%- data.name %>" value="<%- data.initialData %>" />' +
                    '    <div class="controls">' +   
                    '        <div class="help-inline"></div>' +
                    '        <div class="help-block"><% if (data.helpText) { %><%- data.helpText %><% } %></div>' +
                    '    </div>' +
                    '</div>'
    ;
    NS.UI.Form.editors.Select.templateSrc.stacked =
      '<div class="form-group">' +
                    '    <label ><% if (data.required) { %><b>*</b><% } %> <%- data.label %></label>' +
      '	<select class="form-control" id="<%- data.id %>" name="<%- data.name %>" <% if (data.multiple) { %> multiple="multiple"<% } %>>' +
                    '            <% _.each(data.options, function(group) {' +
                    '                var isGroup = group.label != "";' +
                    '                if (isGroup) { %><optgroup label="<%- group.label %>"><% }' +
                    '                _.each(group.options, function(opt) { %><option value="<%- opt.val %>"<% if (_.contains(data.initialData, opt.val)) { %> selected="selected"<% } %>><%- opt.label %></option><% });' +
                    '                if (isGroup) { %></optgroup><% }' +
                    '            }); %>' +
                    '        </select>' +
                    '    <div class="controls">' +     
                    '        <div class="help-inline"></div>' +
                    '        <div class="help-block"><% if (data.helpText) { %><%- data.helpText %><% } %></div>' +
                    '    </div>' +
                    '</div>';
  }else{
    NS.UI.Form.editors.Text.templateSrc.stacked =
                  '<div class="form-group input-text <%- data.name %>">' +
                  '<div class="input-group input-group-lg">'+
                  '   <span class="input-group-addon"><span class="glyphicon glyphicon-map-marker"></span></span>'+
                  '   <label  class="sr-only" for="<%- data.id %>"><% if (data.required) { %><b>*</b><% } %> <%- data.label %></label>' +
                  '   <input class="form-control input-lg <%- data.name %>" type="text" id="<%- data.id %>" name="<%- data.name %>" value="<%- data.initialData %>" placeholder="<%- data.label %>"/> ' +
                  ' </div>'+
                  '    <div class="controls">' +   
                  '        <div class="help-inline"></div>' +
                  '        <div class="help-block"><% if (data.helpText) { %><%- data.helpText %><% } %></div>' +
                  '    </div>' +
                  '</div>'
  ;
    NS.UI.Form.editors.Select.templateSrc.stacked =
    '<div class="form-group select">' +
                  ' <div class="input-group input-group-lg">'+
                  '     <span class="input-group-addon"><span class="glyphicon glyphicon-resize-full"></span></span>'+
                  '     <label class="sr-only" ><% if (data.required) { %><b>*</b><% } %> <%- data.label %></label>' +
                  '	    <select class="form-control input-lg" id="<%- data.id %>" name="<%- data.name %>" <% if (data.multiple) { %> multiple="multiple"<% } %>>' +
                  '            <% _.each(data.options, function(group) {' +
                  '                var isGroup = group.label != "";' +
                  '                if (isGroup) { %><optgroup label="<%- group.label %>"><% }' +
                  '                _.each(group.options, function(opt) { %><option value="<%- opt.val %>"<% if (_.contains(data.initialData, opt.val)) { %> selected="selected"<% } %>><%- opt.label %></option><% });' +
                  '                if (isGroup) { %></optgroup><% }' +
                  '            }); %>' +
                  '        </select>' +
                  ' </div>'+
                  '    <div class="controls">' +     
                  '        <div class="help-inline"></div>' +
                  '        <div class="help-block"><% if (data.helpText) { %><%- data.helpText %><% } %></div>' +
                  '    </div>' +
                  '</div>';
  }
}