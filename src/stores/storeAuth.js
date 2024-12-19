import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import supabase from 'src/config/supabase'
import { useStoreEntries } from 'src/stores/storeEntries'
import { useStoreSettings } from 'src/stores/storeSettings'
import { useShowErrorMessage } from 'src/use/useShowErrorMessage'

export const useStoreAuth = defineStore('auth', () => {

  /*
    state
  */
  
    const userDetailsDefault = {
      id: null,
      email: null
    }

    const userDetails = reactive({
      ...userDetailsDefault
    })

    const seenGreeting = ref(false)


  /*
    actions
  */
  
    const init = () => {
      const router = useRouter(),
            storeEntries = useStoreEntries(),
            storeSettings = useStoreSettings()

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (session !== null) {
            userDetails.id = session.user.id
            userDetails.email = session.user.email
            router.push('/') 
            storeSettings.getProfile()
            storeEntries.loadEntries()
            showGreeting(session.access_token)
          }
        } 
        else if (event === 'SIGNED_OUT') {
          Object.assign(userDetails, userDetailsDefault)
          router.replace('/auth')
          storeSettings.resetProfile()
          storeEntries.unsubscribeEntries()
          storeEntries.clearEntries()
        }
      })
    }

    const showGreeting = async (access_token) => {
      const myHeaders = new Headers()
      myHeaders.append('Authorization', `Bearer ${ access_token }`)
      
      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      }
      
      try {
        const response = await fetch('http://127.0.0.1:54321/functions/v1/greeting', requestOptions)
        const result = await response.json()
        if (!seenGreeting.value) {
          Notify.create({
            message: result.greeting,
            position: 'top'
          })
          seenGreeting.value = true
        }
      } catch (error) {
        console.error(error)
      }
    }

    const registerUser = async ({ email, password }) => {
      let { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) useShowErrorMessage(error.message)
      // if (data) console.log('data: ', data)
    }

    const loginUser = async ({ email, password }) => {
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) useShowErrorMessage(error.message)
      // if (data) console.log('data: ', data)
    }

    const logoutUser = async () => {
      let { error } = await supabase.auth.signOut()
      if (error) useShowErrorMessage(error.message)
      // else console.log('User was signed out')
    }
    

  /*
    return
  */
  
    return { 

      // state
      userDetails,

      // actions
      init,
      registerUser,
      loginUser,
      logoutUser

    }
    
})