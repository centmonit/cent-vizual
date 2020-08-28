export var appMixins = {
  data () {
    return {
      VUE_APP_SUPPORT_EMAIL: process.env.VUE_APP_SUPPORT_EMAIL
    }
  },
  created: function () {
  },
  methods: {
    MixClipboardCopy (fieldID) {
      var item = document.getElementById(fieldID)
      item.setAttribute('type', 'text')
      item.select()
      let cmdOK = document.execCommand('copy')
      item.setAttribute('type', 'hidden')
      if (cmdOK) {
        this.$toast.open({
          message: 'Copied to clipboard',
          type: 'default',
          duration: 2000
        })
      }
    }
  }
}
