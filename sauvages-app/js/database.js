"use strict";

// ----------------------------------------------- Database Initialisation ------------------------------------------ //

//************************************** Alimenter la base de données par le contenu des  XML taxons et criteres d'identification
function loadXmlTaxa(){
	var urlFile = "data/ex_XmlTaxons_sauvages.xml";
	$.ajax( {
    type: "GET",
		url: urlFile,
    dataType: "xml",
    success: function(xml) {
      $(xml).find('TAXON').each(function(){	
        var oTaxon = new app.models.Taxon();
        oTaxon.set('taxonId',parseInt(  $(this).attr('id')));
        oTaxon.set('commonName' ,$(this).attr('value'));
        oTaxon.set('scientificName', $(this).attr('sciName'));
        if (typeof ($(this).attr('groupe')) === 'undefined') { oTaxon.set('fk_group', "");}
        else { 
          oTaxon.set('fk_group', parseInt( $(this).attr('groupe')));
        }
        oTaxon.set('description',$(this).find('DESCRIPTION').text());
        // stocker le nom de fichier de la première photo dans la table Ttaxons
        oTaxon.set('picture',$(this).find('PICTURE:first').text());
        var cPicture = new app.models.PicturesCollection();
        //Stockage des photos
        $(this).find('PICTURE').each(function(){
          var oPicture = new app.models.Picture();
          oPicture.set('fk_taxon', oTaxon.get('taxonId'));
          oPicture.set('path', $(this).text());
          cPicture.add(oPicture);
        });
        //Stockage des caractères associés aux taxons
        var cTaxonCaracValues = new app.models.TaxonCaracValuesCollection();
        $(this).find('CRITERIAS VALUE').each(function(){
          var oCaracTaxon = new app.models.TaxonCaracValue();
          oCaracTaxon.set('fk_taxon', oTaxon.get('taxonId'));
          oCaracTaxon.set('fk_carac_value', $(this).attr('code'));
          cTaxonCaracValues.add(oCaracTaxon);
        });
        oTaxon.set('pictures', cPicture);
        oTaxon.set('caracValues', cTaxonCaracValues);
        
        oTaxon.save();
      });
			}
  });
 }
 
 
function loadXmlCriteria(){
	var urlFile = "data/ex_cle_identification_sauvages.xml";
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
        
        cCaracteristiqueDefs.save();
        
        oGroupe.save();
      });
			}
  });
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
        //console.log('wsuccessWrapper');
        d.resolve(data)
    })
};

function failureWrapper(d) {
    return (function (tx, error) {
       console.log('failureWrapper');
        d.reject(error)
    })
};

