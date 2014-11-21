"use strict";


// -------------------------------------------------- Utilities ---------------------------------------------------- //
  // Spinner management (visual feedback for ongoing requests)
  //$(document).ajaxStart(function () { $('body').addClass('loading disabled'); });
  //$(document).ajaxStop(function () { $('body').removeClass('loading disabled'); });

// Ensemble des méthodes permettant de manipuler les données en dehors des modèles/collection au sens Backbone
// Correspond à des requêtes SQL customisée et optimisée
app.utils.queryData = {
  //count taxon nb
  getFilterTaxonIdList: function(filters, exact, tag) {
    var dfd = $.Deferred();
    var sqlWere = ' WHERE ';
    var parameters = new Array();
    $.each(filters, function(index, arg) {
      sqlWere = sqlWere +  ' fk_carac_value =  ? OR';
      parameters.push(""+arg+"");
    });
    sqlWere = sqlWere.slice(0, -3);
    var sqlGroupBy = ' GROUP BY fk_taxon ' ;
    if (exact == true) {
      sqlGroupBy =  sqlGroupBy + ' HAVING count(*) = '+ filters.length;
    }
    else {
      sqlGroupBy =  sqlGroupBy + '  ORDER BY count(*) ';
    }
    if (tag !== undefined) {
      var sqlIn =  ' AND  fk_taxon IN ('+ tag +')';
      var sql = 'SELECT DISTINCT fk_taxon, count(*) as count FROM TvalTaxon_Criteria_values ' + sqlWere + sqlIn + sqlGroupBy;
    }else{
      var sql = 'SELECT DISTINCT fk_taxon, count(*) as count FROM TvalTaxon_Criteria_values ' + sqlWere + sqlGroupBy;
    } 
    runQuery(sql, parameters).done(

      function(results){
          var len = results.rows.length,
            data = [],
            i = 0;
          for (; i < len; i = i + 1) {
            data[i] = results.rows.item(i);
          }
          
          return dfd.resolve(data);
      }
    );
    return dfd.promise();
  },
//getObservationsPacaWSFormated
getObservationsPacaWSFormated: function(id) {
  var dfd = $.Deferred();
  var parameters = new Array();
  var sql = "SELECT o.id as ido, p.id as idp, o.datetime as date,"
      +"begin_latitude|| ','|| begin_longitude|| ';'|| end_latitude|| ','|| end_longitude|| ';'|| cote AS station, "
      +"p.name AS lieudit, o.latitude, o.longitude, "
      +"o.scientificName as nom_sel, o.scientificName as nom_ret, o.fk_taxon as num_nom_sel, o.fk_taxon as num_nom_ret,"
      +"o.milieu, "
      +"o.notes, "
      +"o.photo as img,"
      +"p.begin_latitude as latitudeDebutRue,p.begin_longitude as longitudeDebutRue,p.end_latitude as latitudeFinRue,p.end_longitude as longitudeFinRue "
      +"FROM TdataObs_parcours p "
      +"INNER JOIN TdataObs_occurences o "
      +"ON p.id = o.fk_rue "
      +"WHERE (o.id IS NOT NULL AND p.state = 2) AND p.id = "+id+";"
  runQuery(sql, parameters).done(
    function(results){
        var len = results.rows.length,
          data = [],
          i = 0;
        for (; i < len; i = i + 1) {
          data[i] = results.rows.item(i);
        }
        return dfd.resolve(data);
    }
  );
  return dfd.promise();
},

  //Récupère les observations de l'identifiant de la rue passé en paramètre
  getObservationsTelaWSFormated: function(id) {
    var dfd = $.Deferred();
    var parameters = new Array();
    var sql = "SELECT o.id as ido, p.id as idp, strftime('%d/%m/%Y',COALESCE(o.datetime, p.begin_datetime)) as date,"
        +"begin_latitude|| ','|| begin_longitude|| ';'|| end_latitude|| ','|| end_longitude|| ';'|| cote AS station, "
        +"p.name AS lieudit, o.latitude, o.longitude, "
        +"p.name AS adresse,"
        +"p.cote AS coteRue,"
        +"o.scientificName as nom_sel, o.scientificName as nom_ret, o.fk_taxon as num_nom_sel, o.fk_taxon as num_nom_ret,"
        +"o.milieu, "
        +"o.notes, "
        +"o.photo as img,"
        +"p.begin_latitude as latitudeDebutRue,p.begin_longitude as longitudeDebutRue,p.end_latitude as latitudeFinRue,p.end_longitude as longitudeFinRue "
        +"FROM TdataObs_parcours p "
        +"INNER JOIN TdataObs_occurences o "
        +"ON p.id = o.fk_rue "
        +"WHERE (o.id IS NOT NULL AND p.state = 1) AND p.id = "+id+";"
    runQuery(sql, parameters).done(
      function(results){
          var len = results.rows.length,
            data = [],
            i = 0;
          for (; i < len; i = i + 1) {
            data[i] = results.rows.item(i);
          }
          return dfd.resolve(data);
      }
    );
    return dfd.promise();
  },

  //Récupère toutes les observations
  getObservationsTelaWSFormatedAll: function() {
    var dfd = $.Deferred();
    var parameters = new Array();
    var sql = "SELECT o.id as ido, p.id as idp, strftime('%d/%m/%Y',COALESCE(o.datetime, p.begin_datetime)) as date,"
        +"begin_latitude|| ','|| begin_longitude|| ';'|| end_latitude|| ','|| end_longitude|| ';'|| cote AS station, "
        +"p.name AS lieudit, o.latitude, o.longitude, "
        +"p.name AS adresse,"
        +"p.cote AS coteRue,"
        +"o.scientificName as nom_sel, o.scientificName as nom_ret, o.fk_taxon as num_nom_sel, o.fk_taxon as num_nom_ret,"
        +"o.milieu, "
        +"o.notes, "
        +"o.photo as img,"
        +"p.begin_latitude as latitudeDebutRue,p.begin_longitude as longitudeDebutRue,p.end_latitude as latitudeFinRue,p.end_longitude as longitudeFinRue "
        +"FROM TdataObs_parcours p "
        +"INNER JOIN TdataObs_occurences o "
        +"ON p.id = o.fk_rue "
        +"WHERE (o.id != -1 AND p.state = 1) OR (o.id IS NOT NULL AND p.state = 1)";
    runQuery(sql, parameters).done(
      function(results){
          var len = results.rows.length,
            data = [],
            i = 0;
          for (; i < len; i = i + 1) {
            data[i] = results.rows.item(i);
          }
          return dfd.resolve(data);
      }
    );
    return dfd.promise();
  },

  findByName: function(key, callback) {
   var dfd = $.Deferred();
   var parameters = new Array();
  //	this.db.transaction(function(tx) {
    var sql = 
     "SELECT num_nom, nom_sci " +
     "FROM TespeceCel " + 
     "WHERE nom_sci LIKE ? " +
     "ORDER BY nom_sci";
  
   runQuery(sql, [key + '%']).done(
       function(results){
           var len = results.rows.length,
             data = [],
             i = 0;
           for (; i < len; i = i + 1) {
             data[i] = results.rows.item(i);
           }
           return dfd.resolve(data);
       }
     );
     return dfd.promise();
  
  }
}


