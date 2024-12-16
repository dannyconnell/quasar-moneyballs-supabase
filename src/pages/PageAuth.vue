<template>
  <q-page class="flex flex-center">
    <q-card
      class="auth bg-primary text-white q-pa-lg"
    >
      <q-card-section>
        <ToolbarTitle />
      </q-card-section>

      <q-card-section class="q-pb-none">
        <q-banner
          :class="{ 'fade-in' : entriesCount }"
          class="entries-count bg-primary text-white text-center text-italic"
        >
          <div>Over {{ entriesCount }} Entries have been</div>
          <div>created with Moneyballs!</div>
        </q-banner>
      </q-card-section>

      <q-card-section>
        <q-tabs
          v-model="tab"
          no-caps
        >
          <q-tab name="login" label="Login" />
          <q-tab name="register" label="Register" />
        </q-tabs>
      </q-card-section>

      <q-card-section>
        <q-form
          @submit="formSubmit"
        >
          <q-input
            v-model="credentials.email"
            class="q-mb-md"
            :bg-color="useLightOrDark('white', 'black')"
            label="Email"
            type="email"
            autocomplete="email"
            filled
          />
          <q-input
            v-model="credentials.password"
            class="q-mb-md"
            :bg-color="useLightOrDark('white', 'black')"
            label="Password"
            type="password"
            autocomplete="current-password"
            filled
          />
          <q-btn
            class="full-width"
            color="white"
            type="submit"
            :label="submitButtonTitle"
            outline
            no-caps
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>


<script setup>

  /*
    imports
  */
  
    import { ref, computed, reactive, onMounted } from 'vue'
    import { useQuasar } from 'quasar'
    import supabase from 'src/config/supabase'
    import { useStoreAuth } from 'src/stores/storeAuth'
    import { useLightOrDark } from 'src/use/useLightOrDark'
    import { useShowErrorMessage } from 'src/use/useShowErrorMessage'
    import ToolbarTitle from 'src/components/Layout/ToolbarTitle.vue'


  /*
    stores
  */
  
    const storeAuth = useStoreAuth()  


  /*
    quasar
  */
  
    const $q = useQuasar()  


  /*
    entries count
  */
  
    const entriesCount = ref(null)

    onMounted(async () => {
      let { data: stats, error } = await supabase
        .from('stats')
        .select("*")
        .eq('name', 'entries_count')

      if (error) useShowErrorMessage(error.message)
      if (stats) {
        entriesCount.value = stats[0].value
      }
    })

  /*
    tabs
  */
  
    const tab = ref('login')

  
  /*
    submit button title
  */
  
    const submitButtonTitle = computed(() => {
      return tab.value === 'login' ? 'Login' : 'Register'
    })


  /*
    form
  */
  
    const credentials = reactive({
      email: '',
      password: ''
    })

    const formSubmit = () => {
      if (!credentials.email || !credentials.password) {
        $q.dialog({
          title: 'Error',
          message: 'Please enter an email & password motherflipper!'
        })
      }
      else {
        formSubmitSuccess()
      }
    }

    const formSubmitSuccess = () => {
      if (tab.value === 'register') {
        storeAuth.registerUser(credentials)
      }
      else {
        storeAuth.loginUser(credentials)
      }
    }

</script>