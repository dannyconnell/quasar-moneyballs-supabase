import { defineStore } from 'pinia'
import { ref, computed, reactive, nextTick } from 'vue'
import { Notify } from 'quasar'
import { useShowErrorMessage } from 'src/use/useShowErrorMessage'
import { useNonReactiveCopy } from 'src/use/useNonReactiveCopy'
import supabase from 'src/config/supabase'

export const useStoreEntries = defineStore('entries', () => {

  /*
    state
  */
  
    const entries = ref([
      // {
      //   id: 'id1',
      //   name: 'Salary',
      //   amount: 4999.99,
      //   paid: true,
      //   order: 1
      // },
      // {
      //   id: 'id2',
      //   name: 'Rent',
      //   amount: -999,
      //   paid: false,
      //   order: 2
      // },
      // {
      //   id: 'id3',
      //   name: 'Phone bill',
      //   amount: -14.99,
      //   paid: false,
      //   order: 3
      // },
      // {
      //   id: 'id4',
      //   name: 'Unknown',
      //   amount: 0,
      //   paid: false,
      //   order: 4
      // },
    ])

    const entriesLoaded = ref(false)

    const options = reactive({
      sort: false
    })


  /*
    getters
  */
  
    const balance = computed(() => {
      return entries.value.reduce((accumulator, { amount }) => {
        return accumulator + amount
      }, 0)
    })

    const balancePaid = computed(() => {
      return entries.value.reduce((accumulator, { amount, paid }) => {
        return paid ? accumulator + amount : accumulator
      }, 0)
    })

    const runningBalances = computed(() => {
      let runningBalances = [],
          currentRunningBalance = 0

      if (entries.value.length) {
        entries.value.forEach(entry => {
          let entryAmount = entry.amount ? entry.amount : 0
          currentRunningBalance = currentRunningBalance + entryAmount
          runningBalances.push(currentRunningBalance)
        })
      }

      return runningBalances
    })


  /*
    actions
  */
  
    const loadEntries = async () => {

      entriesLoaded.value = false

      let { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('order', { ascending: true })

      if (error) useShowErrorMessage(error.message)
      if (data) { 
        entries.value = data
        entriesLoaded.value = true
        subscribeEntries()
      }
    
    }

    const subscribeEntries = () => {

      supabase.channel('entries-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'entries' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              entries.value.push(payload.new)
            }
            if (payload.eventType === 'DELETE') {
              const index = getEntryIndexById(payload.old.id)
              entries.value.splice(index)
            }
            if (payload.eventType === 'UPDATE') {
              const index = getEntryIndexById(payload.new.id)
              Object.assign(entries.value[index], payload.new)
            }
          }
        )
        .subscribe()
    }

    const addEntry = async addEntryForm => {
      const newEntry = Object.assign({}, addEntryForm, { 
        paid: false,
        order: generateOrderNumber()
      })
      if (newEntry.amount ===  null) newEntry.amount = 0

      const { error } = await supabase
        .from('entries')
        .insert([
          newEntry,
        ])
        .select()

      if (error) useShowErrorMessage('Could not add entry to Supabase')
    
    }

    const deleteEntry = async entryId => {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entryId)

      if (error) useShowErrorMessage(error.message)
      else {
        removeSlideItemIfExists(entryId)
        Notify.create({
          message: 'Entry deleted',
          position: 'top'
        })
      }
    }

    const updateEntry = async (entryId, updates) => {
      const index = getEntryIndexById(entryId),
            oldEntry = useNonReactiveCopy(entries.value[index])

      Object.assign(entries.value[index], updates)

      const { error } = await supabase
        .from('entries')
        .update(updates)
        .eq('id', entryId)
        .select()

      if (error) {
        useShowErrorMessage('Entry could not be updated on Supabase')
        Object.assign(entries.value[index], oldEntry)
      }
    
    }

    const sortEnd = ({ oldIndex, newIndex }) => {
      const movedEntry = entries.value[oldIndex]
      entries.value.splice(oldIndex, 1)
      entries.value.splice(newIndex, 0, movedEntry)
    }


  /*
    helpers
  */
  
    const generateOrderNumber = () => {
      const orderNumbers = entries.value.map(entry => entry.order),
            newOrderNumber = orderNumbers.length
                             ? Math.max(...orderNumbers) + 1
                             : 1
      return newOrderNumber
    }

    const getEntryIndexById = entryId => {
      return entries.value.findIndex(entry => entry.id === entryId)
    }

    const removeSlideItemIfExists = entryId => {
      // hacky fix: when deleting (after sorting),
      // sometimes the slide item is not removed
      // from the dom. this will remove the slide
      // item from the dom if it still exists
      // (after entry removed from entries array)
      nextTick(() => {
        const slideItem = document.querySelector(`#id-${ entryId }`)
        if (slideItem) slideItem.remove()
      })
    }


  /*
    return
  */
  
    return { 

      // state
      entries,
      entriesLoaded,
      options,

      // getters
      balance,
      balancePaid,
      runningBalances,

      // actions
      loadEntries,
      addEntry,
      deleteEntry,
      updateEntry,
      sortEnd

    }
    
})