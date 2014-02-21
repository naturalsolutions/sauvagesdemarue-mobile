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
        var path = this.prefix + this.template + '.html',
            dfd = $.Deferred();
        app.templates = app.templates || {};

        if (app.templates[path]) {
            dfd.resolve(app.templates[path]);
        } else {
            $.get(path, function (data) {
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

    // Can be overridden by child classes
    beforeRender: function () {},
    afterRender: function () {},

    render: function () {
        // Reset promise
        this._dfd = $.Deferred();

        // Give a chance to child classes to do something before render
        this.beforeRender();

        this.getTemplate().done(_.bind(function (tpl) {

            var data = this.serialize(),
                rawHtml = tpl(data),
                rendered,
                subviewsDfd = [];

            // Re-use nice "noel" trick from LayoutManager
            rendered = this.$el.html(rawHtml).children();
            this.$el.replaceWith(rendered);
            this.setElement(rendered);

            // Add sub-views
            _.each(this._views, function (viewList, selector) {
                var base = selector ? this.$el.find(selector) : this.$el;
                _.each(viewList, function (view) {
                    view.render().$el.appendTo(this);
                    subviewsDfd.push(view.promise());
                }, base);
            }, this);

            // Give a chance to child classes to do something after render
            try {
                var self = this;
                $.when.apply($, subviewsDfd).always(function() {
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

$().ready(function() {
  init();
}) ;
$(document).ready(function() {
    new NS.UI.NotificationList();
		new NS.UI.NotificationModalList();
});


function init(){
  // Customize Underscore templates behaviour: 'with' statement is prohibited in JS strict mode
  _.templateSettings['variable'] = 'data';
  window.deferreds = [];
		 

  //$("body").find("a").addClass("disabled");
  //$("body").append("<img id='dataloader-img' src='css/images/ajax-loader.gif'/>");
  
  // Spinner management (visual feedback for ongoing requests)
  $(document).ajaxStart(function () { $('body').addClass('loading disabled'); });
  $(document).ajaxStop(function () { $('body').removeClass('loading disabled'); });
  

		initDB();

  $.when.apply(null, deferreds).done(function() {
    console.log ('all deferreds finished');
    app.globals.cListAllTaxons = new app.models.TaxonLiteCollection();
    app.globals.cListAllTaxons.fetch({
       success: function(data) {
          app.route = new app.Router();
          Backbone.history.start();
          $("#menu").mmenu({
            classes: "mm-slide",
            dragOpen : true ,
          });
          //$('#dataloader-img').remove();
          //$("body").find("a").removeClass("disabled");
        }
    });
  });
  
}

function initDB(){
  console.log("initBD");
  // Initialisation des données 
  app.db = openDatabase("sauvage-PACA", "1.0", "db sauvage-PACA", 20*1024*1024);
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.User()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Taxon()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.TaxonCaracValue()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Picture()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.CaracteristiqueDef()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.CaracteristiqueDefValue()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Groupe()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.Context()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.OccurenceDataValue()));
  deferreds.push(app.dao.baseDAOBD.populate(new app.models.ParcoursDataValue()));

  var dfd = $.Deferred();
  deferreds.push(dfd);
  //test if data are already loaded
  //Si oui alors => pas de chargement des données en base
  $.when(runQuery("SELECT * FROM Ttaxon" , [])).done(function (dta) {
    var arr = [];
    if (dta.rows.length == 0 ) {      
      arr.push(loadXmlTaxa());
      arr.push(loadXmlCriteria());
    }
    $.when.apply(this, arr).then(function () {
      console.log('when finished dfd.resolve test if data are loaded');
      return  dfd.resolve();
    });
  }).fail(function (err) {
      return dfd.resolve();
  });



//NS.UI.Form customize editors' template
NS.UI.Form.templateSrc.stacked = 
                '<form>' +
                '    <div class="form-content"></div>' +
                '    <div class="form-actions">' +
                '      <div id="footer" class="mm-fixed-bottom">'+
                '       <nav class="bottom-navbar" role="navigation">'+
                '        <div class="btn-group btn-group-justified">'+
                '           <input type="reset" class="btn btn-default btn-footer btn-footer-left"/>'+
                '           <input type="submit" class="btn btn-primary btn-footer btn-footer-right"/>'+
                '     </div>'+
                '  </nav>'+
                '</div>	'+
                '       ' +
                '    </div>' +
                '</form>';
NS.UI.Form.editors.Text.templateSrc.stacked =
		'<div class="form-group">' +
                '    <label  for="<%- data.id %>"><% if (data.required) { %><b>*</b><% } %> <%- data.label %></label>' +
		'   <input class="form-control" type="text" id="<%- data.id %>" name="<%- data.name %>" value="<%- data.initialData %>" />' +
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
}