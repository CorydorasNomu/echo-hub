<template>
  <div>
    <header-component></header-component>
  </div>
  <div class="photo-screen-frame">
    <!-- ヘッダ -->
    <div class="photo-header-container">
      <std-button :click="openUploadModal" icon="upload" :label="PHOTO.upload"></std-button>
      <std-button :click="reload" icon="reload" style="margin-left: 15px;"></std-button>
    </div>

    <!-- 写真一覧 -->
    <div class="photo-body-container">
      <div v-for="t in state.thumbnails" class="thumbnail-container" :key="t.thumbURL" @click="openDownloadModal(t)">
        <img :src="t.thumbURL" :alt="t.orgURL" :title="t.name">
      </div>
    </div>

  </div>
  <div v-if="state.isOnLoading">
    <spiner-component></spiner-component>
  </div>

  <!-- 写真詳細 -->
  <background-pverlay v-if="state.isDownloadModalVisible">
    <div class="modal-frame-base photo-detail-frame">
      <div class="photo-image-area">
        <img :src="state.photoDetails.orgURL" class="photo-image-style">
      </div>
      <div class="photo-metadata-area">
        <div>{{ PHOTO.photoName + state.photoDetails.name }}</div>
        <div class="photo-metadata-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
          <div class="tooltip">
            <div>{{ PHOTO.createdAt + state.photoDetails.createdAt }}</div>
            <div>{{ PHOTO.frameSize + state.photoDetails.frameSize }}</div>
            <div>{{ PHOTO.dataSize + state.photoDetails.dataSize }}</div>
          </div>
        </div>
      </div>
      <div class="photo-operation-area">
        <std-button :isOk="false" :isInModal="true" :label="COMMON.cancel" :click="closeDownloadModal" style="margin-right: 10px;"></std-button>
        <std-button :label="PHOTO.download" :isInModal="true" :click="download" style="margin-left: 10px;"></std-button>
      </div>
    </div>
  </background-pverlay>

  <!-- 写真アップロード -->
  <background-pverlay v-if="state.isUploadModalVisible">
    <div class="modal-frame-base photo-post-frame">
      <h2 style="color: #B99B6B;">{{ PHOTO.uploadTitle }}</h2>
      <div class="file-list-area">
        <div v-if="state.photoList.length < 1">{{ PHOTO.selectPhotoMsg }}</div>
        <div v-else><div v-for="(f, i) in state.photoList" :key="i">{{ f.name }}</div></div>
      </div>
      <div class="function-btn-group">
        <std-button :click="closeUploadModal" :label="COMMON.cancel" :isInModal="true" :isOk="false" style="margin-right: 10px;"></std-button>
        <std-button v-if="state.photoList.length < 1" :label="PHOTO.selectPhoto" :isInModal="true" style="margin-left: 10px;" :click="openFolder"></std-button>
        <std-button v-else :label="COMMON.ok" :isInModal="true" :click="uploadPhoto" style="margin-left: 10px;"></std-button>
        <input type="file" ref="photoSelect" style="display: none" multiple accept=".png, .jpg, .jpeg" @change="onFileSelected"/>
      </div>
    </div>
  </background-pverlay>

  <!-- 写真アップロード成功 -->
  <modal-component v-if="state.isSuccessModalVisible"
    :title="COMMON.completed"
    :cancel="closeSuccessModal"
    :cancel-label="COMMON.close"
    :is-ok-visible="false"
  >
    <div style="color: #313131;">{{ PHOTO.uploadSuccess }}</div>
  </modal-component>
</template>


<script lang="ts">
// Vue Module
import { defineComponent, ref as vueRef, reactive, onMounted } from 'vue'
// Firebase Module
import firebase from '../api/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, getBlob, list, getMetadata, type UploadMetadata } from "firebase/storage"
// UI Components
import bg     from '@/components/BackgroudOverlay.vue'
import modal  from '@/components/ModalComponent.vue'
import header from '@/components/HeaderComponent.vue'
import btn    from '@/components/StandardButton.vue'
import spiner from '@/components/ProcessingSpiner.vue'
import { COMMON, PHOTO } from '@/constants/messages'

import api    from '@/api/axios'

