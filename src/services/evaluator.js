// Commentaire: Importe api utilisé dans la partie évaluateur.
import api from './api'

// Commentaire: Déclare la fonction unwrapList pour isoler un traitement évaluateur.
function unwrapList(data) {
  return data?.results ?? data ?? []
}

// Commentaire: Déclare la fonction normalizeId pour isoler un traitement évaluateur.
function normalizeId(value) {
  return value === undefined || value === null
    ? ''
    : String(value)
}

// Commentaire: Déclare la fonction formatDay pour isoler un traitement évaluateur.
function formatDay(date) {
  if (!date) {
    return ''
  }

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
  }).format(new Date(date))
}

// Commentaire: Déclare la fonction formatMonth pour isoler un traitement évaluateur.
function formatMonth(date) {
  if (!date) {
    return ''
  }

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
  }).format(new Date(date))
}

// Commentaire: Déclare la fonction getCandidateName pour isoler un traitement évaluateur.
function getCandidateName(candidate) {
  const firstName =
    candidate?.firstName ||
    candidate?.first_name ||
    candidate?.prenom ||
    ''

  const lastName =
    candidate?.lastName ||
    candidate?.last_name ||
    candidate?.nom ||
    ''

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return `${firstName} ${lastName}`.trim()
}

// Commentaire: Déclare la fonction normalizeCandidate pour isoler un traitement évaluateur.
function normalizeCandidate(candidate = {}) {
  return {
    ...candidate,
    id: normalizeId(candidate.id),
    firstName:
      candidate.firstName ||
      candidate.first_name ||
      candidate.prenom ||
      '',
    lastName:
      candidate.lastName ||
      candidate.last_name ||
      candidate.nom ||
      '',
    email: candidate.email || '',
    phone:
      candidate.phone ||
      candidate.telephone ||
      '',
    formation:
      candidate.formation_nom ||
      candidate.formation?.nom ||
      candidate.formation ||
      '',
    promotion:
      candidate.promotion_nom ||
      candidate.cohorte_nom ||
      candidate.promotion ||
      '',
    profileScore:
      candidate.profileScore ||
      candidate.profile_score ||
      candidate.score_profil ||
      null,
    cv:
      candidate.cv ||
      candidate.cv_url ||
      candidate.curriculum_vitae ||
      '',
  }
}

// Commentaire: Déclare la fonction normalizeStatus pour isoler un traitement évaluateur.
function normalizeStatus(status) {
  const value = status || ''

  if (
    value === 'EN_ATTENTE' ||
    value === 'En-attente' ||
    value === 'pending'
  ) {
    return 'En-attente'
  }

  if (
    value === 'EN_COURS' ||
    value === 'En cours' ||
    value === 'progress'
  ) {
    return 'progress'
  }

  if (
    value === 'TERMINE' ||
    value === 'TERMINEE' ||
    value === 'Terminé' ||
    value === 'completed'
  ) {
    return 'completed'
  }

  return value
}

// Commentaire: Déclare la fonction statusLabel pour isoler un traitement évaluateur.
function statusLabel(status) {
  if (status === 'En-attente') {
    return 'En-attente'
  }

  if (status === 'progress') {
    return 'En cours'
  }

  if (status === 'completed') {
    return 'Terminé'
  }

  return status || 'Non renseigné'
}

// Commentaire: Déclare la fonction normalizeType pour isoler un traitement évaluateur.
function normalizeType(type) {
  const value = String(type || '').toLowerCase()

  if (value.includes('motivation')) {
    return 'motivation'
  }

  if (value.includes('technique')) {
    return 'technique'
  }

  if (value.includes('final')) {
    return 'final'
  }

  return value
}

// Commentaire: Déclare la fonction typeLabel pour isoler un traitement évaluateur.
function typeLabel(type) {
  if (type === 'motivation') {
    return 'Entretien de motivation'
  }

  if (type === 'technique') {
    return 'Entretien technique'
  }

  if (type === 'final') {
    return 'Entretien final'
  }

  return 'Entretien'
}

