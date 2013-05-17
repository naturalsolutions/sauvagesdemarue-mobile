"use strict";
Backbone.Collection.prototype.save = function (options) {
  $.each(this.models, function(index, model) {
     model.save();
  });
};

Backbone.Model.prototype.initialize = Backbone.Collection.prototype.initialize = function () {
  var subobjects = _.map(this.schema, function(field, key) {
    if (field.type === 'NestedModel' ) return  key;  
  });
  subobjects = _.filter(subobjects, function(key){ return (typeof(key) !== 'undefined') ; }); 
  if (typeof(subobjects) !== 'undefined') {
    var self = this;
    $.each(subobjects, function(index, subPropertyName) {
      if (self.schema[subPropertyName].fetch) {
        var subPropertyModel = new app['models'][self.schema[subPropertyName].className]();
        subPropertyModel.filters = new Object();
        if ( self.get(self.schema[subPropertyName].pk)) {
          subPropertyModel.filters[self.schema[subPropertyName].fk] =  self.get(self.schema[subPropertyName].pk);
          subPropertyModel.fetch({
            success: function(data) {
              self.set(subPropertyName,subPropertyModel);
            }
          });
        }
      }
    });    
  }
};

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
Backbone.Collection.prototype.multiValueWhere =  function(attrs, first) {
  if (_.isEmpty(attrs)) return first ? void 0 : [];
  return this[first ? 'find' : 'filter'](function(model) {
    for (var key in attrs) {
      for (var ind in attrs[key] ) {
        if (attrs[key][ind] === model.get(key)) return true;
      }
    }
    return false;
  });
};

// -------------------------------------------------- The Models ---------------------------------------------------- //
// The Taxon Model
app.models.Taxon = Backbone.Model.extend({
  //@TODO reflechir et implémenter aux actions en cascade
  //delete :  true/false
  table : 'Ttaxon',
  schema: {
    taxonId: { title:'taxonId',type:'Number', sqltype:'INTEGER', required: true, sqlconstraints:'PRIMARY KEY'},
    fk_group: { title:'fk_group', sqltype:'INTEGER'},
    commonName: { title:'commonName', type:'Text', sqltype:'NVARCHAR(200)',  required: true },
    scientificName: { title:'scientificName', type:'Text', sqltype:'NVARCHAR(500)',  required: true },
    description: { title:'description', type:'TextArea', sqltype:'text'},
    picture : { title:'picture', type:'Text', sqltype:'NVARCHAR(500)',  required: true},
    pictures : {type: 'NestedModel',  model: 'app.models.PicturesCollection',className : 'PicturesCollection' , pk : 'taxonId', fk: 'fk_taxon', fetch: true, save:true},
    caracValues : {type: 'NestedModel', model: 'app.models.TaxonCaracValuesCollection', className : 'TaxonCaracValuesCollection', pk : 'taxonId', fk: 'fk_taxon', fetch: true, save:true},
  },
  
  dao: app.dao.TaxonDAO,
  
});
// The TaxonCollection Model
app.models.TaxonCollection = Backbone.Collection.extend({

  dao: app.dao.TaxonDAO,
//@TODO reflechir et implémenter aux actions en cascade
  //delete :  true/false
  /*subobjects:{
    pictures : {type: 'app.models.PicturesCollection',className : 'PicturesCollection' , pk : 'taxonId', fk: 'fk_taxon', fetch: true, save:true},
    caracValues : {type: 'app.models.TaxonCaracValuesCollection', className : 'TaxonCaracValuesCollection', pk : 'taxonId', fk: 'fk_taxon', fetch: true, save:true},
  },*/
  table : 'Ttaxon',
  schema: {
    taxonId: { title:'taxonId',type:'Number', sqltype:'INTEGER', required: true, sqlconstraints:'PRIMARY KEY'},
    fk_group: { title:'fk_group', sqltype:'INTEGER'},
    commonName: { title:'commonName', type:'Text', sqltype:'NVARCHAR(200)',  required: true },
    scientificName: { title:'scientificName', type:'Text', sqltype:'NVARCHAR(500)',  required: true },
    description: { title:'description', type:'TextArea', sqltype:'text'},
    picture : { title:'picture', type:'Text', sqltype:'NVARCHAR(500)',  required: true},
    pictures : {type: 'NestedModel',  model: 'app.models.PicturesCollection',className : 'PicturesCollection' , pk : 'taxonId', fk: 'fk_taxon', fetch: true, save:true},
    caracValues : {type: 'NestedModel', model: 'app.models.TaxonCaracValuesCollection', className : 'TaxonCaracValuesCollection', pk : 'taxonId', fk: 'fk_taxon', fetch: true, save:true},
  },
  
  model: app.models.Taxon,
  
});


