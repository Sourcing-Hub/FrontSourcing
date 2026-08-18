<script setup>
/**
 * Vue d'administration de la gestion du personnel (Équipe Pédagogique et Gestion de Projet).
 */
import { ref, onMounted, computed } from 'vue'
import { useUtilisateursStore } from '../stores/utilisateurs'
import { useAuthStore } from '../stores/auth'
import { useModalStore } from '../stores/modal'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { 
  Plus, 
  Loader2, 
  Users, 
  UserPlus, 
  ShieldAlert, 
  CheckCircle, 
  XCircle,
  Lock,
  Unlock,
  Trash2,
  Ban
} from 'lucide-vue-next'

const store = useUtilisateursStore()
const authStore = useAuthStore()
const modalStore = useModalStore()

const currentTab = ref('TOUS') // TOUS, PEDAGOGIE, GESTION
const showInviteModal = ref(false)
const inviteForm = ref({
  email: '',
  prenom: '',
  nom: '',
  role: ''  // L'admin doit toujours choisir explicitement
})

onMounted(async () => {
  if (authStore.isAdmin) {
    await store.fetchUtilisateurs()
  }
})

const filteredUsers = computed(() => {
  if (currentTab.value === 'PEDAGOGIE') {
    return store.pedagogieUsers
  } else if (currentTab.value === 'GESTION') {
    return store.gestionUsers
  }
  // Exclure les candidats de la vue globale du personnel pour plus de lisibilité
  return store.utilisateurs.filter(u => u.role_nom !== 'Candidat')
})

const openInviteModal = () => {
  // Toujours repartir à zéro — l'admin doit choisir le rôle explicitement
  inviteForm.value = { email: '', prenom: '', nom: '', role: '' }
  store.error = null
  showInviteModal.value = true
}

const submitInvite = async () => {
  const result = await store.createPersonnel(inviteForm.value)
  if (result) {
    showInviteModal.value = false
    const roleLabel = result.role || inviteForm.value.role
    await modalStore.showAlert(
      `Invitation envoyée avec succès à ${result.email} en tant que « ${roleLabel} ».`,
      'Invitation envoyée',
      'success'
    )
  }
}

const handleBlockToggle = async (user) => {
  const blockAction = user.is_active ? 'bloquer' : 'debloquer'
  const confirmMsg = user.is_active 
    ? `Voulez-vous vraiment bloquer le compte de ${user.prenom} ${user.nom} ? L'utilisateur ne pourra plus se connecter.` 
    : `Voulez-vous réactiver le compte de ${user.prenom} ${user.nom} ?`
  
  const confirmed = await modalStore.showConfirm(
    confirmMsg,
    user.is_active ? 'Bloquer un utilisateur' : 'Débloquer un utilisateur',
    { variant: user.is_active ? 'warning' : 'success' }
  )
  if (confirmed) {
    await store.toggleBlockUser(user.id, blockAction)
  }
}

