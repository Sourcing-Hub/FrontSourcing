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
        titre: 'Titre du test',
        description: 'Description',
        libelle: 'Libellé',
        type: 'Type de champ',
        etape: 'Étape / Cohorte',
        questions: 'Questions',
        options: 'Propositions de réponse',
        intitule: 'Intitulé',
        texte: 'Texte',
      }

      const formatErrorValue = (value, prefix = '') => {
        if (typeof value === 'string') {
          return [`${prefix}${value}`]
        }
        if (Array.isArray(value)) {
          const list = []
          value.forEach((item, idx) => {
            if (typeof item === 'string') {
              list.push(`${prefix}${item}`)
            } else if (typeof item === 'object' && item !== null) {
              const itemPrefix = prefix ? `${prefix} ` : `Élément ${idx + 1} : `
              list.push(...formatErrorValue(item, itemPrefix))
            }
          })
          return list
        }
        if (typeof value === 'object' && value !== null) {
          const list = []
          for (const k in value) {
            const nestedName = fieldTranslations[k] || k
            list.push(...formatErrorValue(value[k], `${prefix}${nestedName} : `))
          }
          return list
        }
        return [`${prefix}${String(value)}`]
      }

      const messages = []
      for (const key in data) {
        if (key === 'error' || key === 'status') continue
        
        const fieldName = fieldTranslations[key] || key
        const formatted = formatErrorValue(data[key])
        formatted.forEach((msg) => {
          messages.push(`• ${fieldName} : ${msg}`)
        })
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
