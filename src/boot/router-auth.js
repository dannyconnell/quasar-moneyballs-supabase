import { boot } from 'quasar/wrappers'

export default boot(({ router }) => {
  router.beforeEach((to, from) => {
    console.log('from: ', from)
    console.log('to: ', to)
  })
})