const handleDeleteUser = async (user) => {
  const confirmMsg = `Voulez-vous vraiment supprimer définitivement le compte de ${user.prenom} ${user.nom} ? Cette action est irréversible et effacera toutes ses données.`
  const confirmed = await modalStore.showConfirm(
    confirmMsg,
    'Supprimer un utilisateur',
    { confirmText: 'Supprimer', variant: 'danger' }
  )
  if (confirmed) {
    await store.deleteUser(user.id)
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      
      <!-- Si non admin -->
      <div v-if="!authStore.isAdmin" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
        <ShieldAlert class="w-6 h-6 text-red-500 mr-3 mt-0.5" />
        <div>
          <h3 class="text-red-800 font-medium">Accès refusé</h3>
          <p class="text-red-700 text-sm mt-1">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>

      <!-- Contenu Admin -->
      <div v-else>
        <!-- En-tête -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center">
              <Users class="w-6 h-6 mr-2 text-[#CE0033]" />
              Gestion du Personnel
            </h1>
            <p class="text-sm text-gray-600 mt-1">Gérez les accès de l'équipe pédagogique et gestion de projet.</p>
          </div>
          <div class="mt-4 sm:mt-0">
            <button
              @click="openInviteModal"
              class="flex items-center px-4 py-2 bg-[#CE0033] text-white rounded-lg hover:bg-[#a8002a] transition-colors font-medium text-sm"
            >
              <UserPlus class="w-4 h-4 mr-2" />
              Inviter un membre
            </button>
          </div>
        </div>

        <!-- Onglets -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="currentTab = 'TOUS'"
              :class="[ currentTab === 'TOUS' ? 'border-[#CE0033] text-[#CE0033]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm' ]"
            >
              Tous les membres
            </button>
            <button
              @click="currentTab = 'PEDAGOGIE'"
              :class="[ currentTab === 'PEDAGOGIE' ? 'border-[#CE0033] text-[#CE0033]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm' ]"
            >
              Équipe Pédagogique
            </button>
            <button
              @click="currentTab = 'GESTION'"
              :class="[ currentTab === 'GESTION' ? 'border-[#CE0033] text-[#CE0033]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm' ]"
            >
              Équipe Gestion de Projet
            </button>
          </nav>
        </div>

        <!-- Erreur Globale -->
        <div v-if="store.error && !showInviteModal" class="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          {{ store.error }}
        </div>

        <!-- Table des utilisateurs -->
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div v-if="store.loading" class="flex justify-center items-center py-20">
            <Loader2 class="w-8 h-8 animate-spin text-[#CE0033]" />
          </div>
          
          <div v-else-if="filteredUsers.length === 0" class="text-center py-16 px-4">
            <div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900">Aucun utilisateur trouvé</h3>
            <p class="text-gray-500 mt-1">Il n'y a personne dans cette catégorie pour le moment.</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-[#CE0033]/10 flex items-center justify-center text-[#CE0033] font-bold">
                          {{ user.email.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ user.prenom }} {{ user.nom }}</div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="{ 'bg-blue-100 text-blue-800': user.role_nom === 'Administrateur', 'bg-purple-100 text-purple-800': user.role_nom === 'Équipe Pédagogique', 'bg-emerald-100 text-emerald-800': user.role_nom === 'Équipe Gestion de Projet', }">
                      {{ user.role_nom }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center text-sm">
                      <template v-if="!user.compteActive">
                        <XCircle class="w-4 h-4 text-amber-500 mr-1.5" />
                        <span class="text-gray-500">En attente</span>
                      </template>
                      <template v-else-if="!user.is_active">
                        <Ban class="w-4 h-4 text-red-500 mr-1.5" />
                        <span class="text-red-600 font-semibold">Bloqué</span>
                      </template>
                      <template v-else>
                        <CheckCircle class="w-4 h-4 text-emerald-500 mr-1.5" />
                        <span class="text-emerald-600 font-semibold">Actif</span>
                      </template>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ new Date(user.dateCreation).toLocaleDateString('fr-FR') }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <template v-if="user.id !== authStore.user?.id">
                      <button
                        v-if="user.compteActive"
                        @click="handleBlockToggle(user)"
                        :class="user.is_active ? 'text-amber-600 hover:text-amber-900 bg-amber-50' : 'text-emerald-600 hover:text-emerald-900 bg-emerald-50'"
                        class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        :title="user.is_active ? 'Bloquer le compte' : 'Débloquer le compte'"
                      >
                        <Lock v-if="user.is_active" class="w-3.5 h-3.5 mr-1" />
                        <Unlock v-else class="w-3.5 h-3.5 mr-1" />
                        {{ user.is_active ? 'Bloquer' : 'Débloquer' }}
                      </button>
                      <button
                        @click="handleDeleteUser(user)"
                        class="text-red-600 hover:text-red-900 bg-red-50 inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        title="Supprimer définitivement"
                      >
                        <Trash2 class="w-3.5 h-3.5 mr-1" />
                        Supprimer
                      </button>
                    </template>
                    <span v-else class="text-xs text-gray-400 italic">Moi</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'invitation -->
    <div v-if="showInviteModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Fond gris sombre -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showInviteModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <!-- Contenu Modal -->
        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#CE0033]/10 sm:mx-0 sm:h-10 sm:w-10">
                <UserPlus class="h-6 w-6 text-[#CE0033]" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Inviter un membre</h3>
                <div class="mt-4 space-y-4">
                  
                  <div v-if="store.error" class="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">
                    {{ store.error }}
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input 
                        type="text" 
                        v-model="inviteForm.prenom"
                        class="w-full border-gray-300 rounded-md focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm" 
                        placeholder="Ex: Souleymane"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input 
                        type="text" 
                        v-model="inviteForm.nom"
                        class="w-full border-gray-300 rounded-md focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm" 
                        placeholder="Ex: Ba"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
                    <input 
                      type="email" 
                      v-model="inviteForm.email"
                      class="w-full border-gray-300 rounded-md focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm" 
                      placeholder="prenom.nom@sourcinghub.com"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                    <select 
                      v-model="inviteForm.role"
                      class="w-full border-gray-300 rounded-md focus:ring-[#CE0033] focus:border-[#CE0033] sm:text-sm"
                      required
                    >
                      <option value="" disabled>-- Choisissez un rôle --</option>
                      <option value="Équipe Pédagogique">Équipe Pédagogique</option>
                      <option value="Équipe Gestion de Projet">Équipe Gestion de Projet</option>
                    </select>
                  </div>
                  
                  <p class="text-xs text-gray-500 mt-2">
                    L'utilisateur recevra un email contenant un lien unique (valable 48h) pour activer son compte et définir son mot de passe.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-[#CE0033] text-base font-medium text-white hover:bg-[#a8002a] focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              @click="submitInvite"
              :disabled="store.loading || !inviteForm.email || !inviteForm.role"
            >
              <Loader2 v-if="store.loading" class="w-4 h-4 mr-2 animate-spin" />
              Envoyer l'invitation
            </button>
            <button 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="showInviteModal = false"
              :disabled="store.loading"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