// View 内変数の型宣言
interface Thumbnail {
  thumbURL: string,
  orgURL: string,
  name: string,
  frameSize: string,
  dataSize: string,
  createdAt: string
}
interface State {
  isUploadModalVisible: boolean,
  isSuccessModalVisible: boolean,
  isDownloadModalVisible: boolean,
  photoList: Array<File>,
  thumbnails: Array<Thumbnail>,
  okBtnLabel: string,
  cancelBtnLabel: string,
  photoDetails: Thumbnail,
  isOnLoading: boolean
}

const DEFAULT_THUMB = { thumbURL: '', orgURL: '', name: '', frameSize: '', dataSize: '', createdAt: '' }

export default defineComponent({
  components: {
    'header-component': header,
    'std-button': btn,
    'spiner-component': spiner,
    'background-pverlay': bg,
    'modal-component': modal
  },

  setup () {
    const state = reactive<State>({
      isUploadModalVisible: false,
      isSuccessModalVisible: false,
      isDownloadModalVisible: false,
      photoList: [],
      thumbnails: [],
      okBtnLabel: PHOTO.selectPhoto,
      cancelBtnLabel: COMMON.cancel,
      photoDetails: DEFAULT_THUMB,
      isOnLoading: false
    })
    const photoSelect = vueRef<HTMLInputElement | null>(null)
    /** ライフサイクル */
    onMounted(() => { reload() })

    const reload = () => {
      state.isOnLoading = true
      state.thumbnails = []
      const auth = getAuth()
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const photoRef = ref(firebase.storage, `photo/${user.uid}/`)
          const thumbRef = ref(firebase.storage, `photo/${user.uid}/thumb/`)
          const photoList = await list(photoRef, { maxResults: 100 })
          const thumbList = await list(thumbRef, { maxResults: 100 })
          for (const file of photoList.items) {
            const photo = { ...DEFAULT_THUMB }
            try {
              // 参照取得（サムネイル画像）
              const thumb = thumbList.items.filter(t => t.name === file.name)
              const thumbFullPath = thumb.length > 0 ? thumb[0].fullPath : ''
              if (!thumbFullPath) continue
              const thumbRef = ref(firebase.storage, thumbFullPath)
              // 参照取得（オリジナル画像）
              const photoRef = ref(firebase.storage, file.fullPath)
              // 情報の設定
              photo.name = file.name
              photo.thumbURL = await getDownloadURL(thumbRef)
              photo.orgURL = await getDownloadURL(photoRef)
              const metadata = await getMetadata(photoRef)
              photo.frameSize = metadata.customMetadata?.frameSize as string || PHOTO.noInfo
              photo.dataSize = `${Math.ceil(metadata.size / (1024 * 1024) * 100) / 100} MB`
              photo.createdAt = metadata.timeCreated
              state.thumbnails.push(photo)
            } catch (error) {
              // TODO 例外系のメタデータと画像をセット
              console.log("[echo-hub][ERROR]", error)
              state.isOnLoading = false
              continue
            }
          }
          // TODO Fetch the second page if there are more elements.
          // if (photoList.nextPageToken) {
          //   const secondPage = await list(listRef, {
          //     maxResults: 100,
          //     pageToken: photoList.nextPageToken,
          //   });
          // }
          state.isOnLoading = false
        } else {
          // TODO ユーザー情報を取得できませんでした
          state.isOnLoading = false
        }
      })
    }

    const openFolder = () => {
      photoSelect.value?.click()
    }

    const openUploadModal = () => {
      state.photoList = []
      state.isUploadModalVisible = true
    }

    const openSuccessModal = () => {
      closeUploadModal()
      state.isSuccessModalVisible = true
    }

    const openDownloadModal = (photo: Thumbnail) => {
      state.photoDetails = photo
      state.isDownloadModalVisible = true
    }

    const closeUploadModal = () => {
      state.photoList = []
      state.isUploadModalVisible = false
    }

    const closeSuccessModal = () => {
      state.isSuccessModalVisible = false
    }

    const closeDownloadModal = () => {
      state.photoDetails = DEFAULT_THUMB
      state.isDownloadModalVisible = false
    }

    const onFileSelected = (event: Event) => {
      const target = event.target as HTMLInputElement
      const photos = Array.from(target.files ?? [])
      if (photos.length > 20) {
        // TODO 一度にアップロードできる写真は20枚までです
        return
      }
      state.photoList = photos
      state.okBtnLabel = COMMON.ok
    }

    const getPhoto = async () => {
      const querySnapshot = await getDocs(collection(firebase.db, 'photo'))
      // console.log(querySnapshot.docs.map(doc => ({ ...doc.data() })));
    }

    const uploadPhoto = async () => {
      if (state.photoList.length < 1) return;
      for (const p of state.photoList) {
        const reader = new FileReader()
        reader.onload = (readerEvent) => {
          const image = new Image()
          image.onload = () => {
            upload(p, { customMetadata: {
              frameSize: `${image.width} x ${image.height}`,
              createdAt: String(p.lastModified)
            } })
          }
          image.src = readerEvent.target?.result as string
        }
        reader.readAsDataURL(p)
      }
      // try {
      //   // TODO Add ではなく、update
      //   const docRef = await addDoc(collection(firebase.db, "photo"), {
      //     title: "Test",
      //     timestamp: Date.now()
      //   });
      // } catch (err) {
      //   console.log(err)
      // }
    }

    const upload = (photo: Blob, metadata: UploadMetadata | undefined) => {
      const user = getAuth().currentUser
      if (!user) return
      const storageRef = ref(firebase.storage, `photo/${user.uid}/` + photo.name)
      try {
        uploadBytes(storageRef, photo, metadata).then((snapshot) => {
          updateUserDb()
          getDownloadURL(snapshot.ref).then(url => {
            url
            openSuccessModal()
            reload()
          })
        })
      } catch (error) {
        // TODO アップロード失敗
      }
    }

    const updateUserDb = () => {
      // TODO 現在の状態取得
      const auth = getAuth()
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const docSnap = await getDoc(doc(firebase.db, 'user', user.uid))
          const friends = docSnap.exists() ? docSnap.data().friendList : []
          const washingtonRef = doc(firebase.db, 'user', user.uid)
          await updateDoc(washingtonRef, { capital: true })
        }
      })
    }

    const download = async () => {
      getBlob(ref(firebase.storage, state.photoDetails.orgURL))
        .then(() => {
          // noop
        })
        .catch((err) => {
          console.log(err)
        })
    }

    return {
      PHOTO, COMMON, state, photoSelect,
      reload,
      openFolder,
      openUploadModal,
      openDownloadModal,
      closeUploadModal,
      closeSuccessModal,
      closeDownloadModal,
      onFileSelected,
      getPhoto,
      uploadPhoto,
      download
    }
  }
})
</script>


