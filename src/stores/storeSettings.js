import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'
import { Dark, LocalStorage } from 'quasar'
import { useStoreAuth } from 'src/stores/storeAuth'
import { useShowErrorMessage } from 'src/use/useShowErrorMessage'
import supabase from 'src/config/supabase'

export const useStoreSettings = defineStore('settings', () => {

  /*
    state
  */
  
    const settings = reactive({
      promptToDelete: true,
      showRunningBalance: false,
      currencySymbol: '$',
      darkMode: false // false | true | 'auto'
    })

    // watch darkMode
    watch(() => settings.darkMode, value => {
      Dark.set(value)
    }, { immediate: true })

    // watch settings
    watch(settings, () => {
      saveSettings()
    })

    // profile
    const profileDefault = {
      avatarFile: null,
      avatarUrl: null,
      bio: ''
    }
    const profile = reactive({
      ...profileDefault
    })


  /*
    getters
  */
  


  /*
    actions
  */
  
    const saveSettings = () => {
      LocalStorage.set('settings', settings)
    }

    const loadSettings = () => {
      const savedSettings = LocalStorage.getItem('settings')
      if (savedSettings) Object.assign(settings, savedSettings)
    }

    const uploadAvatar = async file => {

      const storeAuth = useStoreAuth(),
            folderPath = storeAuth.userDetails.id,
            fileName = `${ Date.now() }_${ file.name.replaceAll(' ', '_')}`

      const { data, error } = await supabase
        .storage
        .from('avatars')
        .upload(`${ folderPath }/${ fileName }`, file)

      if (error) useShowErrorMessage(error.message)
      if (data) {
        const avatarFilename = data.fullPath.split('/').pop()
        saveAvatarFilename(avatarFilename)
      }
      
    }

    const saveAvatarFilename = async avatarFilename => {

      const storeAuth = useStoreAuth()

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: storeAuth.userDetails.id, 
          avatar_filename: avatarFilename 
        })
        .select()

      if (error) useShowErrorMessage('Could not upsert row on profiles table.')
      if (data) {
        getProfile()
      }
      
    }

    const saveBio = async () => {
      const storeAuth = useStoreAuth()

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: storeAuth.userDetails.id, 
          bio: profile.bio
        })
        .select()

      if (error) useShowErrorMessage('Could not upsert Bio on profiles table.')
      if (data) {
        console.log('data: ', data)
      }
    }

    const getProfile = async () => {

      const storeAuth = useStoreAuth()

      let { data: profiles, error } = await supabase
        .from('profiles')
        .select("*")
        .eq('id', storeAuth.userDetails.id)

      if (error) useShowErrorMessage('Could not get Profile from Supabase.')

      if (profiles) {
        if (profiles[0]?.bio) {
          profile.bio = profiles[0].bio
        }
        if (profiles[0]?.avatar_filename) {
          const avatarFilename = profiles[0].avatar_filename

          profile.avatarUrl = `${ process.env.SUPABASE_URL }/storage/v1/object/public/avatars/${ storeAuth.userDetails.id }/${ avatarFilename }`
        }
      }
    }

    const resetProfile = () => {
      Object.assign(profile, profileDefault)
    }


  /*
    return
  */
  
    return { 

      // state
      settings,
      profile,

      // getters

      // actions
      loadSettings,
      uploadAvatar,
      saveBio,
      getProfile,
      resetProfile

    }
    
})