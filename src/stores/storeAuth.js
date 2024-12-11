import { defineStore } from 'pinia'
import supabase from 'src/config/supabase'
import { useShowErrorMessage } from 'src/use/useShowErrorMessage'

export const useStoreAuth = defineStore('auth', () => {

  /*
    actions
  */
  
    const registerUser = async ({ email, password }) => {
      let { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) useShowErrorMessage(error.message)
      if (data) console.log('data: ', data)
    }

    const loginUser = async ({ email, password }) => {
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) useShowErrorMessage(error.message)
      if (data) console.log('data: ', data)
    }

    const logoutUser = async () => {
      let { error } = await supabase.auth.signOut()
      if (error) useShowErrorMessage(error.message)
      else console.log('User was signed out')
    }
    

  /*
    return
  */
  
    return { 

      // actions
      registerUser,
      loginUser,
      logoutUser

    }
    
})