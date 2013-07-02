
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
				type: 'error',
				title: 'GPS not start',
				message: 'wait',
				delay: 1,
				btnLabel: '',
			});
	},
	
	 sauvages.finParcours = function finParcours() {
			var myModal = new NS.UI.NotificationModal({
				type: 'info',
				title: 'Rue sauvegardée',
				message: 'Retrouver vos données dans "Mes observations"<br/> N\'oublier pas de les partager <br/>',
				delay: '',
				btnLabel: 'Nouvelle rue',
				onClick: function() {
					app.route.navigate('addParcours/new', {trigger: true});
					},
			});
	},
	
	sauvages.obsSaveSuccess = function obsSaveSuccess() {
			new NS.UI.NotificationModal({
				type: 'info',
				title: 'Observation sauvegardée',
				message: 'Félicitation',
				delay: 1,
				btnLabel: '', 
				onClose: function() {
					app.route.navigate('taxonlist', {trigger: true});
					},
				
			});
	}
  return sauvages;
})(sauvages.notifications|| {});