// The Taxon Model
app.models.TaxonLite = Backbone.Model.extend({
  
  //@TODO reflechir et implémenter aux actions en cascade
  //delete :  true/false
  table : 'Ttaxon',
  schema: {
    taxonId: { title:'taxonId',type:'Number', sqltype:'INTEGER', required: true, sqlconstraints:'PRIMARY KEY'},
    fk_group: { title:'fk_group', sqltype:'INTEGER'},
    commonName: { title:'commonName', type:'Text', sqltype:'NVARCHAR(200)',  required: true },
    scientificName: { title:'scientificName', type:'Text', sqltype:'NVARCHAR(500)',  required: true },
    picture : { title:'picture', type:'Text', sqltype:'NVARCHAR(500)',  required: true},
   },
  
  dao: app.dao.TaxonDAO,
  
});
// The TaxonCollection Model
app.models.TaxonLiteCollection = Backbone.Collection.extend({

  dao: app.dao.TaxonDAO,
//@TODO reflechir et implémenter aux actions en cascade
  //delete :  true/false
  /*subobjects:{
    pictures : {type: 'app.models.PicturesCollection',className : 'PicturesCollection' , pk : 'taxonId', fk: 'fk_taxon', fetch: true, save:true},
    caracValues : {type: 'app.models.TaxonCaracValuesCollection', className : 'TaxonCaracValuesCollection', pk : 'taxonId', fk: 'fk_taxon', fetch: true, save:true},
  },*/
  table : 'Ttaxon',
  schema: {
    taxonId: { title:'taxonId',type:'Number', sqltype:'INTEGER', required: true, sqlconstraints:'PRIMARY KEY'},
    fk_group: { title:'fk_group', sqltype:'INTEGER'},
    commonName: { title:'commonName', type:'Text', sqltype:'NVARCHAR(200)',  required: true },
    scientificName: { title:'scientificName', type:'Text', sqltype:'NVARCHAR(500)',  required: true },
    picture : { title:'picture', type:'Text', sqltype:'NVARCHAR(500)',  required: true},
   },
    
  model: app.models.TaxonLite,
  
});


// The Picture Model
app.models.Picture =Backbone.Model.extend({

  table : 'Tpicture',
  schema: {
    fk_taxon: { title:'fk_taxon', type:'Number', sqltype:'INTEGER', required: true},
    path : { title:'path', type:'Text', sqltype:'NVARCHAR(500)',required: true},
    description: { title:'description',type:'TextArea', sqltype:'text'},
    author: { title:'author', type:'Text', sqltype:'NVARCHAR(500)',},
  },
  
  dao: app.dao.PictureDAO,
 
});
// The Picture Collections
app.models.PicturesCollection =Backbone.Collection.extend({

  model : app.models.Picture,

  table : 'Tpicture',
  schema: {
    fk_taxon: { title:'fk_taxon', type:'Number', sqltype:'INTEGER', required: true},
    path : { title:'path', type:'Text', sqltype:'NVARCHAR(500)',required: true},
    description: { title:'description',type:'TextArea', sqltype:'text'},
    author: { title:'author', type:'Text', sqltype:'NVARCHAR(500)',},
  },
  
  dao: app.dao.PictureDAO,
  
});
// The Taxon carac value Model
app.models.TaxonCaracValue = Backbone.Model.extend({

  table : 'TvalTaxon_Criteria_values',
  schema: {
    fk_taxon: { title:'fk_taxon', type:'Number', sqltype:'INTEGER', required: true},
    fk_carac_value : { title:'fk_carac_value', type:'Text', sqltype:'NVARCHAR(20)', required: true},
  },
  
  dao: app.dao.TaxonCaracValueDAO,

});
// The Taxon carac value Collection
app.models.TaxonCaracValuesCollection =Backbone.Collection.extend({
  
  table : 'TvalTaxon_Criteria_values',
  schema: {
    fk_taxon: { title:'fk_taxon', type:'Number', sqltype:'INTEGER', required: true},
    fk_carac_value : { title:'fk_carac_value', type:'Text', sqltype:'NVARCHAR(20)', required: true},
  },
    
  dao: app.dao.TaxonCaracValueDAO,
  
  model : app.models.TaxonCaracValue,
    
});

