import { defineStore } from 'pinia'
import supabase from 'src/config/supabase'
import { useShowErrorMessage } from 'src/use/useShowErrorMessage'

export const useStoreAuth = defineStore('auth', () => {

  /*
    actions
  */
  
    const init = () => {
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (session !== null) {
            console.log('User was signed in:', session)
          }
        } 
        else if (event === 'SIGNED_OUT') {
          console.log('User was signed out:', session)
        }
      })
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

      // actions
      init,
      registerUser,
      loginUser,
      logoutUser

    }
    
})