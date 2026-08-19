import api from './api'

function unwrapList(data) {
  return data?.results ?? data ?? []
}

function normalizeQuestion(question = {}) {
  return {
    ...question,
    id: String(question.id || ''),
    question: question.question || question.contenu || '',
    maxScore: question.maxScore ?? question.baremeMax ?? 5,
    ordre: Number(question.ordre || 1),
    cohorte: String(question.cohorte || ''),
    cohorteNom: question.cohorte_nom || question.cohorteNom || '',
    formationNom: question.formation_nom || question.formationNom || '',
  }
}

export async function fetchQuestions(params = {}) {
  const response = await api.get('evaluations/questions/', { params })
  return unwrapList(response.data).map(normalizeQuestion)
}

export async function createQuestion(payload) {
  const response = await api.post('evaluations/questions/', payload)
  return normalizeQuestion(response.data)
}

export async function updateQuestion(id, payload) {
  const response = await api.put(`evaluations/questions/${id}/`, payload)
  return normalizeQuestion(response.data)
}

export async function deleteQuestion(id) {
  await api.delete(`evaluations/questions/${id}/`)
  return true
}

export async function fetchInterviewCandidates(params = {}) {
  const response = await api.get('evaluations/entretiens/candidats/', { params })
  return unwrapList(response.data).map((candidate) => ({
    ...candidate,
    id: String(candidate.id || ''),
    candidatureId: String(candidate.candidatureId || ''),
    nom: candidate.nom || '',
    numero: candidate.numero || '',
    email: candidate.email || '',
    formation: candidate.formation || '',
    cohorte: candidate.cohorte || '',
    etape: candidate.etape || '',
    date: candidate.date || '',
    heureDebut: candidate.heureDebut || '',
    heureFin: candidate.heureFin || '',
    lieu: candidate.lieu || '',
    statutPresence: candidate.statutPresence || '',
    statutEtape: candidate.statutEtape || '',
    statutCandidature: candidate.statutCandidature || '',
    technique: candidate.technique || {},
    motivation: candidate.motivation || {},
    final: candidate.final || {},
  }))
}
