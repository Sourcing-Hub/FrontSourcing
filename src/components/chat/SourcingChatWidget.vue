<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import sourcingChatService from '../../services/sourcingChat'
import {
  Sparkles,
  Send,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Bot,
  User,
  AlertCircle,
  MessageSquare
} from 'lucide-vue-next'

const authStore = useAuthStore()

// États d'affichage
const isOpen = ref(false)
const isExpanded = ref(false)
const userInput = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)
const inputField = ref(null)

// Messages
const messages = ref([])
const suggestions = ref([
  'Combien de candidatures sont en cours ?',
  'Quelles sont les campagnes ouvertes ?',
  'Planning des sessions et entretiens',
  'Résume les statistiques globales'
])

const isUserConnected = computed(() => authStore.isAuthenticated)

// Persistance de session
const STORAGE_KEY = 'sourcinghub_sourcingchat_messages'

function loadSavedMessages() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      messages.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('Erreur chargement messages SourcingChat:', e)
  }
}

function saveMessages() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
  } catch (e) {
    console.error('Erreur sauvegarde messages SourcingChat:', e)
  }
}

// Fonction de suppression de tout emoji pour garantir une interface 100% sobre
function removeEmojis(str) {
  if (!str) return ''
  return str.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ''
  )
}

// Chargement des suggestions dynamiques selon le rôle
async function fetchSuggestions() {
  if (!isUserConnected.value) return
  try {
    const data = await sourcingChatService.getSuggestions()
    if (data.suggestions && data.suggestions.length) {
      suggestions.value = data.suggestions.map(removeEmojis)
    }
  } catch (e) {
    // Utilise les suggestions par défaut
  }
}

onMounted(() => {
  loadSavedMessages()
  fetchSuggestions()
  window.addEventListener('open-sourcingchat', toggleOpen)
  window.addEventListener('open-copilot', toggleOpen)
})

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
      inputField.value?.focus()
    })
  }
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  nextTick(() => scrollToBottom())
}

