/**
 * Formate les erreurs du backend (Axios) pour les rendre lisibles et compréhensibles.
 */
/**
 * Formate proprement les erreurs retournées par l'API backend Django (DRF)
 * pour un affichage clair dans les interfaces utilisateur Vue.
 */
export function parseBackendError(err) {
  if (!err) {
    return "Une erreur inconnue est survenue."
  }
  
  if (err.response) {
    const data = err.response.data
    
    // Si c'est un message textuel brut
    if (typeof data === 'string') {
      if (data.includes('<!DOCTYPE html>') || data.includes('<html>')) {
        return "Une erreur interne du serveur est survenue (500)."
      }
      return data
    }
    
    if (data && typeof data === 'object') {
      // 1. Clé 'detail' standard de Django REST framework (DRF)
      if (data.detail) {
        return data.detail
      }
      
      // 2. Erreurs globales non associées à un champ spécifique (non_field_errors)
      if (data.non_field_errors) {
        return Array.isArray(data.non_field_errors) 
          ? data.non_field_errors.join(' | ') 
          : String(data.non_field_errors)
      }
      
      // 3. Dictionnaire d'erreurs de validation par champ
      const fieldTranslations = {
        nom: 'Nom',
        prenom: 'Prénom',
        email: 'Email',
        telephone: 'Téléphone',
        sexe: 'Genre',
        dateDebut: 'Date de début',
        dateFin: 'Date de fin',
        dateOuverture: "Date d'ouverture",
        dateCloture: "Date de clôture",
        statut: 'Statut',
        mot_de_passe: 'Mot de passe',
        mot_de_passe_confirmation: 'Confirmation de mot de passe',
        ancien_mot_de_passe: 'Ancien mot de passe',
        nouveau_mot_de_passe: 'Nouveau mot de passe',
        username: "Nom d'utilisateur",
        password: 'Mot de passe',
        cohorte: 'Cohorte',
        formation: 'Formation',
        titre: 'Titre',
        description: 'Description',
        libelle: 'Libellé',
        type: 'Type de champ',
      }

      const messages = []
      for (const key in data) {
        // Ignorer les clés non pertinentes d'en-tête
        if (key === 'error' || key === 'status') continue
        
        const fieldName = fieldTranslations[key] || key
        const fieldErrors = data[key]
        
        let errorText = ''
        if (Array.isArray(fieldErrors)) {
          errorText = fieldErrors.join(', ')
        } else if (typeof fieldErrors === 'object' && fieldErrors !== null) {
          errorText = JSON.stringify(fieldErrors)
        } else {
          errorText = String(fieldErrors)
        }
        
        messages.push(`• ${fieldName} : ${errorText}`)
      }
      
      if (messages.length > 0) {
        return messages.join('\n')
      }
    }
    
    return `Erreur serveur : Code ${err.response.status}`
  } else if (err.request) {
    return "Le serveur ne répond pas. Veuillez vérifier votre connexion internet ou le statut de l'API."
  } else {
    return err.message || "Une erreur est survenue lors de la communication avec le serveur."
  }
}
