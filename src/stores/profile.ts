import { defineStore } from 'pinia';
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import firebase from '../api/firebase'

export const useProfileStore = defineStore('profile', {
    state: () => ({
      email: '',
      name: '',
      comment: '',
      createdAt: ''
    }),
    actions: {
      async setupProfile () {
        if (this.email && this.name) return
        await onAuthStateChanged(firebase.auth, async (user) => {
          if (user) {
            const docSnap = await getDoc(doc(firebase.db, 'user', user.uid))
            if (docSnap.exists()) {
              this.email = docSnap.data().email
              this.name = docSnap.data().name
              this.comment = docSnap.data().comment
              this.createdAt = docSnap.data().createdAt
            }
          } else {
            // noop
          }
        })
      }
    },
    persist: true
});