function clearHistory() {
  messages.value = []
  sessionStorage.removeItem(STORAGE_KEY)
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Rendu Markdown enrichi en HTML avec couleurs contrastées garanties (aucun texte blanc sur fond clair)
function renderMarkdown(text) {
  if (!text) return ''
  let cleanText = removeEmojis(text)
  let html = cleanText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Blocs de code
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-[#01313E] text-emerald-300 p-3 rounded-xl text-xs overflow-x-auto my-2 border border-slate-300 font-mono"><code>$1</code></pre>'
  )

  // Code inline
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-slate-200 text-[#E30046] px-1.5 py-0.5 rounded text-xs font-mono font-semibold">$1</code>'
  )

  // Titres Markdown
  html = html.replace(/^### (.*$)/gim, '<h4 class="font-bold text-sm text-[#01313E] mt-3 mb-1">$1</h4>')
  html = html.replace(
    /^## (.*$)/gim,
    '<h3 class="font-bold text-base text-[#01313E] mt-3 mb-1.5 border-b border-slate-200 pb-1">$1</h3>'
  )
  html = html.replace(/^# (.*$)/gim, '<h2 class="font-black text-lg text-[#01313E] mt-3 mb-2">$1</h2>')

  // Gras & Italique
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#01313E]">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')

  // Puces de listes
  html = html.replace(
    /^\s*[-*]\s+(.*$)/gim,
    '<li class="ml-4 list-disc text-sm text-slate-800 leading-relaxed">$1</li>'
  )

  // Tableaux Markdown (| col | col |)
  const lines = html.split('\n')
  let inTable = false
  let tableHtml = ''
  const processedLines = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('|') && line.endsWith('|')) {
      if (/^\|[\s\-:|]+\|$/.test(line)) {
        continue
      }
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim())
      if (!inTable) {
        inTable = true
        tableHtml =
          '<div class="overflow-x-auto my-3"><table class="w-full text-xs text-left border-collapse rounded-lg overflow-hidden border border-slate-200">'
        tableHtml += '<thead class="bg-[#01313E] text-white"><tr>'
        cells.forEach((c) => {
          tableHtml += `<th class="p-2.5 border border-slate-600 font-bold">${c}</th>`
        })
        tableHtml += '</tr></thead><tbody>'
      } else {
        tableHtml += '<tr class="border-b border-slate-200 bg-white hover:bg-slate-50">'
        cells.forEach((c) => {
          tableHtml += `<td class="p-2 border border-slate-200 text-slate-800 font-medium">${c}</td>`
        })
        tableHtml += '</tr>'
      }
    } else {
      if (inTable) {
        tableHtml += '</tbody></table></div>'
        processedLines.push(tableHtml)
        inTable = false
        tableHtml = ''
      }
      processedLines.push(line)
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table></div>'
    processedLines.push(tableHtml)
  }
  html = processedLines.join('\n')
  html = html.replace(/\n/g, '<br>')
  return html
}

// Envoi d'un message
async function handleSend(textToSend) {
  const text = (textToSend || userInput.value).trim()
  if (!text || isLoading.value) return

  const userMsg = {
    id: Date.now(),
    role: 'user',
    content: removeEmojis(text),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  messages.value.push(userMsg)
  userInput.value = ''
  isLoading.value = true
  saveMessages()
  nextTick(() => scrollToBottom())

  try {
    const res = await sourcingChatService.sendMessage(text)
    const assistantMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      content: removeEmojis(res.response || 'Réponse indisponible pour le moment.'),
      provider: res.provider,
      warning: removeEmojis(res.warning || ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(assistantMsg)
    saveMessages()
  } catch (err) {
    console.error('Erreur SourcingChat:', err)
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content:
        'Une erreur de communication est survenue avec le serveur SourcingHub. Veuillez réessayer dans quelques instants.',
      isError: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    saveMessages()
  } finally {
    isLoading.value = false
    nextTick(() => {
      scrollToBottom()
      inputField.value?.focus()
    })
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <!-- Le widget n'apparaît que pour les utilisateurs connectés -->
  <div v-if="isUserConnected" class="fixed z-50 bottom-6 right-6 font-sans">
    <!-- ── BOUTON FLOTTANT D'OUVERTURE ──────────────────── -->
    <button
      v-if="!isOpen"
      type="button"
      @click="toggleOpen"
      class="group relative flex items-center gap-2.5 rounded-full bg-[#01313E] px-4 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-[#024456] active:scale-95 shadow-lg"
      aria-label="Ouvrir SourcingChat"
    >
      <!-- Icône avec badge -->
      <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#E30046] text-white">
        <Sparkles class="h-4 w-4 animate-pulse" />
      </div>
      <div class="relative flex flex-col items-start pr-1 text-left">
        <span class="text-xs font-black tracking-wide uppercase text-white">SourcingChat</span>
        <span class="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
          Assistant IA Live
        </span>
      </div>
    </button>

    <!-- ── FENÊTRE DE CHAT ─────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-200 ease-out transform"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in transform"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="isOpen"
        class="flex flex-col overflow-hidden rounded-3xl bg-white border border-slate-300 transition-all duration-300 shadow-2xl"
        :class="[
          isExpanded ? 'fixed inset-4 sm:inset-10 z-50' : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
        ]"
      >
        <!-- ── HEADER DU WIDGET ──────────────────────────── -->
        <div class="relative flex items-center justify-between bg-[#01313E] px-4 py-3.5 text-white border-b border-white/10 select-none">
          <div class="flex items-center gap-3 relative z-10">
            <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#E30046] text-white">
              <Sparkles class="h-4 w-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-black tracking-tight text-white">SourcingChat</h3>
                <span class="rounded-full bg-[#E30046]/25 border border-[#E30046]/40 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                  IA Live
                </span>
              </div>
              <p class="text-[11px] text-white/60 flex items-center gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Connecté aux données plateforme SourcingHub
              </p>
            </div>
          </div>

          <!-- Actions Header -->
          <div class="flex items-center gap-1 relative z-10">
            <!-- Clear History -->
            <button
              type="button"
              @click="clearHistory"
              title="Effacer la conversation"
              class="rounded-xl p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <Trash2 class="h-4 w-4" />
            </button>
            <!-- Expand / Minimize -->
            <button
              type="button"
              @click="toggleExpand"
              :title="isExpanded ? 'Réduire' : 'Agrandir'"
              class="hidden sm:inline-flex rounded-xl p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <Minimize2 v-if="isExpanded" class="h-4 w-4" />
              <Maximize2 v-else class="h-4 w-4" />
            </button>
            <!-- Close -->
            <button
              type="button"
              @click="toggleOpen"
              title="Fermer"
              class="rounded-xl p-1.5 text-white/60 transition hover:bg-[#E30046] hover:text-white"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- ── CORPS DE LA CONVERSATION ──────────────────── -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-sm bg-slate-50/50"
        >
          <!-- Message d'accueil initial si vide -->
          <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center p-4">
            <div class="h-14 w-14 rounded-3xl bg-[#01313E]/5 border border-[#01313E]/10 flex items-center justify-center text-[#01313E] mb-3">
              <Bot class="h-7 w-7 text-[#01313E]" />
            </div>
            <h4 class="text-base font-extrabold text-[#01313E] mb-1">
              Bienvenue sur SourcingChat
            </h4>
            <p class="text-xs text-slate-600 max-w-xs mb-5">
              Posez vos questions sur les campagnes, candidatures, sessions d'évaluation ou statistiques en direct.
            </p>

            <!-- Suggestions rapides -->
            <div class="w-full space-y-2">
              <p class="text-[10px] font-black uppercase tracking-wider text-slate-400 text-left px-1">
                Questions fréquentes
              </p>
              <div class="grid grid-cols-1 gap-1.5">
                <button
                  v-for="(suggestion, i) in suggestions"
                  :key="i"
                  type="button"
                  @click="handleSend(suggestion)"
                  class="flex items-center gap-2 w-full text-left rounded-2xl bg-white p-2.5 text-xs font-semibold text-[#01313E] border border-slate-200 transition hover:border-[#E30046] hover:bg-[#E30046]/5 hover:text-[#E30046] shadow-sm"
                >
                  <Sparkles class="h-3.5 w-3.5 text-[#E30046] shrink-0" />
                  <span class="truncate">{{ suggestion }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Liste des messages -->
          <template v-else>
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="flex flex-col"
              :class="msg.role === 'user' ? 'items-end' : 'items-start'"
            >
              <div
                class="flex items-end gap-2 max-w-[90%]"
                :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
              >
                <!-- Avatar -->
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold shadow-sm"
                  :class="msg.role === 'user' ? 'bg-[#01313E] text-white' : 'bg-[#E30046] text-white'"
                >
                  <User v-if="msg.role === 'user'" class="h-3.5 w-3.5" />
                  <Sparkles v-else class="h-3.5 w-3.5" />
                </div>

                <!-- Bulle de message -->
                <div
                  class="rounded-2xl px-4 py-3 shadow-sm transition-all"
                  :class="[
                    msg.role === 'user'
                      ? 'bg-[#01313E] text-white rounded-br-none'
                      : msg.isError
                        ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  ]"
                >
                  <!-- Contenu User -->
                  <p v-if="msg.role === 'user'" class="whitespace-pre-wrap leading-relaxed text-sm font-medium text-white">
                    {{ msg.content }}
                  </p>

                  <!-- Contenu Assistant (Markdown) -->
                  <div
                    v-else
                    class="markdown-body leading-relaxed text-sm text-slate-800"
                    v-html="renderMarkdown(msg.content)"
                  ></div>

                  <!-- Avertissement éventuel -->
                  <p
                    v-if="msg.warning"
                    class="mt-2 text-[11px] text-amber-800 bg-amber-50 rounded-lg p-1.5 border border-amber-200 flex items-center gap-1 font-medium"
                  >
                    <AlertCircle class="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span>{{ msg.warning }}</span>
                  </p>

                  <!-- Timestamp -->
                  <div
                    class="mt-1.5 text-[10px] text-right font-medium"
                    :class="msg.role === 'user' ? 'text-white/60' : 'text-slate-400'"
                  >
                    {{ msg.timestamp }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Indicateur de chargement / écriture -->
            <div v-if="isLoading" class="flex items-end gap-2 items-start">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#E30046] text-white shadow-sm">
                <Sparkles class="h-3.5 w-3.5" />
              </div>
              <div class="rounded-2xl rounded-bl-none bg-white px-4 py-3 border border-slate-200 flex items-center gap-2 shadow-sm">
                <div class="flex gap-1">
                  <span class="h-2 w-2 rounded-full bg-[#E30046] animate-bounce"></span>
                  <span class="h-2 w-2 rounded-full bg-[#E30046] animate-bounce [animation-delay:0.2s]"></span>
                  <span class="h-2 w-2 rounded-full bg-[#E30046] animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span class="text-xs text-slate-600 font-medium ml-1">Analyse des donnees en direct...</span>
              </div>
            </div>
          </template>
        </div>

        <!-- ── PIED DE SAISIE ───────────────────────────── -->
        <div class="bg-white p-3 border-t border-slate-200">
          <form @submit.prevent="handleSend()" class="relative flex items-center gap-2">
            <textarea
              ref="inputField"
              v-model="userInput"
              rows="1"
              placeholder="Posez votre question à SourcingChat..."
              @keydown="handleKeydown"
              :disabled="isLoading"
              class="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#01313E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#01313E]/10 transition disabled:opacity-50"
            ></textarea>
            <button
              type="submit"
              :disabled="!userInput.trim() || isLoading"
              class="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E30046] text-white transition-all hover:bg-[#c4003c] disabled:opacity-30 disabled:hover:bg-[#E30046] active:scale-95 shadow-sm"
              aria-label="Envoyer"
            >
              <Send class="h-4 w-4" />
            </button>
          </form>
          <div class="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-400">
            <span>Appuyez sur <strong class="text-slate-600">Entrée</strong> pour envoyer</span>
            <span class="font-semibold text-[#01313E]">SourcingChat - SourcingHub</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(1, 49, 62, 0.15);
  border-radius: 999px;
}
:deep(.markdown-body) {
  color: #1e293b !important;
}
:deep(.markdown-body p) {
  margin-bottom: 0.5rem;
  color: #1e293b !important;
}
:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}
:deep(.markdown-body ul) {
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  color: #1e293b !important;
}
:deep(.markdown-body li) {
  color: #1e293b !important;
}
:deep(.markdown-body strong) {
  color: #01313e !important;
  font-weight: 700;
}
:deep(.markdown-body h2),
:deep(.markdown-body h3),
:deep(.markdown-body h4) {
  color: #01313e !important;
  font-weight: 800;
}
</style>