app.models.Groupe = Backbone.Model.extend({
  
  table : 'Ttaxa_group',
  schema: {
    groupId: { title:'groupId', type:'Number', sqltype:'INTEGER' , sqlconstraints:'PRIMARY KEY'},
    name: { title:'name',type:'Text'},
    description: { title:'description', type:'TextArea'},
    picture : { title:'picture',type:'Text', sqltype:'NVARCHAR(500)', required: true},
  },
  
  dao: app.dao.GroupeDAO,
 
});

// The CaracteristiqueDef Model
app.models.CaracteristiqueDef = Backbone.Model.extend({
 /* subobjects:{
    defCaracValues : {type: 'app.models.CaracteristiqueDefValuesCollection',className : 'CaracteristiqueDefValuesCollection' , pk : 'criteraId', fk: 'fk_criteria', fetch: true, save:true},
  },*/
  table : 'TdefCriteria',
  schema: {
    criteraId: { title:'criteraId', type:'Text', sqltype:'NVARCHAR(20)', sqlconstraints:'PRIMARY KEY'},
    name: { title:'name',type:'Text'},
    description: { title:'description', type:'TextArea'},
    fk_group: { title:'fk_group',  type:'Number', sqltype:'INTEGER'},
    defCaracValues : {type: 'NestedModel',  model: 'app.models.CaracteristiqueDefValuesCollection',className : 'CaracteristiqueDefValuesCollection' , pk : 'criteraId', fk: 'fk_criteria', fetch: true, save:true},
  },
  
  
  dao: app.dao.CaracteristiqueDefDAO,
     
});

// The CaracteristiqueDef Collection
app.models.CaracteristiqueDefsCollection =Backbone.Collection.extend({
  
  dao: app.dao.CaracteristiqueDefDAO,
  
  model : app.models.CaracteristiqueDef,
  
  table : 'TdefCriteria',
  schema: {
    criteraId: { title:'criteraId', type:'Text', sqltype:'NVARCHAR(20)', sqlconstraints:'PRIMARY KEY'},
    name: { title:'name',type:'Text'},
    description: { title:'description', type:'TextArea'},
    fk_group: { title:'fk_group',  type:'Number', sqltype:'INTEGER'},
    defCaracValues : {type: 'NestedModel',  model: 'app.models.CaracteristiqueDefValuesCollection',className : 'CaracteristiqueDefValuesCollection' , pk : 'criteraId', fk: 'fk_criteria', fetch: true, save:true},
  },
 
});

// The CaracteristiqueDefValue Model
app.models.CaracteristiqueDefValue = Backbone.Model.extend({

  table : 'TdefCriteria_values',
  schema: {
    criteraValueId: { title:'criteraValueId', type:'Text',sqltype:'NVARCHAR(20)', sqlconstraints:'PRIMARY KEY'},
    fk_criteria: { title:'fk_criteria', type:'Text',sqltype:'NVARCHAR(20)', required: true},
    name: { title:'name', type:'Text'},
    picture : { title:'picture',type:'Text', sqltype:'NVARCHAR(500)', required: true},
  },
  dao: app.dao.CaracteristiqueDefValueDAO,
  
  
});
// The CaracteristiqueDefValue Collection
app.models.CaracteristiqueDefValuesCollection =Backbone.Collection.extend({
  
  dao: app.dao.CaracteristiqueDefValueDAO,
  
  model : app.models.CaracteristiqueDefValue,
  
  table : 'TdefCriteria_values',
  schema: {
    criteraValueId: { title:'criteraValueId', type:'Text',sqltype:'NVARCHAR(20)', sqlconstraints:'PRIMARY KEY'},
    fk_criteria: { title:'fk_criteria', type:'Text',sqltype:'NVARCHAR(20)', required: true},
    name: { title:'name', type:'Text'},
    picture : { title:'picture',type:'Text', sqltype:'NVARCHAR(500)', required: true},
  },
  
  
});
