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

	
app.views.IdentificationKeyView =  app.views.BaseView.extend({

  template: 'identification-page',
  
  initialize: function() {
    this.collection.bind("reset", this.render, this);
  },

  beforeRender: function() {
    this.collection.each(function(criteria) {
      this.insertView("#values-list", new app.views.IKCriteriaListItemView({model: criteria}));
    }, this);
  }

});

app.views.IKCriteriaListItemView =  app.views.BaseView.extend({

  template: 'items-list-criteria',

  initialize: function() {
    this.model.bind("reset", this.render, this);
    this.model.bind("change", this.render, this);
  },

});