/**
 * WebDataBase DAO base code
 */

app.dao.baseDAOBD = {
  
  getDaoMetadata : function (model) {
    this.table = (typeof(model.constructor.table) === 'undefined') ?  model.model.table :  model.constructor.table;
    this.schema = (typeof(model.constructor.schema) === 'undefined') ?  model.model.schema :  model.constructor.schema;
  },
  
  buildSQLTable: function(model) {
    this.getDaoMetadata(model);
    //var schema = (options.initialData) ? options.initialData : {};
    //Construction de la requête SQL
    var sql = 'CREATE TABLE  IF NOT EXISTS ' + this.table+ ' ( ';
    var pKisDefined = false;
    _.each(this.schema, function( field, index) {
      //Set the col type
      var type = '' ;
      if (field.sqltype) type =field.sqltype ; 
      else type =app.utils.bbforms2sqlite.dataType[field.type]; 
      if  (type !== 'NOT_AVAILABLE') {
        //Set the col constraints
        var constraint  = field.constraints; 
        if (typeof(field.constraints) === 'undefined') {
          constraint  = '';
        }
				//@TODO improve code
        if (field.required) constraint  = constraint + app.utils.bbforms2sqlite.constraints.required;
        if (field.autoincrement) constraint  = constraint + app.utils.bbforms2sqlite.constraints.autoincrement;
        
        if (field.sqlconstraints === 'PRIMARY KEY') {
					constraint = 'PRIMARY KEY  '+constraint;
          pKisDefined = true;
        }
        
        sql = sql + index + ' ' + type  + ' ' + constraint + ',';
      }
    });
    if (!pKisDefined ) sql = sql + 'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT ,';
    sql = sql.slice(0, -1);
    sql = sql + ')';
    return sql;
  },


	populateTruncateSQLTable: function(model){
		var sql = 'DELETE FROM ' + this.table;
		return runQuery(sql)  ;
	},

  getSQLFieldList: function()  {
   var field =  _.map(this.schema, function(field, key) {
      if ( ((field.sqltype) || (app.utils.bbforms2sqlite.dataType[field.type] !=='NOT_AVAILABLE' )) && ((field.autoincrement=== false )  || (!field.autoincrement)  ) )  {
				return  key;  
			}
    });
    field = _.filter(field, function(key){ return (typeof(key) !== 'undefined') ; }); 
    return field;
  },
  
  buildSQLInsert: function(model) {
    this.getDaoMetadata(model);
    //Construction de la requête SQL
    var sql = ' INSERT INTO ' + this.table + ' ( ';
    var field = this.getSQLFieldList(model);
    sql = sql + field.join(',') + ') VALUES (' ;
    sql = sql + Array(field.length+1).join('?,');
    sql = sql.slice(0, -1);
    sql = sql + ')';
    return sql;
  },
  
  buildSQLUpdate: function(model) {
    this.getDaoMetadata(model);
    //Construction de la requête SQL
    var sql = ' UPDATE ' + this.table + '  SET ';
    var field = this.getSQLFieldList(model);
    sql = sql + field.join('= ? ,') + ' =? ' ;
    //Find PK 
    sql = sql +  ' WHERE id = ? ';
    return sql;
  },
 
  populate: function(model, callback) {
    //Run sql create query and return defered object
    return runQuery(this.buildSQLTable(model) , []);
  },

  create: function(model, callback) {
    this.getDaoMetadata(model);
    var self =this;
    //First save subModel data
    var subobjects = _.map(this.schema, function(field, key) {
      if (field.type === 'NestedModel' ) return  key;  
    });
    subobjects = _.filter(subobjects, function(key){ return (typeof(key) !== 'undefined') ; }); 
    if (subobjects.length >0) {
      $.each(subobjects, function(index, data) {
        if (self.schema[data].save) {
          var subValues = model.get(data);
          if (typeof(subValues) !== 'undefined')  subValues.save();
        }
      });    
    }
    var sql = self.buildSQLInsert(model);
    var values = _.map(self.getSQLFieldList(model), function(field){ return model.get(field); });
    //Return a defered object
    return runQuery(sql , values);
  },

  update: function(model, callback) {
    this.getDaoMetadata(model);
    var self =this;
    //First save subModel data
    var subobjects = _.map(this.schema, function(field, key) {
      if (field.type === 'NestedModel' ) return  key;  
    });
    subobjects = _.filter(subobjects, function(key){ return (typeof(key) !== 'undefined') ; }); 
    if (subobjects.length >0) {
      $.each(subobjects, function(index, data) {
        if (self.schema[data].save) {
          var subValues = model.get(data);
          if (typeof(subValues) !== 'undefined')  subValues.save();
        }
      });    
    }
    var sql = self.buildSQLUpdate(model);
    var values = _.map(self.getSQLFieldList(model), function(field){ return model.get(field); });
		values = values.concat([model.get('id')]);
      //console.log(values);
      //Return a defered object
    return runQuery(sql , values);
  },
  
  findAll: function(model, callback) { 
    this.getDaoMetadata(model);
    var self = this;
    this.db.transaction(
      function(tx) {
        var selectField = _.filter(_.keys(self.schema), function(key){ return (self.schema[key].type !== 'NestedModel') ; }).join(','); 
        var sql = 'SELECT '+selectField+' FROM '+self.table+' LIMIT 500 ';
  
        tx.executeSql(sql,[], function(tx, results) {
          var len = results.rows.length,
            data = [],
            i = 0;
          for (; i < len; i = i + 1) {
            data[i] = results.rows.item(i);
          }
          callback(data);
        });
      },
      function(tx, error) {
          console.log(tx);
      }
    );
  },


  findWithCriteria :  function(model, callback) {
    this.getDaoMetadata(model);
    var self = this;
    this.db.transaction(
      function(tx) {
        //Récupération des arguments
        var args = (((model.attributes) && (! $.isEmptyObject( model.attributes)))  ? model.attributes: model.filters)
        var sqlWere = ' WHERE ';
        var parameters = new Array();
        //Mise en place du filtre WHERE et du tableau des valeurs
        $.each(args, function(index, arg) {
          //@TODO join query for nested model criteria
          if ((self.schema[index]['type'] !== 'NestedModel') && (typeof(arg) !== 'undefined')) {
            sqlWere = sqlWere +  ' ' + index + ' =  ? AND';
            parameters.push(arg);
          }
        });
        sqlWere = sqlWere.slice(0, -3);
        
        var selectField = _.filter(_.keys(self.schema), function(key){ return (self.schema[key].type !== 'NestedModel') ; }).join(','); 
        var sql = 'SELECT '+selectField+' FROM '+self.table+' ' + sqlWere + ' LIMIT 500 ';
        
        tx.executeSql(sql,parameters, function(tx, results) {
          var len = results.rows.length,
            data = [],
            i = 0;
          for (; i < len; i = i + 1) {
            data[i] = results.rows.item(i);
          }
          //@TODO test if collection or model
          if (data.length === 1) data = data[0]
          //Charger les données des subviews
          callback(data);
        });
      },
      function(tx, error) {
          console.log(tx);
      }
    );
  },

}

