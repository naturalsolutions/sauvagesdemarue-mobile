
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
			new NS.UI.Notification({
				type: 'error',
				title: 'GPS:',
				message: 'wait until GPS start',
				delay: 1
			});
	},
	
	
	 sauvages.finParcours = function finParcours() {
			new NS.UI.Notification({
				type: 'info',
				title: '',
				message: 'Retrouver vos données dans "Mes observations"<br/> N\'oublier pas de les partager <br/>  <a href="#addParcours/new" class="btn btn-primary" >Nouvelle rue</a>',
				delay: 3
			});
	}
	
	 sauvages.obsSaveSuccess = function obsSaveSuccess() {
			new NS.UI.Notification({
				type: 'info',
				title: '',
				message: 'Félicitation',
				delay: 1
			});
	}
  return sauvages;
})(sauvages.notifications|| {});
