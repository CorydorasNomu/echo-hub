<template>
  <div>
    <header-component></header-component>
  </div>
  <div class="photo-screen-frame">
    <!-- ヘッダ -->
    <div class="photo-header-container">
      <std-button :click="openAddFriendModal" icon="friend" :label="FRIEND.addFriend"></std-button>
      <std-button :click="reload" icon="reload" style="margin-left: 15px;"></std-button>
    </div>
    <!-- 知り合い一覧 -->
    <div class="flex-base-frame-center mt-20">
      <table class="friend-table"><tbody>
        <tr>
          <th class="friend-table-th">{{ PROFILE.name }}</th>
          <th class="friend-table-th">{{ PROFILE.email }}</th>
          <th class="friend-table-th">{{ COMMON.operation }}</th>
        </tr>
        <tr v-for="friend in state.friendList" :key="friend.uid">
          <td class="friend-table-td">{{ friend.name }}</td>
          <td class="friend-table-td">{{ friend.email }}</td>
          <td class="friend-table-td"><std-button icon="delete" @click="openDelModal(friend.uid)"></std-button></td>
        </tr>
      </tbody></table>
    </div>
  </div>
  <div v-if="state.isOnLoading">
    <spiner-component></spiner-component>
  </div>

  <!-- 知り合い追加(実行) -->
  <modal-component v-if="state.isAddFriendModalVisible"
    :title="FRIEND.addFriend"
    :isOkVisible="!state.isAlreadyFriend && state.searchResult.uid !== ''"
    :okLabel="FRIEND.add"
    :cancelLabel="COMMON.close"
    :ok="addFriend"
    :cancel="closeModal"
  >
    <div class="flex-base-frame-center w-80" style="color: #313131;">
      <div>{{ state.isSearchCompleted ? FRIEND.addConfirmMsg : FRIEND.addFriendMsg }}</div>
      <div class="flex-base-area w-full mt-20">
        <div class="text-form-container w-90">
          <input type="text" id="name" name="name" v-model="state.searchAddress">
        </div>
        <div class="w-10"><std-button :click="searchFriend" isInModal icon="search"></std-button></div>
      </div>
      <div v-if="state.isOnSearching"><ellipse-component></ellipse-component></div>
      <div v-else class="flex-base-area mt-20" style="font-size: large;">
        <svg v-if="state.isAlreadyFriend" xmlns="http://www.w3.org/2000/svg" class="mr-20" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path d="M10.2426 16.3137L6 12.071L7.41421 10.6568L10.2426 13.4853L15.8995 7.8284L17.3137 9.24262L10.2426 16.3137Z" fill="rgb(0,204,0)"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" fill="rgb(0, 204, 0)"/>
        </svg>
        <div>{{ state.searchResult.name }}</div>
      </div>
    </div>
  </modal-component>

  <!-- 知り合い追加(完了) -->
  <modal-component v-if="state.isAddFriendCompleted"
    :title="FRIEND.addFriend"
    :isOkVisible="false"
    :cancelLabel="COMMON.close"
    :cancel="closeModal"
  >
    <div class="flex-base-frame-center w-80" style="color: #313131;">
      <div>{{ FRIEND.addCompleted }}</div>
      <div class="mt-20">{{ state.searchResult.name }}</div>
    </div>
  </modal-component>
</template>


<script lang="ts">
// Vue Module
import { defineComponent, reactive, onMounted } from "vue"
// Firebase Module
import firebase from "../api/firebase"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from "firebase/firestore"
// import { httpsCallable, type HttpsCallableResult } from "firebase/functions"
// UI Components
import modal   from "@/components/ModalComponent.vue"
import header  from "@/components/HeaderComponent.vue"
import btn     from "@/components/StandardButton.vue"
import spiner  from "@/components/ProcessingSpiner.vue"
import ellipse from "@/components/ProcessingEllipsis.vue"
import { COMMON, PHOTO, FRIEND, PROFILE } from "@/constants/messages"

// View 内変数の型宣言
interface UserData {
  uid: string,
  email: string,
  name: string
}
interface State {
  friendList: Array<UserData>,
  isAddFriendModalVisible: boolean,
  isAddFriendCompleted: boolean,
  searchAddress: string,
  searchResult: UserData,
  isOnSearching: boolean,
  isSearchCompleted: boolean,
  okBtnLabel: string,
  cancelBtnLabel: string,
  isOnLoading: boolean,
  isAlreadyFriend: boolean
}
const DEFAULT_USER = { uid: "", email: "", name: "" }