/**
 * The Template Loader. Used to asynchronously load templates located in separate .html files
 */

app.utils.templateLoader = {
    templates: {},

    load: function(names) {
      //var deferreds = [], self = this;
      var self = this;
      $.each(names, function(index, name) {
          deferreds.push($.get('tpl/' + name + '.html', function(data) {
              console.log('load ' + name);
              self.templates[name] = data;
          }));
      });

      //$.when.apply(null, deferreds).done(callback);
    },

    // Get template by name from hash of preloaded templates
    get: function(name) {
        return this.templates[name];
    }

};

/**
 * Conversion type backbone form à sqlite
 */

app.utils.bbforms2sqlite= {
  dataType : {
    'Text': 'VARCHAR(250)',
    'Number': 'REAL',
    'Password': 'VARCHAR(250)',
    'TextArea':'TEXT',
    'Checkbox':'NOT_AVAILABLE',
    'Checkboxes':'NOT_AVAILABLE',
    'Hidden':'NOT_AVAILABLE',
    'Select':'NOT_AVAILABLE',
    'Radio':'NOT_AVAILABLE',
    'Object':'NOT_AVAILABLE',
    'NestedModel':'NOT_AVAILABLE',
    'Date': 'DATE',
    'DateTime': 'DATETIME',
    'List': 'NOT_AVAILABLE',
    'Boolean':'INTEGER',
  },
  constraints: {
    'required' : 'NOT NULL', 
		'autoincrement':'AUTOINCREMENT',
  },  
}

