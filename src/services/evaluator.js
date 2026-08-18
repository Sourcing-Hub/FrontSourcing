// Commentaire: Importe api utilisé dans la partie évaluateur.
import api from './api'

// Commentaire: Déclare la fonction unwrapList pour isoler un traitement évaluateur.
function unwrapList(data) {
  // Commentaire: Retourne le résultat attendu par le reste du code.
  return data?.results ?? data ?? []
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction normalizeId pour isoler un traitement évaluateur.
function normalizeId(value) {
  // Commentaire: Retourne le résultat attendu par le reste du code.
  return value === undefined || value === null
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    ? ''
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    : String(value)
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction formatDay pour isoler un traitement évaluateur.
function formatDay(date) {
  // Commentaire: Vérifie cette condition avant de continuer.
  if (!date) {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return ''
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return new Intl.DateTimeFormat('fr-FR', {
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    day: '2-digit',
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  }).format(new Date(date))
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction formatMonth pour isoler un traitement évaluateur.
function formatMonth(date) {
  // Commentaire: Vérifie cette condition avant de continuer.
  if (!date) {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return ''
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return new Intl.DateTimeFormat('fr-FR', {
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    month: 'short',
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  }).format(new Date(date))
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction getCandidateName pour isoler un traitement évaluateur.
function getCandidateName(candidate) {
  // Commentaire: Déclare firstName pour stocker une donnée ou un calcul de la vue.
  const firstName =
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    candidate?.firstName ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    candidate?.first_name ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    candidate?.prenom ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    ''

  // Commentaire: Déclare lastName pour stocker une donnée ou un calcul de la vue.
  const lastName =
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    candidate?.lastName ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    candidate?.last_name ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    candidate?.nom ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    ''

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return `${firstName} ${lastName}`.trim()
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction normalizeCandidate pour isoler un traitement évaluateur.
function normalizeCandidate(candidate = {}) {
  // Commentaire: Retourne le résultat attendu par le reste du code.
  return {
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    ...candidate,
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    id: normalizeId(candidate.id),
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    firstName:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.firstName ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.first_name ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.prenom ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    lastName:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.lastName ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.last_name ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.nom ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    email: candidate.email || '',
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    phone:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.phone ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.telephone ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    formation:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.formation_nom ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.formation?.nom ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.formation ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    promotion:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.promotion_nom ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.cohorte_nom ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.promotion ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    profileScore:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.profileScore ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.profile_score ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.score_profil ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      null,
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    cv:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.cv ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.cv_url ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      candidate.curriculum_vitae ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction normalizeStatus pour isoler un traitement évaluateur.
function normalizeStatus(status) {
  // Commentaire: Déclare value pour stocker une donnée ou un calcul de la vue.
  const value = status || ''

  // Commentaire: Vérifie cette condition avant de continuer.
  if (
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    value === 'EN_ATTENTE' ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    value === 'En-attente' ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    value === 'pending'
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  ) {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'En-attente'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Vérifie cette condition avant de continuer.
  if (
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    value === 'EN_COURS' ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    value === 'En cours' ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    value === 'progress'
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  ) {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'progress'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Vérifie cette condition avant de continuer.
  if (
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    value === 'TERMINE' ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    value === 'TERMINEE' ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    value === 'Terminé' ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    value === 'completed'
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  ) {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'completed'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return value
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction statusLabel pour isoler un traitement évaluateur.
function statusLabel(status) {
  // Commentaire: Vérifie cette condition avant de continuer.
  if (status === 'En-attente') {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'En-attente'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Vérifie cette condition avant de continuer.
  if (status === 'progress') {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'En cours'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Vérifie cette condition avant de continuer.
  if (status === 'completed') {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'Terminé'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return status || 'Non renseigné'
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction normalizeType pour isoler un traitement évaluateur.
function normalizeType(type) {
  // Commentaire: Déclare value pour stocker une donnée ou un calcul de la vue.
  const value = String(type || '').toLowerCase()

  // Commentaire: Vérifie cette condition avant de continuer.
  if (value.includes('motivation')) {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'motivation'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Vérifie cette condition avant de continuer.
  if (value.includes('technique')) {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'technique'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Vérifie cette condition avant de continuer.
  if (value.includes('final')) {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'final'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return value
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction typeLabel pour isoler un traitement évaluateur.
function typeLabel(type) {
  // Commentaire: Vérifie cette condition avant de continuer.
  if (type === 'motivation') {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'Entretien de motivation'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Vérifie cette condition avant de continuer.
  if (type === 'technique') {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'Entretien technique'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Vérifie cette condition avant de continuer.
  if (type === 'final') {
    // Commentaire: Retourne le résultat attendu par le reste du code.
    return 'Entretien final'
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return 'Entretien'
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction normalizeInterview pour isoler un traitement évaluateur.
function normalizeInterview(interview = {}) {
  // Commentaire: Déclare candidate pour stocker une donnée ou un calcul de la vue.
  const candidate =
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    interview.candidate ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    interview.candidat ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    interview.candidat_info ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    {}

  // Commentaire: Déclare date pour stocker une donnée ou un calcul de la vue.
  const date =
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    interview.date ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    interview.date_entretien ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    interview.scheduled_at ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    interview.debut ||
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    ''

  // Commentaire: Déclare type pour stocker une donnée ou un calcul de la vue.
  const type = normalizeType(
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    interview.type ||
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    interview.type_entretien,
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  )

  // Commentaire: Déclare status pour stocker une donnée ou un calcul de la vue.
  const status = normalizeStatus(
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    interview.status ||
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    interview.statut,
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  )

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return {
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    ...interview,
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    id: normalizeId(interview.id),
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    candidateId: normalizeId(
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.candidateId ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.candidate_id ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.candidat_id ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      candidate.id,
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    ),
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    candidateName:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.candidateName ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.candidat_nom ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      getCandidateName(candidate),
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    type,
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    typeLabel:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.typeLabel ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.type_label ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      typeLabel(type),
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    date,
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    day:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.day ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      formatDay(date),
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    month:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.month ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      formatMonth(date),
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    startTime:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.startTime ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.start_time ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.heure_debut ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    endTime:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.endTime ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.end_time ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.heure_fin ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    location:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.location ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.lieu ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    status,
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    statusLabel:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.statusLabel ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      interview.status_label ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      statusLabel(status),
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Déclare la fonction normalizeEvaluation pour isoler un traitement évaluateur.
function normalizeEvaluation(evaluation = {}) {
  // Commentaire: Retourne le résultat attendu par le reste du code.
  return {
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    ...evaluation,
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    type:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.type ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.interviewType ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.interview_type ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    answers:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.answers ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.reponses ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      {},
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    notes:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.notes ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      {},
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    score:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.score ??
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.score_global ??
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      null,
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    averageScore:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.averageScore ??
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.average_score ??
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      null,
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    comment:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.comment ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.commentaire ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.comments ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    recommendation:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.recommendation ||
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      evaluation.recommandation ||
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      '',
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    validated:
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      Boolean(
        // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
        evaluation.validated ??
        // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
        evaluation.validee ??
        // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
        evaluation.est_validee,
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      ),
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
export async function fetchMyCandidates(params = {}) {
  // Commentaire: Déclare response pour stocker une donnée ou un calcul de la vue.
  const response = await api.get('evaluator/candidates/', {
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    params,
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  })

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return unwrapList(response.data).map(normalizeCandidate)
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
export async function fetchCandidate(candidateId) {
  // Commentaire: Déclare response pour stocker une donnée ou un calcul de la vue.
  const response = await api.get(
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    `evaluator/candidates/${candidateId}/`,
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  )

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return normalizeCandidate(response.data)
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
export async function fetchMyInterviews(params = {}) {
  // Commentaire: Déclare response pour stocker une donnée ou un calcul de la vue.
  const response = await api.get('evaluator/interviews/', {
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    params,
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  })

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return unwrapList(response.data).map(normalizeInterview)
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
export async function fetchInterview(interviewId) {
  // Commentaire: Déclare response pour stocker une donnée ou un calcul de la vue.
  const response = await api.get(
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    `evaluator/interviews/${interviewId}/`,
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  )

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return normalizeInterview(response.data)
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
export async function fetchEvaluation(interviewId) {
  // Commentaire: Déclare response pour stocker une donnée ou un calcul de la vue.
  const response = await api.get(
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    `evaluator/interviews/${interviewId}/evaluation/`,
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  )

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return normalizeEvaluation(response.data)
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
export async function saveEvaluation(
  // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
  interviewId,
  // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
  payload,
// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
) {
  // Commentaire: Déclare response pour stocker une donnée ou un calcul de la vue.
  const response = await api.post(
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    `evaluator/interviews/${interviewId}/evaluation/`,
    // Commentaire: Ouvre un bloc de configuration ou de données.
    {
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      ...payload,
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      average_score: payload.averageScore,
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      commentaire: payload.comment,
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    },
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  )

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return normalizeEvaluation(response.data)
// Commentaire: Ferme le bloc de configuration ou de traitement.
}

// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
export async function validateEvaluation(
  // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
  interviewId,
// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
) {
  // Commentaire: Déclare response pour stocker une donnée ou un calcul de la vue.
  const response = await api.post(
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    `evaluator/interviews/${interviewId}/evaluation/validate/`,
  // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
  )

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return {
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    ...response.data,
    // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
    evaluation: normalizeEvaluation(
      // Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
      response.data?.evaluation ??
      // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
      response.data,
    // Commentaire: Ajoute cette valeur à la structure ou à la liste en cours.
    ),
  // Commentaire: Ferme le bloc de configuration ou de traitement.
  }
// Commentaire: Ferme le bloc de configuration ou de traitement.
}