// Commentaire: Déclare la fonction normalizeInterview pour isoler un traitement évaluateur.
function normalizeInterview(interview = {}) {
  const candidate =
    interview.candidate ||
    interview.candidat ||
    interview.candidat_info ||
    {}

  const date =
    interview.date ||
    interview.date_entretien ||
    interview.scheduled_at ||
    interview.debut ||
    ''

  const type = normalizeType(
    interview.type ||
    interview.type_entretien,
  )

  const status = normalizeStatus(
    interview.status ||
    interview.statut,
  )

  return {
    ...interview,
    id: normalizeId(interview.id),
    candidateId: normalizeId(
      interview.candidateId ||
      interview.candidate_id ||
      interview.candidat_id ||
      candidate.id,
    ),
    candidateName:
      interview.candidateName ||
      interview.candidat_nom ||
      getCandidateName(candidate),
    type,
    typeLabel:
      interview.typeLabel ||
      interview.type_label ||
      typeLabel(type),
    date,
    day:
      interview.day ||
      formatDay(date),
    month:
      interview.month ||
      formatMonth(date),
    startTime:
      interview.startTime ||
      interview.start_time ||
      interview.heure_debut ||
      '',
    endTime:
      interview.endTime ||
      interview.end_time ||
      interview.heure_fin ||
      '',
    location:
      interview.location ||
      interview.lieu ||
      '',
    status,
    statusLabel:
      interview.statusLabel ||
      interview.status_label ||
      statusLabel(status),
  }
}

// Commentaire: Déclare la fonction normalizeEvaluation pour isoler un traitement évaluateur.
function normalizeEvaluation(evaluation = {}) {
  return {
    ...evaluation,
    type:
      evaluation.type ||
      evaluation.interviewType ||
      evaluation.interview_type ||
      '',
    answers:
      evaluation.answers ||
      evaluation.reponses ||
      {},
    notes:
      evaluation.notes ||
      {},
    score:
      evaluation.score ??
      evaluation.score_global ??
      null,
    averageScore:
      evaluation.averageScore ??
      evaluation.average_score ??
      null,
    comment:
      evaluation.comment ||
      evaluation.commentaire ||
      evaluation.comments ||
      '',
    recommendation:
      evaluation.recommendation ||
      evaluation.recommandation ||
      '',
    validated:
      Boolean(
        evaluation.validated ??
        evaluation.validee ??
        evaluation.est_validee,
      ),
  }
}

// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
export async function fetchMyCandidates(params = {}) {
  // Commentaire: Déclare response pour stocker une donnée ou un calcul de la vue.
  const response = await api.get('evaluations/evaluator/candidates/', {
    params,
  })

  // Commentaire: Retourne le résultat attendu par le reste du code.
  return unwrapList(response.data).map(normalizeCandidate)
}

// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
export async function fetchCandidate(candidateId) {
  const response = await api.get(
    `evaluations/evaluator/candidates/${candidateId}/`,
  )

  return normalizeCandidate(response.data)
}

// Commentaire: Exécute cette ligne de logique propre à la partie évaluateur.
export async function fetchMyInterviews(params = {}) {
  const response = await api.get('evaluations/evaluator/interviews/', {
    params,
  })

  return unwrapList(response.data).map(normalizeInterview)
}

export async function fetchInterview(interviewId) {
  const response = await api.get(
    `evaluations/evaluator/interviews/${interviewId}/`,
  )

  return normalizeInterview(response.data)
}

export async function fetchEvaluation(interviewId) {
  const response = await api.get(
    `evaluations/evaluator/interviews/${interviewId}/evaluation/`,
  )

  return normalizeEvaluation(response.data)
}

export async function saveEvaluation(
  interviewId,
  payload,
) {
  const response = await api.post(
    `evaluations/evaluator/interviews/${interviewId}/evaluation/`,
    {
      ...payload,
      average_score: payload.averageScore,
      commentaire: payload.comment,
    },
  )

  return normalizeEvaluation(response.data)
}

export async function validateEvaluation(
  interviewId,
) {
  const response = await api.post(
    `evaluations/evaluator/interviews/${interviewId}/evaluation/validate/`,
  )

  return {
    ...response.data,
    evaluation: normalizeEvaluation(
      response.data?.evaluation ??
      response.data,
    ),
  }
}