/**
 * Formatage Date
 */

Date.prototype.format = function(format) {
  var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(),    //day
    "h+" : this.getHours(),   //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
    "S" : this.getMilliseconds() //millisecond
  }

  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
}


/**
 * PLugin MMENU configuration spécifique
 */

$("#menu").mmenu({
  classes: "mm-slide",
});
$('#menu').mmenu().on('opening.mm',function(){
  $('body').removeClass('pad-bottom-top');
  $('#content').addClass('disabled  add-margin-top');
  $('.navbar-header').children().not('.open-menu').addClass('disabled');
  $('#languette.languette-right').addClass('right-cent-pour-cent');
  $('#languette.languette-left').css({'position' : 'absolute'});
  $('#footer').addClass('width-cent-pour-cent');
  $('.navbar-fixed-top').addClass('right-inherit');
});
//Ajoute un icon refresh si il y a une rue terminée qui contient des obs non envoyées.
$('#menu').mmenu().on('opened.mm',function(){
  app.utils.queryData.getObservationsTelaWSFormatedAll()
    .done(function(data) {
        if (data.length !== 0 && $('#menu #menu-item-my-obs').has('#flagObs').length === 0) {
          $('#menu #menu-item-my-obs .flag-container').after("<span id='flagObs' class='glyphicon glyphicon-refresh pull-right'></span>");  
        }else if(data.length === 0 && $('#menu #menu-item-my-obs').has('#flagObs').length === 1){
          $('#flagObs').remove();
        }
    });
});

