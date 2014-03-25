"use strict";

// ----------------------------------------------- Database Initialisation ------------------------------------------ //

//************************************** Alimenter la base de données par le contenu des  XML taxons et criteres d'identification
// Insertion des données spécifiques pour des questions de perfs
// Taxon => Requête paramétrée (avec les ?) écrite en "dur", insertion valeur par valeur
// Critère/Picture => Requête écrite en "dur", insertion par lot avec un select + UNION pour chaque donnée
function loadXmlTaxa(){
  var sqlTaxon = 'INSERT INTO Ttaxon ( taxonId,fk_group,commonName,scientificName,description,picture) VALUES (?,?,?,?,?,?) ';

  var sqlInsertPicture = 'INSERT INTO Tpicture ( fk_taxon,path,description,author) ';
  var sqlInsertCriteria = 'INSERT INTO TvalTaxon_Criteria_values ( fk_taxon,fk_carac_value) ';
  
  var arrPictureData = [];
  var arrCriteriaData = [];
  
	var urlFile = "data/xml_taxons.xml";
  var dfd = $.Deferred();
  var arr = [];
  $.ajax( {
    type: "GET",
    url: urlFile,
    dataType: "xml",
    success: function(xml) {
      $(xml).find('TAXON').each(function(){	
        var oTaxon = new Array();
        oTaxon['taxonId'] = parseInt($(this).attr('id'));
        oTaxon['commonName'] =$(this).attr('value');
        oTaxon['scientificName']= $(this).attr('sciName');
        if (typeof ($(this).attr('groupe')) === 'undefined') { oTaxon['fk_group']= "";}
        else { 
          oTaxon['fk_group'] = parseInt( $(this).attr('groupe'));
        }
        oTaxon['description']=$(this).find('DESCRIPTION').text();
        // stocker le nom de fichier de la première photo dans la table Ttaxons
        if ( $(this).find('PICTURE').length >0) {
          oTaxon['picture'] = $(this).find('PICTURE:first').attr('media');
          var cPicture = new app.models.PicturesCollection();
          //Stockage des photos
          $(this).find('PICTURE').each(function(){
           arrPictureData.push(' SELECT '+oTaxon['taxonId'] +",'"+$(this).attr('media')+"',NULL ,'"+$(this).find('author:first').text()+"'");
          });
        }
        else {
          oTaxon['picture'] = 'NULL'; 
        }
        
        //Stockage des caractères associés aux taxons
        $(this).find('CRITERIAS VALUE').each(function(){
           arrCriteriaData.push(' SELECT '+oTaxon['taxonId'] +",'"+$(this).attr('code')+"' ");
        });
        arr.push(runQuery(sqlTaxon , [oTaxon['taxonId'],oTaxon['fk_group'],oTaxon['commonName'],
                oTaxon['scientificName'], oTaxon['description'], oTaxon['picture']]));
      });
      
      //Tip to simulate multiple row insert
      var i = 0;
      for (;  i < arrPictureData.length; i = i + 500) {
        var subarrPictureData = arrPictureData.slice(i,i+500); 
        arr.push(runQuery(sqlInsertPicture +' '+ subarrPictureData.join(' UNION ALL ') , []));
      }
      i = 0;
      for (;  i < arrCriteriaData.length; i = i + 500) {
        var subarrData = arrCriteriaData.slice(i,i+500); 
        arr.push(runQuery(sqlInsertCriteria +' '+ subarrData.join(' UNION ALL ') , []));
      }
          
      $.when.apply(this, arr).then(function () {
        console.log('when finished dfd.resolve loadTaxaFile');
        return  dfd.resolve();
      });
			}
  });
  return dfd.promise();
 }
 
 
// Insertion des données par la méthode "classique" : création de modèle et de collection backbone
function loadXmlCriteria(){
	var urlFile = "data/xml_criteres.xml";
  var dfd = $.Deferred();
  var arr = [];
	$.ajax( {
    type: "GET",
    url: urlFile,
    dataType: "xml",
    success: function(xml) {
      $(xml).find('groupe').each(function(){	
        var oGroupe = new app.models.Groupe();
        oGroupe.set('groupId',parseInt(  $(this).attr('id')));
        oGroupe.set('name' ,$(this).find('nom').text());
        oGroupe.set('picture', $(this).find('media').text());

        var cCaracteristiqueDefs = new app.models.CaracteristiqueDefsCollection();

        $(this).find('criteres critere').each(function(){
          var oCaracteristiqueDef = new app.models.CaracteristiqueDef();
          oCaracteristiqueDef.set('criteraId',  $(this).attr('id'));
          oCaracteristiqueDef.set('fk_group', oGroupe.get('groupId'));
          oCaracteristiqueDef.set('name', $(this).find('label').text());
          oCaracteristiqueDef.set('description', $(this).find('description').text());
          
          var cCaracteristiqueDefValues = new app.models.CaracteristiqueDefValuesCollection();
          
          //Récupération des valeurs de critères
          $(this).find('valeurs valeur').each(function(){
            var oCaracteristiqueDefValue = new app.models.CaracteristiqueDefValue();
            oCaracteristiqueDefValue.set('criteraValueId', $(this).attr('code'));
            oCaracteristiqueDefValue.set('fk_criteria', oCaracteristiqueDef.get('criteraId'));
            oCaracteristiqueDefValue.set('name', $(this).text());
            oCaracteristiqueDefValue.set('picture', $(this).attr('media'));
            cCaracteristiqueDefValues.add(oCaracteristiqueDefValue);
          });
          cCaracteristiqueDefValues.save();
          //oCaracteristiqueDef.set('defCaracValues', cCaracteristiqueDefValues);
          cCaracteristiqueDefs.add(oCaracteristiqueDef);
        });
        
        arr.push(cCaracteristiqueDefs.save());
        
        arr.push(oGroupe.save());
        $.when.apply(this, arr).then(function () {
          console.log('when finished dfd.resolve loadXmlCriteria');
          return  dfd.resolve();
        });
      });
			}
  });
  return dfd.promise();
 }
 
// ----------------------------------------------- Utilitaire de requêtes------------------------------------------ //

function runQuery(query , param) {
  return $.Deferred(function (d) {
    app.db.transaction(function (tx) {
      tx.executeSql(query, param, successWrapper(d), failureWrapper(d));
    });
  });
};

function successWrapper(d) {
  return (function (tx, data) {
    d.resolve(data)
  })
};

function failureWrapper(d) {
  return (function (tx, error) {
    d.reject(error)
  })
};