<style scoped>
.photo-screen-frame {
  display: block;
  margin-top: 10px;
}

.photo-header-container {
  display: flex;
  justify-content: left;
  align-items: center;
}

.photo-body-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  align-items: center;
  margin-top: 15px;
}

.thumbnail-container img {
  border-radius: 3px;
  margin-right: 20px;
  margin-top: 20px;
  transition: 0.2s ease-out;
  cursor: pointer;
}

.thumbnail-container img:hover {
  transform: scale(1.1);
}

.file-list-area {
  display: block;
  margin-left: 15px;
  margin-right: 15px;
  color: #313131;
}

.function-btn-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.modal-frame-base {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fefefe;
  border-radius: 5px;
}

.photo-post-frame {
  width: 50%;
}

.photo-detail-frame {
  width: 70%;
  max-width: 70%;
  height: 80%;
  max-height: 80%;
}

.photo-image-area {
  max-height: 80%;
}

.photo-image-style {
  max-width: 100%;
  max-height: 100%;
}

.photo-metadata-area,
.photo-operation-area {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: #313131;
  max-height: 10%;
  margin-top: 10px;
}

.photo-metadata-icon {
  display: flex;
  align-items: center;
  margin-left: 15px;
  position: relative;
}

.tooltip {
  visibility: hidden;
  width:max-content;
  background-color: #555;
  color: #eee;
  font-size: small;
  padding: 5px 10px;
  border-radius: 5px;
  position: absolute;
  z-index: 2;
  transform: translate(-50%, -100%);
  white-space: pre-line;
}

.photo-metadata-icon:hover .tooltip {
  visibility: visible;
}
</style>