$('#menu').mmenu().on('closed.mm',function(){
    var pageHome = $('#content').children().is('#home-page-content');
    if (! pageHome) {
      $('body').addClass('pad-bottom-top');
    }
    $('#content').removeClass('disabled add-margin-top');
    $('.navbar-header').children().not('.open-menu').removeClass('disabled');
    $('#languette.languette-right').css({'position' : 'fixed'}).removeClass('right-cent-pour-cent');
    $('#languette.languette-left').css({'position' : 'fixed'});
    $('.navbar-fixed-top').removeClass('right-inherit');
});

$('.open-menu').click(function(){
    $("#menu").trigger("open");
  }
);
//Pour contourner le problème des liens href qui ne fonctionnent pas avec le menu jquery.mmenu
$('#menu-item-home').click(function(){
  app.route.navigate('', {trigger: true, replace: true});
  $("#menu").trigger("close");
});
$('#menu-item-my-obs').click(function(){
  app.route.navigate('myObservation', {trigger: true, replace: true});
  $("#menu").trigger("close");
});
$('#menu-item-je-participe').click(function(){
  app.route.navigate('addParcours', {trigger: true, replace: true});
  $("#menu").trigger("close");
});
$('#menu-item-ou-suis-je').click(function(){
  app.route.navigate('ouSuisJe', {trigger: true, replace: true});
  $("#menu").trigger("close");
});
$('#menu-item-credits').click(function(){
  app.route.navigate('credits', {trigger: true, replace: true});
  $("#menu").trigger("close");
});
$('#menu-item-aide').click(function(){
  app.route.navigate('aide', {trigger: true, replace: true});
  $("#menu").trigger("close");
});
$('#menu-item-utilisateur').click(function(){
  app.route.navigate('utilisateur', {trigger: true, replace: true});
  $("#menu").trigger("close");
});
$('#menu-item-region').click(function(){
  if (typeof app.globals.currentrue !== 'undefined') {
    if (app.globals.currentrue.get('name') !== undefined) {
         var msg = _.template(
                  "<form role='form form-inline'>"+
                    "<p>Vous devez terminer votre rue pour accèder à cette partie de l'application.</p>"+				
                     "<button type='submit'  class='btn btn-jaune pull-right'>Terminer</button>"+
                     "<button type='reset'  class='btn btn-gris'>Annuler</button>"+
                    "</form>"					
                   );
         sauvages.notifications.SortieProtocol(msg());
    }else{
    app.route.navigate('region',{trigger: true, replace: true});
    $("#menu").trigger("close");
    }
  }else{
    app.route.navigate('region',{trigger: true, replace: true});
    $("#menu").trigger("close");
  }
});

/**
 * Fonctions génériques 
 */

function checkConnection() {

  if (navigator.connection) {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'inconnu';
    states[Connection.ETHERNET] = 'ethernet';
    states[Connection.WIFI]     = 'wifi';
    states[Connection.CELL_2G]  = '2G';
    states[Connection.CELL_3G]  = '3G';
    states[Connection.CELL_4G]  = '4G';
    states[Connection.CELL]     = 'Cell';
    states[Connection.NONE]     = 'none';

    return states[networkState];
  }else{
    return navigator.onLine;
  }
}

function findIdToTargetEvent(event){
				var ctarget = $(event.currentTarget);
				var idCurrentTarget= parseInt(ctarget.context.id);
				return idCurrentTarget;		
};

function capitaliseFirstLetter(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
};

function validatorsEmail(value) {
				var regex = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
				var flag = regex.test(value);
				return flag;
};


/**
 * Cordova plugin Push notification
 */

