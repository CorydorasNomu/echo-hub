<template>
  <div class="header-area-frame">
    <div class="header-left-container">
      <h1 class="app-name-label">{{ COMMON.app }}</h1>
      <std-button v-if="!isMenu" @click="goToMenu" icon="menu" style="margin-left: 20px;"></std-button>
    </div>
    <div class="header-right-container">
      <div class="handle-name-area">
        <div class="handle-name-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
            <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
          </svg>
          <label style="margin-left: 10px;">{{ PROFILE.hello }}</label>
        </div>
        <div>
          <label :class="{'name-link-fix': isProfile, 'name-link': !isProfile}" @click="goToProfile">
            {{ state.name }}
          </label>
        </div>
        <label style="margin-left: 10px;">{{ PROFILE.title }}</label>
      </div>
      <std-button @click="openLogoutModal" icon="logout" style="margin-left: 10px;"></std-button>
    </div>
  </div>

  <!-- ログアウト確認ダイアログ -->
  <modal-component v-if="state.isModalVisible" :ok="logout" :cancel="closeLogoutModal">
    <div style="color: #313131;">{{ COMMON.logoutConfirm }}</div>
  </modal-component>
</template>


<script lang="ts">
// Vue Module
import { defineComponent, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// Firebase Module
import firebase from '../api/firebase'
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
// UI Components
import btn   from '@/components/StandardButton.vue'
import modal from '@/components/ModalComponent.vue'
import { COMMON, PROFILE } from '@/constants/messages'

interface AppHeaderProps {
  name: string,
  isModalVisible: boolean
}

export default defineComponent({
  // コンポーネント
  components: {
    'std-button': btn,
    'modal-component': modal
  },

  setup () {
    /** 変数 */
    const state = reactive<AppHeaderProps>({
      name: '',
      isModalVisible: false
    })
    const router = useRouter()
    const isMenu = computed(() => { return useRoute().name === 'menu' })
    const isProfile = computed(() => { return useRoute().name === 'profile' })

    onMounted(() => {
      onAuthStateChanged(firebase.auth, async (user) => {
        if (user) {
          const docSnap = await getDoc(doc(firebase.db, 'user', user.uid))
          state.name = docSnap.exists() ? docSnap.data().name : PROFILE.defaultName
        }
      })
    })

    /** 関数 */
    const openLogoutModal = () => {
      state.isModalVisible = true
    }

    const closeLogoutModal = () => {
      state.isModalVisible = false
    }

    const goToMenu = () => {
      router.push({ path: '/' });
    }

    const goToProfile = () => {
      if (!isProfile.value) router.push({ path: '/profile' })
    }

    const logout = () => {
      signOut(firebase.auth)
        .then(() => router.push({ path: 'login' }))
        .catch((err) => {
          console.log(err.message);
        })
    }

    // テンプレートに公開
    return {
      COMMON, PROFILE,
      state,
      isMenu, isProfile,
      openLogoutModal,
      closeLogoutModal,
      goToMenu,
      goToProfile,
      logout
    }
  }
})
</script>


<style scoped>
.header-area-frame {
  display: flex;
  flex-direction: row;
  place-items: center;
  width: 100%;
}

.header-left-container {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  width: 100%;
}

.header-right-container {
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  width: 100%;
}

.app-name-label {
  color: antiquewhite;
}

.handle-name-area,
.handle-name-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.name-link-fix,
.name-link {
  font-weight: 900;
  color: antiquewhite;
}

.name-link:hover {
  cursor: pointer;
  border-bottom:3px solid antiquewhite
}
</style>