export default defineComponent({
  components: {
    "header-component": header,
    "std-button": btn,
    "spiner-component": spiner,
    "modal-component": modal,
    "ellipse-component": ellipse
  },

  setup () {
    const state = reactive<State>({
      friendList: [],
      isAddFriendModalVisible: false,
      isAddFriendCompleted: false,
      searchAddress: "",
      searchResult: DEFAULT_USER,
      isOnSearching: false,
      isSearchCompleted: false,
      okBtnLabel: PHOTO.selectPhoto,
      cancelBtnLabel: COMMON.cancel,
      isOnLoading: false,
      isAlreadyFriend: false
    })

    /** ライフサイクル */
    onMounted(() => { reload() })

    const openAddFriendModal = () => {
      state.isAddFriendModalVisible = true
    }

    const closeModal = () => {
      state.isAddFriendModalVisible = false
      state.isAddFriendCompleted = false
      state.searchAddress = ""
      state.isAlreadyFriend = false
      state.searchResult = DEFAULT_USER
    }

    const searchFriend = async () => {
      if (!state.searchAddress) return
      state.isOnSearching = true
      const ref = collection(firebase.db, "user");
      const q = query(ref, where("email", "==", state.searchAddress));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        state.searchResult = { uid: doc.id, email: doc.data().email, name: doc.data().name }
      });
      if (state.searchResult.uid) {
        const auth = getAuth()
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const ref = doc(firebase.db, "user", user.uid)
            const docSnap = await getDoc(ref)
            const friends = docSnap.exists() ? docSnap.data().friend : []
            state.isAlreadyFriend = friends.some((f: string) => f === state.searchResult.uid)
          }
        })
      }
      state.isOnSearching = false
      // const search = httpsCallable(firebase.functions, "searchFriend")
      // search({ email: state.searchAddress }).then((result: HttpsCallableResult<unknown>) => {
      //   const users = result.data as Array<any>
      //   state.searchResult = (users.length > 0) ? users[0].name : FRIEND.friendNotFound
      //   console.log('complete', state.searchResult)
      //   state.isOnSearching = false
      // })
    }

    const addFriend = () => {
      if (!state.searchResult.uid) return
      state.isOnLoading = true
      const auth = getAuth()
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const ref = doc(firebase.db, "user", user.uid)
          const docSnap = await getDoc(ref)
          const friends = docSnap.exists() ? docSnap.data().friend : []
          if (!friends.some((f: string) => f === state.searchResult.uid)) {
            friends.push(state.searchResult.uid)
            await updateDoc(ref, { friend: friends })
            await reload()
          }
        }
      })
      state.isOnLoading = false
      state.isAddFriendModalVisible = false
      state.isAddFriendCompleted = true
    }

    const reload = () => {
      state.isOnLoading = true
      const auth = getAuth()
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const snap = await getDoc(doc(firebase.db, "user", user.uid))
          const friendList = snap.exists() ? snap.data().friend : []
          state.friendList = await Promise.all(
            friendList.map(async (uid: string) => {
              const snap = await getDoc(doc(firebase.db, "user", uid))
              if (snap.exists()) {
                return { uid: uid, email: await snap.data().email, name: await snap.data().name }
              }
            })
          )
          // TODO Fetch the second page if there are more elements.
        }
        state.isOnLoading = false
      })
    }

    const openDelModal = async (uid: string) => {
      onAuthStateChanged(firebase.auth, async (user) => {
        if (user) {
          const snap = await getDoc(doc(firebase.db, "user", user.uid))
          const data = snap.exists() ? snap.data() : null
          if (data) {
            const friends = (data.friend || []).filter((f: string) => f !== uid)
            await updateDoc(doc(firebase.db, "user", user.uid), { friend: friends })
            await reload()
          }
        }
      })
    }

    return {
      PHOTO, COMMON, FRIEND, PROFILE, state,
      openAddFriendModal,
      openDelModal,
      closeModal,
      searchFriend,
      addFriend,
      reload
    }
  }
})
</script>


<style scoped>
.friend-table {
  border-collapse:  collapse;
}

.friend-table-th, .friend-table-td {
  border: solid 1px;
  padding: 15px;
}

.photo-screen-frame {
  display: block;
  margin-top: 10px;
}

.photo-header-container {
  display: flex;
  justify-content: left;
  align-items: center;
}
</style>