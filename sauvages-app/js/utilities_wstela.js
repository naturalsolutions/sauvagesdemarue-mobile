
var NS = window.NS || {};

NS.WSTelaAPIClient = (function() {
    "use strict";

    var wsTelaApiClient = function (basePath, tagimg, tagobs, tagprojet) {
      this.basePath = basePath;
      this.tagimg = tagimg;
      this.tagobs = tagobs;
      this.tagprojet = tagprojet;
      this.defaultObs = {'date' : '', 'notes' :  '',
        'nom_sel' : '','num_nom_sel' : '','nom_ret' :'','num_nom_ret' : '','num_taxon' : '-1','famille' : '','referentiel' :'bdtfx',
        'latitude' : '','longitude' : '','commune_nom' :'','commune_code_insee' :'','lieudit' : '','station' : '',
        'milieu' :'','abondance' : '','phenologie' :'','certitude' :''};
    };
    
    /***
     * Fonction envoie par POST un ensemble d'obs aux services de tela
     *  formate les données de l'observation pour le POST
     ****/
     //@TODO catcher les erreurs ajax
    wsTelaApiClient.prototype.sendSauvageObservation = function (obsToSend, cObservation, cParcours){
      var dfd = $.Deferred();
      var observations =new Object();
      //Traitement parcours par parcours
      var obsPerParcours = _.groupBy(obsToSend,function(item,key,list){
        return item.idp;
      });
      var dfdObs= [];
      var nbSavePerObs = new Array();
      for (var idp in obsPerParcours) {
        nbSavePerObs[idp] = {'nbObsTheorique' : obsPerParcours[idp].length, 'nbObsSended': 0};
        for (var id in obsPerParcours[idp]) {
          var obs = _.defaults(obsPerParcours[idp][id], this.defaultObs);
          var observations = this.formatObsToSend(obs);
          dfdObs.push(this.sendToTelaWS(observations, obsPerParcours[idp][id].ido) 
            .done(_.bind(function() {
              // Mise a jour de l'obs sended = 1
              this.nbSavePerObs[this.idp]['nbObsSended'] += 1
              if (this.ido !== -1 ) {
                this.cObservation.get(this.ido).set('sended',1);
                this.dfdObs.push(this.cObservation.get(this.ido).save());
              }
              else {
                this.dfdObs.push(new $.Deferred().resolve());
              }
            }, {
                'nbSavePerObs':nbSavePerObs, 'ido' :  obsPerParcours[idp][id].ido, 
                'idp' : idp, 'cObservation' : cObservation, 'dfdObs' : dfdObs
              }
            ))
            .fail(function() {
              console.log( "error" );
              console.log (nbObsSended + '/' + nbObsTheorique);
            }));
        }
      }
      //Quand toutes les données sont envoyées et les obs MAJ (sended == 1) alors 
      // MAJ des parcours et resolve du deferred
      $.when.apply(this, dfdObs).then(
        function (status) {
          var dfdParcours= [];
          console.log('when finished dfd.resolve obser per rue');
          for (var idp in nbSavePerObs) {
            if (nbSavePerObs[idp]['nbObsSended'] == nbSavePerObs[idp]['nbObsTheorique']) {
              cParcours.get(obsPerParcours[idp][0].idp).set('sended',1);
              dfdParcours.push(cParcours.get(obsPerParcours[idp][0].idp).save());
            }
          }
          $.when.apply(this, dfdParcours).then(
            function (a) {
              return dfd.resolve();
            }
          );
        },
        function (status) {
          return dfd.reject();
        }
      );
      return dfd.promise();
    };

    /***
     * Fonction qui encode en base64 une image
     * ***/
    wsTelaApiClient.prototype.encodeImg= function (){
    };
    
     /***
     * Fonction qui formate une observation en vue de son envoie vers tela
     * ***/
    wsTelaApiClient.prototype.formatObsToSend= function (obs){
      var observations = new Object();
       //Traitement des images
      var img_noms;
      var img_codes;
      obs = _.omit(obs, 'img');
      
      //Traitement de l'observation
      var json = {
        'date' : obs.date, 
        'notes' : (obs.ido === -1) ? 'rue sans observation; '+obs.note: obs.note,
        'nom_sel' : obs.nom_sel,
        'num_nom_sel' : obs.num_nom_sel,
        'nom_ret' : obs.nom_ret,
        'num_nom_ret' : obs.num_nom_ret,
        'num_taxon' : obs.num_taxon,
        'famille' : obs.famille ,
        'referentiel' : obs.referentiel ,

        'latitude' : (obs.latitude !== null) ? obs.latitude : obs.latitudeDebutRue,
        'longitude' : (obs.longitude !== null) ? obs.longitude : obs.longitudeDebutRue,
        'commune_nom' : obs.commune_nom,
        'commune_code_insee' : obs.commune_code_insee,
        'lieudit' : obs.lieudit,
        'station' : obs.station,
        'milieu' : obs.milieu,
        'abondance' : obs.abondance,
        'phenologie' : obs.phenologie,
        'certitude' : obs.certitude,
        
        //Ajout des champs images
        'image_nom' : img_noms,
        'image_b64' : img_codes 
      };
      
      obs = _.omit(obs, 'ido');
      obs = _.omit(obs, 'idp');
      
      console.log(json);
      //Ajout des données supplémentaires associées à sauvages
      //@TODO gestion des undefined
      var additionalValues = _.difference(_.keys(obs), _.keys(this.defaultObs));
      var idAd;
      for (idAd in additionalValues) {
        if (! json['obs_etendue']) json['obs_etendue'] = new Array();
        json['obs_etendue'].push({ 'cle': additionalValues[idAd], 'label': additionalValues[idAd], 'valeur' : obs[additionalValues[idAd]] });
      }
             
      observations['obsId1'] = json;
             
      //@TODO traiter la réponse
      //Gestion des defereds
      observations['projet'] = this.tagprojet;
      observations['tag-obs'] = this.tagobs;
      observations['tag-img'] = this.tagimg;
      //@TODO gestion des données utilisateurs
      observations['utilisateur'] = {
        'id_utilisateur': null,
        'prenom': null,
        'nom': null,
        'courriel':'test@nsdev.com'
      }
      return observations;
    };
    
    /***
    * Fonction génère la requete  POST d'envoie d'une obs aux services de tela
    * ***/
    wsTelaApiClient.prototype.sendToTelaWS= function (obs, id_obs) {
      return $.ajax({
        url : this.basePath,
        type : 'POST',
        data : obs,
        dataType : 'json'
      });
      //return $.Deferred().resolve();
    }

    return wsTelaApiClient;
}) ();
