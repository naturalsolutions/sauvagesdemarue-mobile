"use strict";
Backbone.Collection.prototype.save = function (options) {
  $.each(this.models, function(index, model) {
     model.save();
  });
};

Backbone.Model.prototype.initialize = Backbone.Collection.prototype.initialize = function () {
  var schema = (typeof(this.constructor.schema) === 'undefined') ?  this.model.schema :  this.constructor.schema;
  var subobjects = _.map(schema, function(field, key) {
    if (field.type === 'NestedModel' ) return  key;  
  });
  subobjects = _.filter(subobjects, function(key){ return (typeof(key) !== 'undefined') ; }); 
  if (typeof(subobjects) !== 'undefined') {
    var self = this;
    $.each(subobjects, function(index, subPropertyName) {
      if (schema[subPropertyName].fetch) {
        var subPropertyModel = new app['models'][schema[subPropertyName].className]();
        subPropertyModel.filters = new Object();
        if ( self.get(schema[subPropertyName].pk)) {
          subPropertyModel.filters[schema[subPropertyName].fk] =  self.get(schema[subPropertyName].pk);
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

  
},{  
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
  model: app.models.Taxon,
});


// The Taxon Model
app.models.TaxonLite = Backbone.Model.extend({
  
  
},{
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

  model: app.models.TaxonLite,
  
});


// The Picture Model
app.models.Picture =Backbone.Model.extend({

 
},{
  table : 'Tpicture',
  schema: {
    id: { title:'id', type:'hidden', sqltype:'INTEGER', sqlconstraints:'PRIMARY KEY', autoincrement:true},
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
  
});
// The Taxon carac value Model
app.models.TaxonCaracValue = Backbone.Model.extend({

},{
  
  table : 'TvalTaxon_Criteria_values',
  schema: {
    id: { title:'id', type:'hidden', sqltype:'INTEGER', sqlconstraints:'PRIMARY KEY', autoincrement:true},
    fk_taxon: { title:'fk_taxon', type:'Number', sqltype:'INTEGER', required: true},
    fk_carac_value : { title:'fk_carac_value', type:'Text', sqltype:'NVARCHAR(20)', required: true},
  },
  
  dao: app.dao.TaxonCaracValueDAO,
});
// The Taxon carac value Collection
app.models.TaxonCaracValuesCollection =Backbone.Collection.extend({
 
  model : app.models.TaxonCaracValue,
    
});

app.models.Groupe = Backbone.Model.extend({
  
 
},{

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
 
     
},{
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
 
  model : app.models.CaracteristiqueDef,
  
});

// The CaracteristiqueDefValue Model
app.models.CaracteristiqueDefValue = Backbone.Model.extend({

},{
  
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

  model : app.models.CaracteristiqueDefValue,
});


// The CaracteristiqueDefValue Model
app.models.Context = Backbone.Model.extend({

},{
  table : 'Tcontext',
  schema: {
    id: { title:'id', type:'hidden', sqltype:'INTEGER', sqlconstraints:'PRIMARY KEY', autoincrement:true},
    fk_context: { title:'fk_context', type:'Text',sqltype:'NVARCHAR(500)', required: true},
    fk_object : { title:'fk_object',type:'Text', sqltype:'NVARCHAR(500)', required: true},
    context_type: { title:'context_type', type:'Text',sqltype:'NVARCHAR(500)', required: true},
    object_type : { title:'object_type',type:'Text', sqltype:'NVARCHAR(500)', required: true},
  },
  dao: app.dao.ContextDAO,
});

// The CaracteristiqueDefValue Collection
app.models.ContextCollection =Backbone.Collection.extend({
 
  model : app.models.Context,
  
});


// -------------------------------------------------- The Data observation Models ---------------------------------------------------- //


// The CaracteristiqueDefValue Model
app.models.OccurenceDataValue = Backbone.Model.extend({
	defaults: {
	  milieu:'Mur',
	},

},{
  table : 'TdataObs_occurences',
  schema: {
      id: { title:'id', type:'hidden', sqltype:'INTEGER', sqlconstraints:'PRIMARY KEY', autoincrement:true},
      latitude:{ type: 'hidden', title:'Latitude',sqltype:'REAL', required: true}, 
      longitude: { type: 'hidden', title:'Longitude',sqltype:'REAL', required: true} ,
      fk_taxon: { title:'fk_taxon',  type:'hidden', sqltype:'INTEGER' ,required: true},
      fk_rue: { title:'fk_rue',  type:'hidden', sqltype:'INTEGER' ,required: true},
      name_taxon: { title:'Espèce',  type:'Text',sqltype:'NVARCHAR(500)', required: true},
      milieu: { title:'Type de milieu', type: 'Select', sqltype:'NVARCHAR(500)',  options: [{val:'Pelouse', label:'Pelouse'},{val:'Mur', label:'Mur'},{val:'Plate bande', label:'Plate bande'},{val:'Pied d\'arbre', label:'Pied d\'arbre'} ,{val:'Fissure', label:'Fissure'}, {val:'Haie', label:'Haie'}, {val: 'Chemin', label:'Chemin'}],required: true },
      datetime : { type: 'hidden',  sqltype:'DATETIME' ,title:'datetime', required: true}, 
      photo: { 
				title:'Photo',  type:'Picture',sqltype:'NVARCHAR(500)', required: false, 
				optCamera:{'quality': 50,'correctOrientation': false,'encodingType': 'navigator.camera.EncodingType.JPEG', 'source': 'navigator.camera.PictureSourceType.CAMERA',	'targetWidth': 200,'destinationType': 'navigator.camera.DestinationType.FILE_URI'} 
			},
  }, 
  dao: app.dao.OccurenceDataValueDAO,
  verboseName: 'Occurence'
});
// The CaracteristiqueDefValue Collection
app.models.OccurenceDataValuesCollection =Backbone.Collection.extend({

  model : app.models.OccurenceDataValue,

});


// The CaracteristiqueDefValue Model
app.models.ParcoursDataValue = Backbone.Model.extend({
	defaults: {
		cote:'Pair',
	},
},{
  table : 'TdataObs_parcours',
   schema: {
		 //INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
			id: { title:'id', type:'hidden', sqltype:'INTEGER', sqlconstraints:'PRIMARY KEY', autoincrement:true},
      name: { title:'Nom de ma rue', type:'Text'},
			cote: { title:'Coté', type: 'Select', sqltype:'NVARCHAR(500)', options: [{val:'Pair', label:'Pair'}, {val:'Impair', label:'Impair'}, {val:'Les deux', label:'Les deux'}] },
      
      begin_latitude:{ type: 'hidden', sqltype:'REAL',title:'begin_latitude'}, 
      begin_longitude: { type: 'hidden',sqltype:'REAL', title:'begin_longitude'},
			begin_datetime : { type: 'hidden',  sqltype:'DATETIME' ,title:'begin_datetime'}, 
      end_latitude:{ type: 'hidden', sqltype:'REAL',title:'end_latitude'}, 
      end_longitude: { type: 'hidden',sqltype:'REAL', title:'end_longitude'},
			end_datetime : { type: 'hidden',  sqltype:'DATETIME' ,title:'end_datetime'}, 
  }, 
  dao: app.dao.ParcoursDataValueDAO,
  verboseName: 'Parcours'
});
// The CaracteristiqueDefValue Collection
app.models.ParcoursDataValuesCollection =Backbone.Collection.extend({

  model : app.models.ParcoursDataValue,
  
  dao: app.dao.ParcoursDataValueDAO,
  
  initialize: function() {
  },
  
   getNameRueById : function(fktaxon) {
    var selectedRue = this.findWhere( {'id': fktaxon});
    if(typeof(selectedRue) !== 'undefined'){
      return selectedRue.get('name');
    }
   
  } 

});


