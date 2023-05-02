<template>
  <div>
    <header-component></header-component>
  </div>
  <div class="profile-screen-frame">
    <div class="profile-header-container"><h2>{{ PROFILE.profile }}</h2></div>
    <div class="profile-body-container">
      <table class="profile-table">
        <tbody>
          <tr>
            <th class="profile-table-th">{{ PROFILE.email }}</th>
            <td class="profile-table-td">{{ state.email }}</td>
            <td class="profile-table-td"></td>
          </tr>
          <tr>
            <th class="profile-table-th">{{ PROFILE.name }}</th>
            <td class="profile-table-td">{{ state.name || PROFILE.defaultName }}</td>
            <td class="profile-table-td"><std-button icon="edit" :click="openNameModal"></std-button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-if="state.isOnLoading">
    <spiner-component></spiner-component>
  </div>

  <!-- 名前変更 -->
  <modal-component v-if="state.modal.name" :title="PROFILE.nameTitle" :ok="update" :cancel="closeModal">
    <div v-if="!state.isOnUpdating" class="text-form-container">
      <input type="text" id="name" name="name" v-model="state.nameForm">
    </div>
    <div v-else><ellipse-component></ellipse-component></div>
  </modal-component>

  <!-- 名前変更完了 -->
  <modal-component v-if="state.isUpdateCompleted" :ok="closeModal" :is-cancel-visible="false">
    <div style="color: #313131;">{{ PROFILE.completed }}</div>
  </modal-component>
</template>


<script lang="ts">
// Vue Module
import { defineComponent, reactive, onMounted } from "vue"
// Firebase Module
import firebase from "@/api/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
// UI Components
import header  from "@/components/HeaderComponent.vue"
import modal   from "@/components/ModalComponent.vue"
import spiner  from "@/components/ProcessingSpiner.vue"
import btn     from "@/components/StandardButton.vue"
import ellipse from "@/components/ProcessingEllipsis.vue"
import { PROFILE } from "@/constants/messages"

interface ModalState {
  name: boolean
}
interface ProfileProps {
  uid: string,
  email: string,
  name: string,
  nameForm: string,
  comment: string,
  modal: ModalState,
  isUpdateCompleted: boolean,
  isOnLoading: boolean,
  isOnUpdating: boolean
}

export default defineComponent({
  components: {
    "header-component": header,
    "modal-component": modal,
    "spiner-component": spiner,
    "std-button": btn,
    "ellipse-component": ellipse
  },

  setup () {
    const state = reactive<ProfileProps>({
      uid: "",
      email: "",
      name: "",
      nameForm: "",
      comment: "",
      modal: { name: false },
      isUpdateCompleted: false,
      isOnLoading: false,
      isOnUpdating: false
    })

    onMounted(() => {
      onAuthStateChanged(firebase.auth, async (user) => {
        if (user) {
          const docSnap = await getDoc(doc(firebase.db, 'user', user.uid))
          const data = docSnap.exists() ? docSnap.data() : null
          if (data) {
            state.uid = user.uid
            state.email = user.email || PROFILE.empty
            state.name = data.name || PROFILE.defaultName
            state.nameForm = data.name || PROFILE.defaultName
            state.comment = data.comment
          } else {
            // TODO No data from firestore
          }
        }
      })
    })

    /** 関数 */
    const openNameModal = () => {
      state.nameForm = state.name
      state.modal.name = true
    }

    const closeModal = () => {
      state.modal = { name: false }
      state.isUpdateCompleted = false
    }

    const update = async () => {
      // TODO ダイアログ内のくるくる
      await updateDoc(doc(firebase.db, "user", state.uid), { name: state.nameForm })
      state.name = state.nameForm
      closeModal()
      state.isUpdateCompleted = true
    }

    return {
      state, PROFILE,
      openNameModal,
      closeModal,
      update
    }
  }
})
</script>


<style scoped>
.profile-screen-frame {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.profile-header-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-body-container {
  display: block;
  width: max-content;
}

.profile-table {
  border-collapse:  collapse;
}

.profile-table-th, .profile-table-td {
  border: solid 1px;
  padding: 15px;
}
</style>