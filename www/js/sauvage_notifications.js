
var sauvages = window.sauvages|| {};

sauvages.notifications = (
function() {
   "use strict";
   sauvages.messages = {
           'save': 'Enregistrer',
           'begin_street': 'Début du parcours',
           'end_street':'Fin du parcours',
   },
   sauvages.gpsNotStart = function gpsNotStart() {
      var myModal = new NS.UI.NotificationModal({
       type: '',
       title: "Géolocalisation",
       message: "Activer votre GPS ou le WIFI",
       delay: 4,
       btnLabel: '',
      onClose: function() {
         $('#nodal').modal('hide');
         $('#nodal').remove();
         $('.modal-backdrop').remove();
         $('body').removeClass('modal-open');
       }
      });
   },
   
   sauvages.supprimerObs = function supprimerObs(msg) {
      var myModal = new NS.UI.NotificationModal({
       type: '',
       title: 'Supprimer une observation',
       message: msg,
       delay: 1,
       btnLabel: '',
      });
   },
	
   sauvages.finParcours = function finParcours(msg,idRue,parcours) {
      var myModal = new NS.UI.NotificationModal({
         type: '',
         title: 'Rue sauvegardée',
         message: msg,
         delay: '',
         btnLabel: '',
         onClick: function() {
          app.route.navigate('addParcours/new', {trigger: true});
         },
      });
      myModal.$el.on('submit', 'form', _.bind(function(evt) {
         evt.preventDefault();
         $('#nodal').modal('hide');
         $('#nodal').remove();
         $('.modal-backdrop').remove();
         $('body').removeClass('modal-open');
         var sendObservations = new NS.SendOBS(idRue,parcours);
         sendObservations.envoiUtilitaireWS(idRue,parcours);
      }, myModal)),
      myModal.$el.on('reset', 'form', _.bind(function(evt) {
         evt.preventDefault();
         $('#nodal').modal('hide');
         $('#nodal').remove();
         $('.modal-backdrop').remove();
         $('body').removeClass('modal-open');
         app.route.navigate('myObservation', {trigger: true});
      }, myModal))
   },
	
   sauvages.createAccount = function createAccount(msg,email) {
      var myModal = new NS.UI.NotificationModal({
         type: '',
         title: 'Création de compte sur sauvagesdepaca.fr',
         message: msg,
         delay: '',
         btnLabel: '',
      });
      myModal.$el.on('submit', 'form', _.bind(function(evt) {
         evt.preventDefault();
         $('#nodal').modal('hide');
         $('#nodal').remove();
         $('.modal-backdrop').remove();
         $('body').removeClass('modal-open');
         var createAccount = new NS.SynchroUser();
         createAccount.registerUser(email);
      }, myModal)),
      myModal.$el.on('reset', 'form', _.bind(function(evt) {
         evt.preventDefault();
         $('#nodal').modal('hide');
         $('#nodal').remove();
         $('.modal-backdrop').remove();
         $('body').removeClass('modal-open');
         app.route.navigate('utilisateur', {trigger: true});
      }, myModal))
   },


   sauvages.obsSaveSuccess = function obsSaveSuccess(localisation) {
     var myModal = new NS.UI.NotificationModal({
      type: '',
      title: 'Observation sauvegardée',
      message: 'Félicitations !<br/>Retrouver vos données dans la rubrique "Mes Sauvages"',
      delay: 2,
      btnLabel: '', 
      onClose: function() {
         if (localisation) {
            app.route.navigate('identification/' + localisation, {trigger: true});
         }else{
            app.route.navigate('identification', {trigger: true});
         }  
      },
     });
   },

   sauvages.supprimerData = function supprimerData(msg,viewBefore) {
      var self = this;
      self.viewBefore = viewBefore ;
      var myModal = new NS.UI.NotificationModal({
       type: '',
       title: 'Supprimer une observation',
       message:  msg,
       delay: '',
       btnLabel: ''
      });
      myModal.$el.on('submit', 'form', _.bind(function(evt) {
         evt.preventDefault();
         $('#nodal').modal('hide');
         $('#nodal').remove();
         $('.modal-backdrop').remove();
         $('body').removeClass('modal-open');
         $(self.viewBefore).find('.btn-footer-left').removeClass('confirme-supp').addClass('destroy-obs').trigger('click');
         $(self.viewBefore).find('.btn-footer-left').addClass('confirme-supp').removeClass('destroy-obs');
      }, myModal))  
   },

   sauvages.supprimerRue = function supprimerData(msg,idRue,viewBefore) {
      var self = this;
      self.viewBefore = viewBefore ;
      var myModal = new NS.UI.NotificationModal({
       type: '',
       title: 'Supprimer une rue',
       message:  msg,
       delay: '',
       btnLabel: ''
      });
      myModal.$el.on('submit', 'form', _.bind(function(evt) {
         evt.preventDefault();
         $('#nodal').modal('hide');
         $('#nodal').remove();
         $('.modal-backdrop').remove();
         $('body').removeClass('modal-open');
         $(self.viewBefore).find("#"+idRue).removeClass('confirme-supp').addClass('destroyRue').trigger('click');
         $(self.viewBefore).find("#"+idRue).addClass('confirme-supp').removeClass('destroyRue');
      }, myModal))  
   },

   sauvages.emailSaveSuccess= function emailSaveSuccess() {
     var myModal = new NS.UI.NotificationModal({
      type: '',
      title: 'Votre email a été sauvegardé',
      message: 'Félicitations !',
      delay: 2,
      btnLabel: '',
      onClose: function() {
          //$('#nodal').modal('hide');
          //$('#nodal').remove();
          //$('.modal-backdrop').remove();
          //$('body').removeClass('modal-open');
       }
     });
   },

   sauvages.sendToTelaWSSuccess = function sendToTelaWSSuccess() {
      var myModal = new NS.UI.NotificationModal({
         type: '',
         title: 'Observation envoyée',
         message: 'L\'envoi des observations s\'est bien déroulé.',
         delay: 1,
         btnLabel: '',
         onClose: function() {
            //$('#nodal').modal('hide');
            //$('#nodal').remove();
            //$('.modal-backdrop').remove();
            //$('body').removeClass('modal-open');
         }
      });
   },
   sauvages.sendToTelaWSFail = function sendToTelaWSFail() {
      var myModal = new NS.UI.NotificationModal({
         type: '',
         title: 'Observation envoyée',
         message: 'Une erreur s\'est produite, les observations n\'ont pu être envoyées',
         delay: 3,
         btnLabel: '',
         onClose: function() {
            $('#nodal').modal('hide');
            $('#nodal').remove();
            $('.modal-backdrop').remove();
         }
      });
   },
   sauvages.email = function email(msg,newUser,idRue,parcours,cObservation) {
      var myModal = new NS.UI.NotificationModal({
         type: '',
         title: 'Ajouter votre email.',
         message: msg,
         delay: '',
         btnLabel: 'Annuler'
      });
      myModal.$el.on('submit', _.bind(function(evt) {
         evt.preventDefault();
            var currentEmail = this.$el.find('input[type="email"]').val();
            newUser.set('email',String(currentEmail))
           .save();
            //Send obs on web
            var sendObservations = new NS.SendOBS(idRue,parcours,cObservation);
            sendObservations.envoiUtilitaireWS(idRue,parcours,cObservation);
            //$('#nodal').modal('hide');
            //$('#nodal').remove();
            //$('.modal-backdrop').remove();
            //$('body').removeClass('modal-open');
      }, myModal));
   },
   sauvages.helpKey = function helpKey(criteriaName,criteriaValues) {
      var myModal = new NS.UI.NotificationModal({
         type: 'helpkey',
         title: criteriaName,
         message: criteriaValues,
         delay: '',
         btnLabel: 'Fermer', 
         onClose: function() {
          app.route.navigate('taxonlist', {trigger: true});
          }
      });
   },

   sauvages.connection= function connection() {
      var myModal = new NS.UI.NotificationModal({
         type: '',
         title: 'Connection à internet',
         message: "L'envoi des observations requiert une connexion à haut débit (H+, 4G, wifi)." ,
         delay: '',
         btnLabel: ''
      });
      //$('#myModal').on('hidden.bs.modal', function () {
      //   $('#nodal').modal('hide');
      //   $('#nodal').remove();
      //   $('.modal-backdrop').remove();
      //   $('body').removeClass('modal-open');
      //});
   },

   sauvages.connectionInfo = function connectionInfo(msg) {
      var myModal = new NS.UI.NotificationModal({
       type: '',
       title: 'Êtes-vous vous connecté à un réseau à haut débit ?',
       message:  msg,
       delay: '',
       btnLabel: ''
      });
      myModal.$el.on('submit', 'form', _.bind(function(evt) {
         evt.preventDefault();
      //   $('#nodal').modal('hide');
      //   $('#nodal').remove();
      //   $('.modal-backdrop').remove();
      //   $('body').removeClass('modal-open');
      }, myModal));
   },

   sauvages.finDeProtocol = function finDeProtocol(msg) {
      var myModal = new NS.UI.NotificationModal({
       type: '',
       title: 'Voulez-vous terminer votre parcours ?',
       message:  msg,
       delay: '',
       btnLabel: '', 
      });
      myModal.$el.on('submit', 'form', _.bind(function(evt) {
         evt.preventDefault();
         //$('#nodal').modal('hide');
         //$('#nodal').remove();
         //$('.modal-backdrop').remove();
         //$('body').removeClass('modal-open');
      }, myModal));
      myModal.$el.on('reset', 'form', _.bind(function(evt) {
         evt.preventDefault();
         //$('#nodal').modal('hide');
         //$('#nodal').remove();
         //$('.modal-backdrop').remove();
         //$('body').removeClass('modal-open');
         app.route.navigate('taxonlist', {trigger: true});
      }, myModal));
      //$('#myModal').on('hidden.bs.modal', function () {
      //   $('#nodal').modal('hide');
      //   $('#nodal').remove();
      //   $('.modal-backdrop').remove();
      //   $('body').removeClass('modal-open');
      //});
    },

   sauvages.infoRegion = function infoRegion(msg) {
      var myModal = new NS.UI.NotificationModal({
       type: '',
       title: 'Sauvages de ma rue en région',
       message:  msg,
       delay: '',
       btnLabel: '', 
      });
      myModal.$el.on('submit', 'form', _.bind(function(evt) {
         evt.preventDefault();
         //$('#nodal').modal('hide');
         //$('#nodal').remove();
         //$('.modal-backdrop').remove();
         //$('body').removeClass('modal-open');
         window.history.back();
         return false;
      }, myModal));
      myModal.$el.on('reset', 'form', _.bind(function(evt) {
         evt.preventDefault();
         $('#nodal').modal('hide');
         $('#nodal').remove();
         $('.modal-backdrop').remove();
         $('body').removeClass('modal-open');
      }, myModal));
      //$('#myModal').on('hidden.bs.modal', function () {
      //   $('#nodal').modal('hide');
      //   $('#nodal').remove();
      //   $('.modal-backdrop').remove();
      //   $('body').removeClass('modal-open');
      //});
    },
   sauvages.SortieProtocol = function SortieProtocol(msg) {
      var myModal = new NS.UI.NotificationModal({
       type: '',
       title: 'Rue en cours',
       message: msg,
       delay: '',
       btnLabel: '', 
      });
      $('.close-lg').hide();
      myModal.$el.on('submit', 'form', _.bind(function(evt) {
        evt.preventDefault();
         $('#nodal').modal('hide');
         $('#nodal').remove();
         $('.modal-backdrop').remove();
         $('body').removeClass('modal-open');
         app.route.navigate('addParcours', {trigger: true, replace: true});
         $("#menu").trigger("close");
      }, myModal));
      myModal.$el.on('reset', 'form', _.bind(function(evt) {
         evt.preventDefault();
         //$('#nodal').modal('hide');
         //$('#nodal').remove();
         //$('.modal-backdrop').remove();
         //$('body').removeClass('modal-open');
         $("#menu").trigger("close"); 
      }, myModal))
   }  
  return sauvages;
})(sauvages.notifications|| {});
