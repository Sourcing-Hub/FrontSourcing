// import axios from 'axios';

// const API_URL = 'http://127.0.0.1:8000/api/tests/tests/';

// export default {
//   // 1. READ (Liste de tous les tests)
//   obtenirTests() {
//     return axios.get(API_URL);
//   },

//   // 2. READ (Un seul test par son ID)
//   obtenirTestParId(id) {
//     return axios.get(`${API_URL}${id}/`);
//   },

//   // 3. CREATE (Créer un nouveau test)
//   creerTest(data) {
//     return axios.post(API_URL, data);
//   },

//   // 4. UPDATE (Modifier un test existant)
//   modifierTest(id, data) {
//     return axios.put(`${API_URL}${id}/`, data);
//   },

//   // 5. DELETE (Supprimer un test)
//   supprimerTest(id) {
//     return axios.delete(`${API_URL}${id}/`);
//   },

//   // BONUS : Télécharger le PDF du test
//   telechargerPdf(id) {
//     return axios.get(`${API_URL}${id}/telecharger_pdf/`, {
//       responseType: 'blob',
//     });
//   },

//   // Action personnalisée pour publier
//   publierTest(id, data) {
//     return axios.post(`${API_URL}${id}/publier/`, data);
//   }
// };

import api from './api'

export default {
  // 1. READ (Liste de tous les tests)
  obtenirTests() {
    return api.get('tests/tests/')
  },

  // 2. READ (Un seul test par son ID)
  obtenirTestParId(id) {
    return api.get(`tests/tests/${id}/`)
  },

  // 3. CREATE (Créer un nouveau test)
  creerTest(data) {
    return api.post('tests/tests/', data)
  },

  // 4. UPDATE (Modifier un test existant)
  modifierTest(id, data) {
    return api.put(`tests/tests/${id}/`, data)
  },

  // 5. DELETE (Supprimer un test)
  supprimerTest(id) {
    return api.delete(`tests/tests/${id}/`)
  },

  // BONUS : Télécharger le PDF du test
  telechargerPdf(id) {
    return api.get(`tests/tests/${id}/telecharger_pdf/`, {
      responseType: 'blob',
    })
  },

  // Action personnalisée pour publier
  publierTest(id, data) {
    return api.post(`tests/tests/${id}/publier/`, data)
  }
}