var pushNotificationService = function(){
				var pushNotification;
    // fix bug onNotification is not defined
    window.onNotification = onNotification;

    //document.addEventListener("backbutton", function(e){
    //  $("#app-status-ul").append('<li>backbutton event received</li>');		
    //  if( $("#home").length > 0){
    //    // call this to get a new token each time. don't call it to reuse existing token.
    //    //pushNotification.unregister(successHandler, errorHandler);
    //    e.preventDefault();
    //    navigator.app.exitApp();
    //  }else{
    //    navigator.app.backHistory();
    //  }
    //}, false);			
    try { 
      pushNotification = window.plugins.pushNotification;
      if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos' ) {
        pushNotification.register(successHandler, errorHandler, {"senderID":"944655915307","ecb":"onNotification"});		// required!
      } else {
        pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
      }
    }
    catch(err) { 
     var txt="There was an error on this page.\n\n"; 
      txt+="Error description: " + err.message + "\n\n"; 
      alert(txt); 
    }
				
				// handle APNS notifications for iOS
				function onNotificationAPN(e) {
						if (e.alert) {
        // showing an alert also requires the org.apache.cordova.dialogs plugin
        navigator.notification.alert(e.alert);
						}
						if (e.sound) {
									// playing a sound also requires the org.apache.cordova.media plugin
									var snd = new Media(e.sound);
									snd.play();
						}
						if (e.badge) {
									pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
						}
				}
				
    var confirmedGcmNotification = true;

				// handle GCM notifications for Android
				function onNotification(e) {
						switch( e.event ){
								case 'registered':
										if ( e.regid.length > 0 ){
												// Your GCM push server needs to know the regID before it can push to this device
            // here is where you might want to send it the regID for later use.
            var json = {
              'token' : e.regid, 
              'type' : device.platform.toLowerCase()
            };
            onRegisterServerNS(json);
            var erreurMsg;
										}
										break;	
								case 'message':
										// if this flag is set, this notification happened while we were in the foreground.
										// you might want to play a sound to get the user's attention, throw up a dialog, etc.
										if (e.foreground){
            navigator.notification.beep(2);
            cordova.exec(null, null, 'Notification', 'alert', [e.message, 'Notification', 'OK']);

												// on Android soundname is outside the payload. 
												// On Amazon FireOS all custom attributes are contained within payload
												var soundfile = e.soundname || e.payload.sound;
												// if the notification contains a soundname, play it.
												// playing a sound also requires the org.apache.cordova.media plugin
												var my_media = new Media("/android_asset/www/"+ soundfile);
												my_media.play();

										}else{	// otherwise we were launched because the user touched a notification in the notification tray.
												if (e.coldstart)
              cordova.exec(null, null, 'Notification', 'alert', [e.message, 'Notification', 'OK']);
												else{
                console.log('Background entered');
                if(confirmedGcmNotification) {
                    confirmedGcmNotification = false;
                    cordova.exec(PushSupport.gcmNotificationBackgroundAlert, null, 'Notification', 'alert', [e.message, 'Notification', 'OK']);
                }
              }
          }
										//$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
													//android only
										//$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
													//amazon-fireos only
									/*				$("#app-status-ul").append('<li>MESSAGE -> TIMESTAMP: ' + e.payload.timeStamp + '</li>');*/
									break;
									
								case 'error':
          console.log("error Push Notification" + e.msg);
          break;	
								default:
          console.log('Unknown, an event was received and we do not know what it is');
										break;
						}
				}

    function gcmNotificationBackgroundAlert() {
        confirmedGcmNotification = true;
    }
				
				function tokenHandler (result) {
      // Your iOS push server needs to know the token before it can push to this device
      // here is where you might want to send it the token for later use.
      var json = {
        'token' : result, 
        'type' : device.platform.toLowerCase()
      };
      onRegisterServerNS(json);     
				}
				
				function successHandler (result) {
      console.log('Succes notification '+ result);
				}
				
				function errorHandler (error) {
      console.log('Erreur notification '+ error);
				}
    function onRegisterServerNS(json){
    var server = "http://www.sauvagesdepaca.fr/mobile_data/push_notifications/";
    // var server = "http://192.168.1.50/Test/drupal7/Sauvages-PACA/mobile_data/push_notifications";
    var erreurMsg;
    //make ajax post to the application server to register device
    $.ajax(server, {
      type: "post",
      dataType: 'json',
      data: json,
      success: function(response) {
        console.log("###Successfully registered device.");
      },
      error : function(jqXHR, textStatus, errorThrown) {
        erreurMsg += 'Erreur Ajax de type : ' + textStatus + '\n' + errorThrown + '\n';
        try {
         var reponse = jQuery.parseJSON(jqXHR.responseText);
         if (reponse != null) {
          $.each(reponse, function (cle, valeur) {
           erreurMsg += valeur + '\n';
          });
         }
        } catch(e) {
         erreurMsg += 'L\'erreur n\'était pas en JSON.';
        }
        console.log(erreurMsg);
      }
    }); 
  }
};